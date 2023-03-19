import { Action, AnyAction } from '@internal/types/actions'
import { Reducer } from '@internal/types/reducers'
import '../utils/symbol-observable'

declare const $CombinedState: unique symbol

interface EmptyObject {
  readonly [$CombinedState]?: undefined
}

export type CombinedState<S> = EmptyObject & S

export type PreloadedState<S> = Required<S> extends EmptyObject
  ? S extends CombinedState<infer S1>
    ? {
        [K in keyof S1]?: S1[K] extends object ? PreloadedState<S1[K]> : S1[K]
      }
    : S
  : {
      [K in keyof S]: S[K] extends string | number | boolean | symbol
        ? S[K]
        : PreloadedState<S[K]>
    }

export interface Dispatch<A extends Action = AnyAction> {
  <T extends A>(action: T, ...extraArgs: any[]): T
}

export interface Unsubscribe {
  (): void
}

export type ListenerCallback = () => void

declare global {
  interface SymbolConstructor {
    readonly observable: symbol
  }
}

export type Observable<T> = {
  subscribe: (observer: Observer<T>) => { unsubscribe: Unsubscribe }
  [Symbol.observable](): Observable<T>
}

export type Observer<T> = {
  next?(value: T): void
}

export interface Store<
  S = any,
  A extends Action = AnyAction,
  StateExt extends {} = {}
> {
  dispatch: Dispatch<A>

  getState(): S & StateExt

  subscribe(listener: ListenerCallback): Unsubscribe

  replaceReducer(nextReducer: Reducer<S, A>): void

  [Symbol.observable](): Observable<S & StateExt>
}

export interface StoreCreator {
  <S, A extends Action, Ext extends {} = {}, StateExt extends {} = {}>(
    reducer: Reducer<S, A>,
    enhancer?: StoreEnhancer<Ext, StateExt>
  ): Store<S, A, StateExt> & Ext
}

export type StoreEnhancer<Ext extends {} = {}, StateExt extends {} = {}> = <
  NextExt extends {},
  NextStateExt extends {}
>(
  next: StoreEnhancerStoreCreator<NextExt, NextStateExt>
) => StoreEnhancerStoreCreator<NextExt & Ext, NextStateExt & StateExt>

export type StoreEnhancerStoreCreator<
  Ext extends {} = {},
  StateExt extends {} = {}
> = <S = any, A extends Action = AnyAction>(
  reducer: Reducer<S, A>,
  preloadedState?: PreloadedState<S>
) => Store<S, A, StateExt> & Ext
