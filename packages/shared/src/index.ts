export const shared = {
  shared:true
}
export const isObject = (data) => typeof data === 'object' && data !== null
export const extend = Object.assign
export const isArray = Array.isArray
export const isFunction = (value) => typeof value === 'function'
export const isNumber = (value) => typeof value === 'number'
export const isString = (value) => typeof value === 'string'
export const isIntergerkey = (key) => parseInt(key) +'' === key // 是否key 是整数
const hasOwnProperty = Object.prototype.hasOwnProperty
export const hasOwn = (
  val: object,
  key: string | symbol
): key is keyof typeof val => hasOwnProperty.call(val, key)

export const hasChange = (value,oldValue) => oldValue !== value // 是否发生改变
