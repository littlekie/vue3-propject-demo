import { extend,isObject,isArray, isIntergerkey, hasOwn, hasChange } from "@vue/shared/src"
import { track, trigger } from "./effect";
import { TrackOpTypes, TriggerOpTypes } from "./operations";
import { reactive, readonly } from './reactive';


/**
 * 1、 是不是仅读 ，仅读没有 set ,报一场
 * 2、是不是深度
 */
export function createGetter(isReadonly:Boolean = false, isShallow = false) {
  return function get(target, key, receiver) {
    const res = Reflect.get(target, key, receiver)

    if (!isReadonly) {
       // 依赖收集 ,数据变化后更新视图
      console.log('执行effect 时会取值', "收集effect")
      
      track(target, TrackOpTypes.GET,key)
    }
    if (isShallow) {
      return res
    }
    if (isObject(res)) { // 取值时 再代理
      return isReadonly ? readonly(res) : reactive(res)
    }
    return res
  }
}

const get = createGetter()
const shallowGet = createGetter(false, true)
const readonlyGet = createGetter(true, false)
const shallowReadonlyGet = createGetter(false, true)


export function createSetter(isShallow = false) {
  return function set(target, key, value, receiver) {

    /**
     * 1.首先区分属性是新增还啊是修改的,
     * 2. hack 的方法需要特殊处理
     */
    const oldValue = target[key] // 获取旧值
    
    const hasKey = isArray(target) && isIntergerkey(key)
      ? Number(key) < target.length
      : hasOwn(target, key);
      const result = Reflect.set(target, key, value, receiver) // 等同于 target[key] = value
    if (!hasKey) {
      //新增
      trigger(target,TriggerOpTypes.ADD,key,value)

    } else if(hasChange(value,oldValue)) {
      // 修改
      trigger(target,TriggerOpTypes.SET,key,value,oldValue)
    }
    
  // 数据更新时, 通知对应属性的effect 重新执行
    return result
  }
}
const set = createSetter()
const shallowSet = createSetter(true)

export const mutableHandlers = {
  get,
  set
}
export const readonlyHandlers = {
  get: readonlyGet,
  set(target, key) {
    console.warn(
      `Set operation on key "${String(key)}" failed: target is readonly.`,
      target
    )
    return true
  },
}
export const shallowHandlers = {
  get: shallowGet,
  shallowSet
}

export const shallowReadonlyHandlers = extend(
  {},
  readonlyHandlers,
  {
    get: shallowReadonlyGet
  }
)