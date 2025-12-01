import DeferredContext, {DeferredContextOpts} from './deferred-context'

export default function useDeferredContext<K, V>(
    opts?: DeferredContextOpts<K, V> | null
): DeferredContext<K, V>
