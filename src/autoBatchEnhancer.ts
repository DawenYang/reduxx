import type { StoreEnhancer } from 'redux'

export const SHOULD_AUTOBATCH = 'RTK_autoBatch'

export const prepareAutoBatched = <T>() => (payload: T): { payload: T; meta: unknown } => ({
  payload,
  meta: { [SHOULD_AUTOBATCH]: true }
})

let promise: Promise<any>
const queueMicrotaskShim = typeof queueMicrotask === 'function'
  ? queueMicrotask.bind(
    typeof window !== 'undefined'
      ? window
      : typeof global !== 'undefined'
        ? global
        : globalThis
  )
  :
  (cb: () => void) => (promise || (promise = Promise.resolve())).then(cb).catch((err: any) =>
    setTimeout(() => {
      throw err
    }, 0)
  )

const createQueueWithTimer = (timeout: number) => {
  return (notify: () => void) => {
    setTimeout(notify, timeout)
  }
}

const rAF =
  typeof window !== 'undefined' && window.requestAnimationFrame
    ? window.requestAnimationFrame
    : createQueueWithTimer(10)

export type AutoBatchOptions =
  | { type: 'tick' }
  | { type: 'timer'; timeout: number }
  | { type: 'raf' }
  | { type: 'callback', queueNotification: (notify: () => void) => void }

export const autoBatchEnhancer =
  (options: AutoBatchOptions = { type: 'raf' }): StoreEnhancer =>
    (next) =>
      (...args) => {
        const store = next(...args)

        let notifying = true
        let shouldNotifyAtEndOfTick = false
        let notificationQueued = false

        const listeners = new Set<() => void>()

        const queueCallback =
          options.type === 'tick'
            ? queueMicrotaskShim
            : options.type === 'raf'
              ? rAF
              : options.type === 'callback'
                ? options.queueNotification
                : createQueueWithTimer(options.timeout)

        const notifyListeners = () => {
          notificationQueued = false
          if (shouldNotifyAtEndOfTick) {
            shouldNotifyAtEndOfTick = false
            listeners.forEach((l) => l())
          }
        }

        return Object.assign({}, store, {
          subscribe(listener: () => void) {
            const wrappedListener: typeof listener = () => notifying && listener()
            const unsubscribe = store.subscribe(wrappedListener)
            listeners.add(listener)
            return () => {
              unsubscribe()
              listeners.delete(listener)
            }
          },
          dispatch(action: any) {
            try {
              notifying = !action?.meta?.[SHOULD_AUTOBATCH]
              shouldNotifyAtEndOfTick = !notifying
              if (shouldNotifyAtEndOfTick) {
                if (!notificationQueued) {
                  notificationQueued = true
                  queueCallback(notifyListeners)
                }
              }
              return store.dispatch(action)
            } finally {
              notifying = true
            }
          }
        })
      }
