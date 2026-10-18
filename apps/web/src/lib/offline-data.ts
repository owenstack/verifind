import { createStore, del, get, set } from "idb-keyval";
import { clearUserOfflineData } from "./offline-persistence";

const EVENT_NAME = "verifind:offline-data-changed";
const DRAFT_TTL_MS = 1000 * 60 * 60 * 24 * 14;

export interface OfflineMutation {
	attempts: number;
	createdAt: number;
	id: string;
	idempotencyKey: string;
	kind: string;
	payload: unknown;
}

interface FormDraft {
	data: unknown;
	expiresAt: number;
	formId: string;
	updatedAt: number;
}

type MutationHandler = (mutation: OfflineMutation) => Promise<void>;

const mutationHandlers = new Map<string, MutationHandler>();
const activeDrains = new Map<string, Promise<void>>();

function store(ownerId: string, name: string) {
	return createStore(`verifind-${encodeURIComponent(ownerId)}`, name);
}

function announceChange(): void {
	window.dispatchEvent(new Event(EVENT_NAME));
}

function makeId(): string {
	return (
		crypto.randomUUID?.() ??
		`${Date.now()}-${Math.random().toString(36).slice(2)}`
	);
}

export async function saveFormDraft(
	ownerId: string,
	formId: string,
	data: unknown
): Promise<void> {
	const draft: FormDraft = {
		formId,
		data,
		updatedAt: Date.now(),
		expiresAt: Date.now() + DRAFT_TTL_MS,
	};
	await set(formId, draft, store(ownerId, "drafts"));
}

export async function loadFormDraft(
	ownerId: string,
	formId: string
): Promise<FormDraft["data"] | undefined> {
	const draft = await get<FormDraft>(formId, store(ownerId, "drafts"));
	if (!draft) {
		return undefined;
	}
	if (draft.expiresAt < Date.now()) {
		await del(formId, store(ownerId, "drafts"));
		return undefined;
	}
	return draft.data;
}

export function registerOfflineMutationHandler(
	kind: string,
	handler: MutationHandler
): () => void {
	mutationHandlers.set(kind, handler);
	return () => {
		if (mutationHandlers.get(kind) === handler) {
			mutationHandlers.delete(kind);
		}
	};
}

export async function enqueueOfflineMutation(
	ownerId: string,
	kind: string,
	payload: unknown
): Promise<OfflineMutation> {
	const queueStore = store(ownerId, "mutation-queue");
	const mutation: OfflineMutation = {
		id: makeId(),
		kind,
		payload,
		idempotencyKey: makeId(),
		createdAt: Date.now(),
		attempts: 0,
	};
	const existing = (await get<OfflineMutation[]>("queue", queueStore)) ?? [];
	await set("queue", [...existing, mutation], queueStore);
	announceChange();
	return mutation;
}

export async function getPendingMutationCount(
	ownerId: string
): Promise<number> {
	const queue =
		(await get<OfflineMutation[]>("queue", store(ownerId, "mutation-queue"))) ??
		[];
	return queue.length;
}

export function drainOfflineMutations(ownerId: string): Promise<void> {
	if (!navigator.onLine) {
		return Promise.resolve();
	}
	const activeDrain = activeDrains.get(ownerId);
	if (activeDrain) {
		return activeDrain;
	}

	const drain = async () => {
		const queueStore = store(ownerId, "mutation-queue");
		const pending = (await get<OfflineMutation[]>("queue", queueStore)) ?? [];
		const remaining: OfflineMutation[] = [];
		let failed = false;

		for (const mutation of pending) {
			if (failed) {
				remaining.push(mutation);
				continue;
			}
			const handler = mutationHandlers.get(mutation.kind);
			if (!handler) {
				remaining.push(mutation);
				continue;
			}
			try {
				// Keep mutations sequential so a failed earlier write preserves queue order.
				// biome-ignore lint/performance/noAwaitInLoops: order matters for queued changes.
				await handler(mutation);
			} catch {
				failed = true;
				remaining.push({ ...mutation, attempts: mutation.attempts + 1 });
			}
		}

		await set("queue", remaining, queueStore);
		announceChange();
	};

	const promise = drain().finally(() => activeDrains.delete(ownerId));
	activeDrains.set(ownerId, promise);
	return promise;
}

export function subscribeOfflineData(callback: () => void): () => void {
	window.addEventListener(EVENT_NAME, callback);
	return () => window.removeEventListener(EVENT_NAME, callback);
}

export async function clearOfflineData(ownerId: string): Promise<void> {
	await clearUserOfflineData(ownerId);
	announceChange();
}
