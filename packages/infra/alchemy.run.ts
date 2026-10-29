/** biome-ignore-all lint/performance/noNamespaceImport: <effect> */

import * as Axiom from "@alchemy.run/axiom";
import * as Cloudflare from "@alchemy.run/cloudflare";
import * as Alchemy from "alchemy";
import * as Output from "alchemy/Output";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import "varlock/auto-load";

export const db = Cloudflare.D1.Database("database", {
	migrations: "../../packages/db/src/migrations",
});

const serverUrl = (url: string, stage: string) =>
	stage === "prod" || stage === "production"
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
		GOOGLE_CLIENT_SECRET: Config.Redacted("GOOGLE_CLIENT_SECRET"),
		GOOGLE_CLIENT_ID: Config.Redacted("GOOGLE_CLIENT_ID"),
		RESEND_API_KEY: Config.Redacted("RESEND_API_KEY"),
		...observabilityBindings,
	},
	dev: {
		port: 3000,
	},
});

export type ServerEnv = Cloudflare.InferEnv<typeof server>;

// Profile commands only need the auth-provider registry, which Alchemy loads
// separately. Building Axiom's resource provider layer here eagerly resolves
// the Axiom credentials before `profile edit` can configure them.
const providers =
	process.argv[2] === "profile"
		? Cloudflare.providers()
		: Layer.mergeAll(Cloudflare.providers(), Axiom.providers());

export default Alchemy.Stack(
	"verifind",
	{
		providers,
		state: Cloudflare.state(),
	},
	Effect.gen(function* () {
		const observabilityResources = yield* observability;
		const serverWorker = yield* server;
		const { stage } = yield* Alchemy.Stack;
		const webWorker = yield* Cloudflare.Website.Vite("web", {
			rootDir: "../../apps/web",
			assets: {
				htmlHandling: "auto-trailing-slash",
				notFoundHandling: "single-page-application",
			},
			env: {
				VITE_SERVER_URL: Output.map(serverWorker.url.as<string>(), (url) =>
					serverUrl(url, stage)
				),
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
