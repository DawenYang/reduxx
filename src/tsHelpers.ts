import { Middleware, StoreEnhancer } from 'redux'
import { MiddlewareArray } from '@internal/utils'

export type IsAny<T, True, False = never> =
    true | false extends (T extends never ? true : false) ? True : False

export type IsUnknown<T, True, False = never> = unknown extends T
  ? IsAny<T, false, True>
  : False

export type FallbackIfUnknown<T, Fallback> = IsUnknown<T, Fallback, T>

export type IfMaybeUndefined<P, True, False> = [undefined] extends [P]
  ? True
  : False

export type IfVoid<P, True, False> = [void] extends [P] ? True : False

export type IsEmptyObj<T, True, False = never> = T extends any
  ? keyof T extends never
    ? IsUnknown<T, False, IfMaybeUndefined<T, False, IfVoid<T, False, True>>>
    : False
  : never

export type AtLeastTS35<True, False> = [True, False][IsUnknown<ReturnType<<T>() => T>, 0, 1>]

export type IsUnknownOrNonInferrable<T, True, False> = AtLeastTS35<IsUnknown<T, True, False>, IsEmptyObj<T, True, IsUnknown<T, True, False>>>

export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never

export type ExcludeFromTuple<T, E, Acc extends unknown[] = []> = T extends [
    infer Head,
    ...infer Tail
  ]
  ? ExcludeFromTuple<Tail, E, [...Acc, ...([Head] extends [E] ? [] : [Head])]>
  : Acc

type ExtractDsipatchFromMiddlewareTuple<MiddlewareTuple extends any[],
  Acc extends {}
> = MiddlewareTuple extends [infer Head, ...infer Tail]
  ? ExtractDsipatchFromMiddlewareTuple<Tail, Acc & (Head extends Middleware<infer D> ? IsAny<D, {}, D> : {})>
  : Acc

export type ExtractDispatchExtensions<M> = M extends MiddlewareArray<infer MiddlewareTuple> ? ExtractDsipatchFromMiddlewareTuple<MiddlewareTuple, {}>
  : M extends ReadonlyArray<Middleware>
    ? ExtractDsipatchFromMiddlewareTuple<[...M], {}>
    : never

export type ExtractStoreExtensions<E> = E extends any[]
  ? UnionToIntersection<E[number] extends StoreEnhancer<infer Ext> ? Ext extends {} ? Ext : {} : {}>
  : {}

export type NoInfer<T> = [T][T extends any ? 0 : never]

export type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>

export interface TypeGuard<T> {
  (value: any): value is T
}

export interface HasMatchFunction<T> {
  match: TypeGuard<T>
}

export const hasMatchFunction = <T>(
  v: Matcher<T>
): v is HasMatchFunction<T> => {
  return v && typeof (v as HasMatchFunction<T>).match === 'function'
}

export type Matcher<T> = HasMatchFunction<T> | TypeGuard<T>

export type ActionFromMatcher<M extends Matcher<any>> = M extends Matcher<infer T> ? T : never

export type Id<T> = { [K in keyof T]: T[K] } & {}
