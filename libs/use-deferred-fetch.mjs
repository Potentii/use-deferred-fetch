import {computed, ref} from "vue";
import {useDebounceFn} from "@vueuse/core";
import {Deferred} from "./deferred.mjs";

const DEFAULT_DEBOUNCE_DELAY = 300;
const DEFAULT_MAX_WAIT = 3000;






/**
 *
 * @template T,U
 * @param {object} opts
 * @param {(ids: U[]) => Promise<T[]>} opts.onRequested
 * @param {(T) => U} opts.getId
 * @param {number} opts.maxItemsPerRequest
 * @param {number} opts.debounceMaxWait
 * @param {number} opts.debounceDelay
 *
 * @return {DeferredFetchContext<T, U>}
 */
export function useDeferredFetch(opts){

	const itemsById = ref(new Map());
	const pendingIds = ref(new Set());
	// const invalidatedIds = ref(new Set());
	const loadingStates = ref(new Map());

	const debounceDelay = opts?.debounceDelay === undefined || opts?.debounceDelay === null
		? DEFAULT_DEBOUNCE_DELAY
		: opts.debounceDelay;

	const debounceMaxWait = opts?.debounceMaxWait === undefined || opts?.debounceMaxWait === null
		? DEFAULT_MAX_WAIT
		: opts.debounceMaxWait;

	const debouncedFetch = useDebounceFn(async () => {
		if (pendingIds.value.size === 0) return;


		const idsToFetch = Array.from(pendingIds.value);
		pendingIds.value.clear();

		try {
			const items = (await opts.onRequested(idsToFetch)) || [];

			upsertItems(items);
		} catch (error) {
			console.error('Failed to fetch items', error);

			for (let id of idsToFetch) {
				loadingStates.value.set(id, false);
			}
		}
	}, debounceDelay, { maxWait: debounceMaxWait });



	/**
	 *
	 * @param {U} id
	 * @returns {Deferred<T>}
	 */
	function getItemById(id){
		// *Returning existing item if we have it:
		if (itemsById.value.has(id))
			return new Deferred(loadingStates.value.get(id), itemsById.value.get(id), null);

		// *Ignoring request if already loading:
		if (loadingStates.value.get(id))
			return new Deferred(true, itemsById.value.get(id) || null, null);

		// *Queueing request if not pending yet:
		if (!pendingIds.value.has(id)) {
			pendingIds.value.add(id);
			loadingStates.value.set(id, true);
			debouncedFetch();
		}

		// *Returning loading state while waiting:
		return new Deferred(true, null, null);
	}


	/**
	 *
	 * @param {T[]} items
	 */
	function upsertItems(items){
		for(const item of items){
			const id = opts.getId(item);
			if(pendingIds.value.has(id))
				pendingIds.value.delete(id);

			itemsById.value.set(id, item);
			loadingStates.value.set(id, false);
		}
	}


	/**
	 *
	 * @param {T[]} items
	 */
	function removeItems(items){
		removeItemsById(items.map(item => opts.getId(item)));
	}
	/**
	 *
	 * @param {U[]} ids
	 */
	function removeItemsById(ids){
		for(const id of ids)
			itemsById.value.delete(id);
	}


	/**
	 *
	 * @param {T[]} items
	 */
	function invalidateItems(items){
		invalidateItemsById(items.map(item => opts.getId(item)));
	}
	/**
	 *
	 * @param {U[]} ids
	 */
	function invalidateItemsById(ids){
		for(const id of ids) {
			pendingIds.value.add(id);
			loadingStates.value.set(id, true);
		}

		debouncedFetch();
	}


	/**
	 *
	 * @type {ComputedRef<import('vue').Ref<Map<U,T>>>}
	 */
	const loadedByIds = computed(() => itemsById.value);

	/**
	 *
	 * @type {ComputedRef<import('vue').Ref<U[]>>}
	 */
	const loadedIds = computed(() => [...(itemsById.value?.keys() || [])]);

	/**
	 *
	 * @type {ComputedRef<import('vue').Ref<T[]>>}
	 */
	const loadedItems = computed(() => [...(itemsById.value?.values() || [])]);




	return {
		getItemById,
		upsertItems,
		removeItems,
		removeItemsById,
		invalidateItems,
		invalidateItemsById,
		loadedByIds,
		loadedIds,
		loadedItems,
	};

}








