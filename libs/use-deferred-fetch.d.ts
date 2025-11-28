import DeferredContext, {DeferredContextOpts} from './deferred-context'

export default function useDeferredFetch<T, U>(
    opts?: DeferredContextOpts<T, U> | null
): DeferredContext<T, U>
