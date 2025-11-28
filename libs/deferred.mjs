/**
 * @template T
 */
export default class Deferred{

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


    /**
     * Map the data of the deferred to a new value
     * @template T
     * @template U
     * @param {(data:T) => U} mapFn
     * @return {Deferred<U>}
     */
    map(mapFn){
        if(this.data)
            return new Deferred(this.loading, mapFn(this.data), this.error);
        return this;
    }


    /**
     * Flatten the deferred value if it is another deferred
     * @return {Deferred<T.data>}
     */
    flat(){
        if(this.data instanceof Deferred)
            return new Deferred(this.data.loading, this.data.data, this.data.error);
        return this;
    }


}