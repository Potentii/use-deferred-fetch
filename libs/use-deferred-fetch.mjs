import DeferredContext from "./deferred-context.mjs";


/**
 *
 * @template T,U
 * @param {?DeferredContextOpts} [opts]
 * @return {DeferredContext<T, U>}
 */
export default function useDeferredFetch(opts){
    return new DeferredContext(opts);
}

