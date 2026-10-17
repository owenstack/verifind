/** biome-ignore-all lint/performance/noNamespaceImport: <effect> */
import * as Alchemy from "alchemy";
import * as Axiom from "alchemy/Axiom";
import * as Cloudflare from "alchemy/Cloudflare";
import * as Output from "alchemy/Output";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import "varlock/auto-load";

export const db = Cloudflare.D1.Database("database", {
	migrations: "../../packages/db/src/migrations",
});

const serverUrl = (url: string) =>
	process.env.NODE_ENV === "production"
		? "https://api.verifind.efobi.dev"
		: url;

export const observability = Effect.gen(function* () {
	const { stage } = yield* Alchemy.Stack;
	const datasetName = `verifind-${stage}-logs`;

	const dataset = yield* Axiom.Dataset("logs", {
		name: datasetName,
		kind: "axiom:events:v1",
		description: "verifind application logs",
	});
	const ingest = yield* Axiom.ApiToken("logs-ingest", {
		name: `verifind-${stage}-logs-ingest`,
		datasetCapabilities: {
			[datasetName]: {
				ingest: ["create"],
			},
		},
	});

	return {
		dataset,
		runtimeEnv: {
			AXIOM_API_KEY: ingest.token,
			AXIOM_DATASET: dataset.name,
			AXIOM_EDGE_URL: dataset.edgeDeploymentUrl,
		},
	};
});

export const observabilityEnv = observability.pipe(
	Effect.map(({ runtimeEnv }) => runtimeEnv)
);

export const observabilityBindings = {
	AXIOM_API_KEY: observabilityEnv.pipe(
		Effect.map(({ AXIOM_API_KEY }) => AXIOM_API_KEY)
	),
	AXIOM_DATASET: observabilityEnv.pipe(
		Effect.map(({ AXIOM_DATASET }) => AXIOM_DATASET)
	),
	AXIOM_EDGE_URL: observabilityEnv.pipe(
		Effect.map(({ AXIOM_EDGE_URL }) => AXIOM_EDGE_URL)
	),
};

export const server = Cloudflare.Worker("server", {
	main: "../../apps/server/src/index.ts",
	compatibility: {
		flags: ["nodejs_compat"],
	},
	env: {
		DB: db,
		NODE_ENV: Config.withDefault(Config.String("NODE_ENV"), "development"),
		BETTER_AUTH_SECRET: Config.Redacted("BETTER_AUTH_SECRET"),
		BETTER_AUTH_URL: Cloudflare.Worker.URL,
		...observabilityBindings,
	},
	dev: {
		port: 3000,
	},
});

export type ServerEnv = Cloudflare.InferEnv<typeof server>;

export default Alchemy.Stack(
	"verifind",
	{
		providers: Layer.mergeAll(Cloudflare.providers(), Axiom.providers()),
		state: Cloudflare.state(),
	},
	Effect.gen(function* () {
		const observabilityResources = yield* observability;
		const serverWorker = yield* server;
		const webWorker = yield* Cloudflare.Website.Vite("web", {
			rootDir: "../../apps/web",
			assets: {
				htmlHandling: "auto-trailing-slash",
				notFoundHandling: "single-page-application",
			},
			env: {
				VITE_SERVER_URL: Output.map(serverWorker.url.as<string>(), serverUrl),
			},
			dev: {
				port: 3001,
			},
		});

		return {
			web: webWorker.url,
			server: serverWorker.url,
			axiomDataset: observabilityResources.dataset.name,
		};
	})
);
