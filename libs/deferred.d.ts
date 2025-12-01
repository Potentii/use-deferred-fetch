export default class Deferred<K, V> {
    constructor(id: K, loading: boolean, data?: V | null, error?: Error | null)

    /** The id of the deferred value */
    id: K

    /** Whether the value is currently being loaded */
    loading: boolean

    /** The loaded value, or null/undefined if not loaded or on error */
    data: V | null | undefined

    /** The error, if any */
    error: Error | null | undefined

    /** Create a resolved Deferred with data */
    static resolved<K, V>(id: K, data: V): Deferred<K, V>

    /** Create a rejected Deferred with error */
    static rejected<K, V>(id: K, error: Error): Deferred<K, V>

    /** Return a new Deferred with updated loading flag */
    withLoading(loading: boolean): Deferred<K, V>

    /** Return a new Deferred with updated data */
    withData(data: V): Deferred<K, V>

    /** Return a new Deferred with updated error */
    withError(error: Error | null): Deferred<K, V>

    /** Resolve this deferred with data */
    resolve(data: V): void

    /** Reject this deferred with an error */
    reject(error: Error): void
}
