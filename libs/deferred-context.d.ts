import Deferred from './deferred'

export interface DeferredContextOpts<K, V> {
    /**
     * Resolver called to fetch the value for a given id.
     */
    resolve: (id: K) => Promise<V> | V
}

export default class DeferredContext<K, V> {
    constructor(opts?: DeferredContextOpts<K, V> | null)

    /** Request a single deferred value by id. Triggers a fetch if not cached. */
    getById(id: K): Deferred<K, V>

    /** Upsert a resolved value for id. */
    upsertResolved(id: K, data: V): void

    /** Upsert a rejected value for id. */
    upsertRejected(id: K, error: Error): void

    /** Insert or update a single Deferred in the internal cache. */
    upsert(deferred: Deferred<K, V>): void

    /** Remove a value from the internal cache by id. */
    removeById(id: K): void

    /** Mark the given id as stale and refetch. */
    invalidateById(id: K): void
}
