import {computed, ref} from "vue";
import {useDebounceFn} from "@vueuse/core";
import Deferred from "./deferred.mjs";


/**
 * @template T, U
 * @typedef {{
 *  onRequested: (ids: U[], resolveItem: (id: U, item: T) => void, rejectItem: (id: U, error: Error) => void) => any,
 *  getId: (T) => U,
 *  maxItemsPerRequest: number,
 *  debounceMaxWait: number,
 *  debounceDelay: number,
 * }} DeferredContextOpts
 */



const DEFAULT_DEBOUNCE_DELAY = 300;
const DEFAULT_MAX_WAIT = 3000;




/**
 * @template T, U
 */
export default class DeferredContext {

    /**
     *
     * @type {import('vue').Ref<Map<U, T>>}
     */
    #itemsById = ref(new Map());
    /**
     *
     * @type {import('vue').Ref<Map<U, Error>>}
     */
    #errorsById = ref(new Map());
    /**
     *
     * @type {import('vue').Ref<Set<U>>}
     */
    #pendingIds = ref(new Set());
    /**
     *
     * @type {import('vue').Ref<Map<U, boolean>>}
     */
    #loadingStates = ref(new Map());


    /**
     *
     * @type {?DeferredContextOpts<T,U>}
     */
    #opts;





    /**
     *
     * @type {import("@vueuse/core").UseDebounceFnReturn<() => Promise<void>>}
     */
    #debouncedFetch;



    /**
     *
     * @param {U} id
     * @param {T} item
     */
    #resolveItem(id, item){
        this.#itemsById.value.set(id, item);
        this.#loadingStates.value.set(id, false);
    };

    /**
     *
     * @param {U} id
     * @param {Error} error
     */
    #rejectItem(id, error){
        this.#errorsById.value.set(id, error);
        this.#loadingStates.value.set(id, false);
    };



    /**
     *
     * @param {?DeferredContextOpts<T,U>} [opts]
     */
    constructor(opts) {
        this.#opts = opts;


        const debounceDelay = this.#opts?.debounceDelay ?? DEFAULT_DEBOUNCE_DELAY;
        const debounceMaxWait = this.#opts?.debounceMaxWait ?? DEFAULT_MAX_WAIT;


        this.#debouncedFetch = useDebounceFn(async () => {
            if (this.#pendingIds.value.size === 0) return;

            const idsToFetch = Array.from(this.#pendingIds.value);
            this.#pendingIds.value.clear();

            try {
                await this.#opts.onRequested(idsToFetch, this.#resolveItem, this.#rejectItem);
            } catch (err) {
                for (let id of idsToFetch) {
                    this.#rejectItem(id, err);
                }
            }

        }, debounceDelay, { maxWait: debounceMaxWait });
    }



    /**
     *
     * @param {U} id
     * @returns {Deferred<T>}
     */
    getItemById(id){
        // *Returning existing item if we have it:
        if (this.#itemsById.value.has(id))
            return new Deferred(this.#loadingStates.value.get(id), this.#itemsById.value.get(id), null);

        // *Ignoring request if already loading:
        if (this.#loadingStates.value.get(id))
            return new Deferred(true, this.#itemsById.value.get(id) || null, null);

        // *Queueing request if not pending yet:
        if (!this.#pendingIds.value.has(id)) {
            this.#pendingIds.value.add(id);
            this.#loadingStates.value.set(id, true);
            this.#debouncedFetch(); // Not awaiting the Promise
        }

        // *Returning loading state while waiting:
        return new Deferred(true, null, null);
    }


    /**
     *
     * @param {T[]} items
     */
    upsertItems(items){
        for(const item of items){
            const id = this.#opts.getId(item);
            if(this.#pendingIds.value.has(id))
                this.#pendingIds.value.delete(id);

            this.#itemsById.value.set(id, item);
            this.#loadingStates.value.set(id, false);
        }
    }


    /**
     *
     * @param {T[]} items
     */
    removeItems(items){
        this.removeItemsById(items.map(item => this.#opts.getId(item)));
    }
    /**
     *
     * @param {U[]} ids
     */
    removeItemsById(ids){
        for(const id of ids)
            this.#itemsById.value.delete(id);
    }


    /**
     *
     * @param {T[]} items
     */
    invalidateItems(items){
        this.invalidateItemsById(items.map(item => this.#opts.getId(item)));
    }
    /**
     *
     * @param {U[]} ids
     */
    invalidateItemsById(ids){
        for(const id of ids) {
            this.#pendingIds.value.add(id);
            this.#loadingStates.value.set(id, true);
        }

        this.#debouncedFetch(); // Not awaiting the Promise
    }


    /**
     *
     * @type {import('vue').ComputedRef<Map<U,T>>}
     */
    loadedByIds = computed(() => this.#itemsById.value);

    /**
     *
     * @type {import('vue').ComputedRef<U[]>}
     */
    loadedIds = computed(() => [...(this.#itemsById.value?.keys() || [])]);

    /**
     *
     * @type {import('vue').ComputedRef<T[]>}
     */
    loadedItems = computed(() => [...(this.#itemsById.value?.values() || [])]);

}