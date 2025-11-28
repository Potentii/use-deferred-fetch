import type {ComputedRef} from 'vue'
import Deferred from './deferred'

export interface DeferredContextOpts<T, U> {
    /**
     * Called when there are pending ids to be fetched.
     * Implementations should resolve or reject each id.
     */
    onRequested: (
        ids: U[],
        resolveItem: (id: U, item: T) => void,
        rejectItem: (id: U, error: Error) => void
    ) => any

    /** Returns the id for a given item */
    getId: (item: T) => U

    /** Maximum number of items to request in one batch (if implemented by user). */
    maxItemsPerRequest?: number

    /** Maximum time the debounce can wait before forcing a request (ms). */
    debounceMaxWait?: number

    /** Debounce delay between requests (ms). */
    debounceDelay?: number
}

export default class DeferredContext<T, U> {
    constructor(opts?: DeferredContextOpts<T, U> | null)

    /** Request a single item by id. May trigger a deferred fetch. */
    getItemById(id: U): Deferred<T>

    /** Insert or update items in the internal cache. */
    upsertItems(items: T[]): void

    /** Remove items from the internal cache. */
    removeItems(items: T[]): void

    /** Remove items by their ids from the internal cache. */
    removeItemsById(ids: U[]): void

    /** Mark the given items as stale and schedule refetch. */
    invalidateItems(items: T[]): void

    /** Mark the given ids as stale and schedule refetch. */
    invalidateItemsById(ids: U[]): void

    /** Map of loaded items indexed by id. */
    readonly loadedByIds: ComputedRef<Map<U, T>>

    /** Array of loaded ids. */
    readonly loadedIds: ComputedRef<U[]>

    /** Array of loaded items. */
    readonly loadedItems: ComputedRef<T[]>
}
