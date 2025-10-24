/**
 * @template T
 */
export class Deferred{
    /**
     * @type {boolean}
     */
    loading;
    /**
     * @type {?T}
     */
    data;

    /**
     * @type {?Error}
     */
    error;

    /**
     *
     * @param {boolean} loading
     * @param {?T} data
     * @param {?Error} error
     */
    constructor(loading, data, error){
        this.loading = loading;
        this.data = data;
        this.error = error;
    }
}