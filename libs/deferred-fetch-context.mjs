
/**
 * @template T,U
 * @typedef {{
 *  getItemById: (id: U) => Deferred<T>,
 * 	upsertItems: (items: T[]) => void,
 * 	removeItems: (items: T[]) => void,
 * 	removeItemsById: (ids: U[]) => void,
 * 	invalidateItems: (items: T[]) => void,
 * 	invalidateItemsById: (ids: U[]) => void,
 * 	loadedByIds: ComputedRef<import('vue').Ref<Map<U,T>>>,
 * 	loadedIds: ComputedRef<import('vue').Ref<U[]>>,
 * 	loadedItems: ComputedRef<import('vue').Ref<T[]>>,
 * }} DeferredFetchContext
 */