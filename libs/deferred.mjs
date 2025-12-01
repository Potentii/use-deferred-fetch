/**
 * @template K, V
 */
export default class Deferred{

    /**
     * @type {K}
     */
    id;

    /**
     * @type {boolean}
     */
    loading;

    /**
     * @type {?V}
     */
    data;

    /**
     * @type {?Error}
     */
    error;

    /**
     *
     * @param {K} id
     * @param {boolean} loading
     * @param {?V} [data]
     * @param {?Error} [error]
     */
    constructor(id, loading, data, error){
        this.id = id;
        this.loading = loading;
        this.data = data;
        this.error = error;
    }

    /**
     *
     * @param {K} id
     * @param {V} data
     * @return {Deferred<K,V>}
     */
    static resolved(id, data){
        return new Deferred(id, false, data, null);
    }

    /**
     *
     * @param {K} id
     * @param {Error} error
     * @return {Deferred<K,V>}
     */
    static rejected(id, error){
        return new Deferred(id, false, null, error);
    }


    /**
     *
     * @param {boolean} loading
     * @return {Deferred<K,V>}
     */
    withLoading(loading){
        return new Deferred(this.id, loading, this.data, this.error);
    }

    /**
     *
     * @param {V} data
     * @return {Deferred<K,V>}
     */
    withData(data){
        return new Deferred(this.id, this.loading, data, this.error);
    }

    /**
     *
     * @param {?Error} error
     * @return {Deferred<K,V>}
     */
    withError(error){
        return new Deferred(this.id, this.loading, this.data, error);
    }



    /**
     * @param {V} data
     */
    resolve(data){
        this.loading = false;
        this.data = data;
    }

    /**
     * @param {Error} error
     */
    reject(error){
        this.loading = false;
        this.error = error;
    }

}