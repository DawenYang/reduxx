function myForeach<T>(items: T[], foreachFunc: (v: T) => void) {
  items.reduce((a, v) => {
    foreachFunc(v)
    return undefined
  }, undefined)
}

function myFilter<T>(items: T[], filterFunc: (v: T) => boolean) {
  items.reduce((a, v) => {
    if (filterFunc(v)) {
      return [...a, v]
    }
    return a
  }, [] as T[])
}

function myMap<T, K>(items: T[], mapFunc: (v: T) => K) {
  items.reduce((a, v) => {
    return [...a, mapFunc(v)]
  }, [] as K[])
}

function pluck<DataType, KeyType extends keyof DataType>(
  items: DataType[],
  key: KeyType
): DataType[KeyType][] {
  return items.map((item) => item[key])
}

interface BaseEvent {
  time: number;
  user: string;
}

interface EventMap {
  addToCart: BaseEvent & { quantity: number; productID: string },
  checkout: BaseEvent
}

function sendEvent<Name extends keyof EventMap>(name: Name, data: EventMap[Name]) {
  console.log([name, data])
}

sendEvent('addToCart', { user: 'ss', productID: 'sss', quantity: 1, time: 10 })
export default myForeach
