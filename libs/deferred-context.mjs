import {ref} from "vue";
import Deferred from "./deferred.mjs";


/**
 * @template K, V
 * @typedef {{
 *     resolve: (id: K) => (Promise<V>|V),
 *     logErrors: ?boolean,
 * }} DeferredContextOpts
 */


/**
 * @template K, V
 */
export default class DeferredContext {

    /**
     *
     * @type {import('vue').Ref<Map<K,Deferred<K,V>>>}
     */
    #deferredById = ref(new Map());


    /**
     *
     * @type {?DeferredContextOpts<K,V>}
     */
    #opts;



    /**
     *
     * @param {?DeferredContextOpts<K,V>} [opts]
     */
    constructor(opts) {
        this.#opts = opts;
    }



    /**
     *
     * @param {Deferred<K,V>} deferred
     * @return {Promise<void>}
     */
    async #tryResolve(deferred){
        try {
            this.#deferredById.value.set(deferred.id, deferred.withLoading(true));
            const data = await this.#opts.resolve(deferred.id);
            this.#deferredById.value.set(deferred.id, Deferred.resolved(deferred.id, data));
        } catch (err) {
            if(this.#opts.logErrors)
                console.error(err);
            this.#deferredById.value.set(deferred.id, Deferred.rejected(deferred.id, err));
        }
    }



    /**
     *
     * @param {K} id
     * @returns {Deferred<K, V>}
     */
    getById(id){
        if(!this.#deferredById.value.has(id)){
            // *Queueing request if not created yet:
            const deferred = new Deferred(id, true);
            this.#deferredById.value.set(id, deferred);
            this.#tryResolve(deferred); // Not awaiting the Promise
        }

        return this.#deferredById.value.get(id);
    }



    /**
     *
     * @param {K} id
     * @param {V} data
     */
    upsertResolved(id, data){
        this.#deferredById.value.set(id, Deferred.resolved(id, data));
    }



    /**
     *
     * @param {K} id
     * @param {Error} error
     */
    upsertRejected(id, error){
        this.#deferredById.value.set(id, Deferred.rejected(id, error));
    }



    /**
     *
     * @param {Deferred<K,V>} deferred
     */
    upsert(deferred){
        this.#deferredById.value.set(deferred.id, deferred);
    }



    /**
     *
     * @param {K} id
     */
    removeById(id){
        this.#deferredById.value.delete(id);
    }



    /**
     *
     * @param {K} id
     */
    invalidateById(id){
        let deferred;
        if(this.#deferredById.value.has(id)){
            deferred = this.#deferredById.value.get(id);
            this.#deferredById.value.set(deferred.id, deferred.withLoading(true));
        } else{
            deferred = new Deferred(id, true);
            this.#deferredById.value.set(id, deferred);
        }

        this.#tryResolve(this.#deferredById.value.get(id)); // Not awaiting the Promise
    }

}