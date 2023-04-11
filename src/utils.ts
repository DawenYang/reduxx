import type { Middleware } from 'redux'
import createNextState, { isDraftable } from 'immer'

export function getTimeMeasureUtils(maxDelay:number, fnName:string) {
  let elapsed = 0
  return {
    measureTime<T>(fn: () => T): T {
      const started = Date.now()
      try {
        return fn()
      } finally {
        const finished = Date.now()
        elapsed += finished - started
      }
    },
    warnIfExceeded(){
      if (elapsed > maxDelay) {
        console.warn(`${fnName} took ${elapsed}ms`)
      }
    }
  }
}

export function delay(ms:number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export class MiddlewareArray<
  Middlewares extends Middleware<any, any>[]
> extends Array<Middlewares[number]> {
  constructor(...items: Middlewares)
  constructor(...args:any[]) {
    super(...args)
    Object.setPrototypeOf(this, MiddlewareArray.prototype)
  }

  static get [Symbol.species]() {
    return MiddlewareArray as any
  }

  concat<AdditionalMiddlewares extends ReadonlyArray<Middleware<any, any>>>(
    items: AdditionalMiddlewares
  ): MiddlewareArray<[...Middlewares, ...AdditionalMiddlewares]>
  concat<AdditionalMiddlewares extends ReadonlyArray<Middleware<any, any>>>(
    ...items: AdditionalMiddlewares
  ): MiddlewareArray<[...Middlewares, ...AdditionalMiddlewares]>
  concat(...arr:any[]){
    return super.concat.apply(this, arr)
  }

  prepend<AdditionalMiddlewares extends ReadonlyArray<Middleware<any, any>>>(
    items: AdditionalMiddlewares
  ): MiddlewareArray<[...AdditionalMiddlewares, ...Middlewares]>
  prepend<AdditionalMiddlewares extends ReadonlyArray<Middleware<any, any>>>(
    ...items: AdditionalMiddlewares
  ): MiddlewareArray<[...AdditionalMiddlewares,...Middlewares]>
  prepend(...arr:any[]) {
    if(arr.length === 1 && Array.isArray(arr[0])){
      return new MiddlewareArray(...arr[0].concat(this))
    }
    return new MiddlewareArray(...arr.concat(this))
  }
}

export function freezeDraftable<T>(val:T) {
  return isDraftable(val)? createNextState(val, ()=> {}) : val
}
