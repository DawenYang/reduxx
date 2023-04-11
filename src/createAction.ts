import { Action } from 'redux'

export type PayloadAction<P = void, T extends string = string, M = never, E = never> = {
  payload: P,
  type: T
} & ([M] extends [never] ? {} : { meta: M }) & ([E] extends [never] ? {} : {
  error: E
})

export type PrepareAction<P> =
  | ((...args: any[]) => { payload: P })
  | ((...args: any[]) => { payload: P; meta: any })
  | ((...args: any[]) => { payload: P; error: any })
  | ((...args: any[]) => { payload: P; meta: any; error: any })

export type _ActionCreatorWithPreparedPayload<PA extends PrepareAction<any> | void,
  T extends string  = string
> = PA extends PrepareAction<infer P>;

export interface BaseActionCreator<P, T extends string, M = never, E = never> {
  type: T
  match: (action: Action<unknown>) => action is PayloadAction<P, T, M, E>
}

export interface ActionCreatorWithPreparedPayload<Args extends unknown[], P, T extends string = string, E = never, M = never> extends BaseActionCreator<P, T, M, E> {
  (...args: Args): PayloadAction<P, T, M, E>
}

export interface ActionCreatorWithOptionalPayload<P, T extends string  = string> extends BaseActionCreator<P, T> {
  (payload?: P):PayloadAction<P, T>
}

export interface ActionCreatorWithoutPayload<T extends string = string> extends BaseActionCreator<undefined, T> {
  (noArgument:void): PayloadAction<undefined, T>
}

export interface ActionCreatorWithPayload<P, T extends string = string> extends BaseActionCreator<P, T> {
  (payload: P): PayloadAction<P, T>
}

export interface ActionCreatorWithNonInferrablePayload<T extends string = string> extends BaseActionCreator<unknown, T> {
  <PT extends unknown>(payload: PT): PayloadAction<PT, T>
}

export type PayloadActionCreator<P = void, T extends string = string, PA extends PrepareAction<P>>
