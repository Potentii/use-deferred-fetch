import DeferredContext from "./deferred-context.mjs";


/**
 *
 * @template K,V
 * @param {?DeferredContextOpts<K,V>} [opts]
 * @return {DeferredContext<K,V>}
 */
export default function useDeferredContext(opts){
    return new DeferredContext(opts);
}

