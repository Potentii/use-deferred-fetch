export default class Deferred<T> {
    constructor(loading: boolean, data: T | null, error: Error | null)

    /** Whether the value is currently being loaded */
    loading: boolean

    /** The loaded value, or null if not loaded or on error */
    data: T | null

    /** The error, if any */
    error: Error | null

    /**
     * Map the data of the deferred to a new value
     */
    map<U>(mapFn: (data: T) => U): Deferred<U>

    /**
     * Flatten the deferred value if it is another deferred
     */
    flat(): T extends Deferred<infer U> ? Deferred<U> : Deferred<T>
}
