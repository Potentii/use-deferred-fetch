import {ref} from "vue";
import {useDebounceFn} from "@vueuse/core";
import Deferred from "./deferred.mjs";


/**
 * @template K, V
 * @typedef {{
 *  onRequested: (deferreds: Deferred<K,V>[]) => (Promise<(?(Deferred<K,V>[])|void)>|?(Deferred<K,V>[])|void),
 *  debounceMaxWait: number,
 *  debounceDelay: number,
 * }} DeferredContextOpts
 */



const DEFAULT_DEBOUNCE_DELAY = 300;
const DEFAULT_MAX_WAIT = 3000;




/**
 * @template K, V
 */
export default class DeferredContext {

    /**
     *
     * @type {import('vue').Ref<Set<K>>}
     */
    #pendingIds = ref(new Set());

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
     * @type {import("@vueuse/core").UseDebounceFnReturn<() => Promise<void>>}
     */
    #debouncedFetch;






    /**
     *
     * @return {Promise<void>}
     */
    async #debounceFn(){
        if (this.#pendingIds.value.size === 0) return;

        const pendingDeferreds = [...this.#pendingIds.value]
            .map(pendingId => this.#deferredById.value.get(pendingId));

        this.#pendingIds.value.clear();

        try {

            const result = await this.#opts.onRequested(pendingDeferreds);

            if(Array.isArray(result)){
                for (let deferred of result) {
                    if(!deferred)
                        continue;
                    if(deferred instanceof Deferred){
                        deferred.loading = false;
                        this.upsert(deferred);
                    } else{
                        throw new TypeError("onRequested optional return must be an array of Deferreds");
                    }
                }
            }
        } catch (err) {
            for (let deferred of pendingDeferreds) {
                deferred.loading = false;
                deferred.error = err;
            }
        }


    }




    /**
     *
     * @param {?DeferredContextOpts<K,V>} [opts]
     */
    constructor(opts) {
        this.#opts = opts;

        const debounceDelay = this.#opts?.debounceDelay ?? DEFAULT_DEBOUNCE_DELAY;
        const debounceMaxWait = this.#opts?.debounceMaxWait ?? DEFAULT_MAX_WAIT;

        this.#debouncedFetch = useDebounceFn(this.#debounceFn, debounceDelay, { maxWait: debounceMaxWait });
    }



    /**
     *
     * @param {K} id
     * @returns {Deferred<K, V>}
     */
    getById(id){
        if(!this.#deferredById.value.has(id)){
            // *Queueing request if not created yet:
            this.#deferredById.value.set(id, new Deferred(id, true));
            this.#pendingIds.value.add(id);

            this.#debouncedFetch(); // Not awaiting the Promise
        }

        return this.#deferredById.value.get(id);
    }



    /**
     *
     * @param {Deferred<K,V>} deferred
     */
    upsert(deferred){
        if(!deferred)
            throw new TypeError("Deferred must not be null");
        if(deferred.loading)
            throw new Error("Deferred must not be loading");

        const id = deferred.id;
        this.#deferredById.value.set(id, deferred);
        this.#pendingIds.value.delete(id);
    }



    /**
     *
     * @param {K} id
     */
    removeById(id){
        this.#pendingIds.value.delete(id);
        this.#deferredById.value.delete(id);
    }



    /**
     *
     * @param {K} id
     */
    invalidateById(id){
        if(this.#deferredById.value.has(id)){
            this.#deferredById.value.get(id).loading = true;
        } else{
            this.#deferredById.value.set(id, new Deferred(id, true));
        }

        this.#pendingIds.value.add(id);

        this.#debouncedFetch(); // Not awaiting the Promise
    }

}