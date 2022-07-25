import { isObject } from '@vue/shared/src';
import { mutableHandlers, readonlyHandlers, shallowReadonlyHandlers } from './baseHandlers';


export function reactive(target) {
  return createReactiveObject(target,false,mutableHandlers)
}
export function readonly(target) {
  return createReactiveObject(target,true,readonlyHandlers)
}
export function shallowReactive(target) {
  return createReactiveObject(target,false,shallowReactive)
}
export function shallowReadonly(target) {
  return createReactiveObject(target,true,shallowReadonlyHandlers)
}



export const enum ReactiveFlags {
  SKIP = '__v_skip',
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly',
  RAW = '__v_raw'
}


const reactiveMap = new WeakMap() // 会自动垃圾回收，不会造成内存写了，储存的key 只能是对象
const readonlyMap = new WeakMap() // 会自动垃圾回收，不会造成内存写了，储存的key 只能是对象

export interface Target {

}
// 是不是仅读、是不是深度  使用函数柯里化 new Proxy
export function createReactiveObject(target:Target, isReadonly, baseHandlers) {
  if (!isObject(target)) {
    console.warn(`value cannot be made reactive: ${String(target)}`)
      return target
  }

  const proxyMap = isReadonly ? readonlyMap : reactiveMap

  const existingProxy = proxyMap.get(target)
  if (existingProxy) {
    return existingProxy
  }
  // 如果这个对象已经被代理过来，就不需要再次代理
  const proxy = new Proxy(target, baseHandlers)
  
  proxyMap.set(target,proxy) // 将要代理的对象缓存起来，和对应的代理结果缓存
  
  return proxy
}