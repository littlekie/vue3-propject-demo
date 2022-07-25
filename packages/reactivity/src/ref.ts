import { isArray, isObject,hasChange } from '@vue/shared/src';
import { mutableHandlers, readonlyHandlers, shallowReadonlyHandlers } from './baseHandlers';
import { track, trigger } from './effect';
import { TrackOpTypes, TriggerOpTypes } from './operations';
import { reactive } from './reactive';

declare const RefSymbol: unique symbol
export interface Ref<T = any> {
  value: T
  /**
   * Type differentiator only.
   * We need this to be in public d.ts but don't want it to show up in IDE
   * autocomplete, so we use a private Symbol instead.
   */
  [RefSymbol]: true
  /**
   * @internal
   */
  _shallow?: boolean
}
/**
 * 
 * 1.ref 将普通类型包装成对象 
 * 
 */
export function ref(value?: unknown) {
  // 将普通类型变成一个对象
  // 不建议 对象使用ref
  return createRef(value)
}


export function shallowRef(value?: unknown) {
  return createRef(value,true)
}
 
const convert = (val) => isObject(val) ?reactive(val):val

class RefImpl<T> {
  
  private _value: T

  public readonly __v_isRef = true


  constructor( public rawValue, public shallow) {// 参数前加 public 修饰符，标识此属性挂载到实例上.
    this._value = shallow ? rawValue : convert(rawValue)    // 如果是深读，则需要把深度变成响应式
    // this.rawValue
  }

  // get set 后面会转换为 defineProperty
  get value() { // 取值 value 代理 _value
    track(this,TrackOpTypes.GET,"value")
    return this._value
  }
  set value(newValue) {
    if (hasChange(newValue, this.rawValue)) {
      this.rawValue = newValue
      this._value =  this.shallow ? newValue : convert(newValue) 
      trigger(this, TriggerOpTypes.SET, 'value',newValue)

    }
  }
}
export  function createRef(rawValue: unknown, shallow: Boolean = false) {
  if (isRef(rawValue)) { // 如果是ref 直接返回
    return rawValue
  }
  return new RefImpl(rawValue,shallow)

}

export function isRef(v) {
  return Boolean(v && v.__v_isRef === true)
}

class ObjectRefImpl<T extends object, K extends keyof T> {
  public readonly __v_isRef = true

  constructor(private readonly _object: T, private readonly _key: K) {}

  get value() {
    return this._object[this._key]
  }

  set value(newVal) {
    this._object[this._key] = newVal
  }
}

export function toRef(target,key) { // 可以将对象中的一个属性转换成 ref 类型
  return new ObjectRefImpl(target,key)
}

export function toRefs(object) { // object 可能是对象或者是数组
// 把 object 里的key 转换为数组
  const data = isArray(object) ? new Array(object.length) : {}
  
  for (const key in object) {
      data[key] = toRef(object,key)
  }
  return data
  
}

/* "use strict";

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class RefImpl {
  constructor(rawValue, shallow) {
    _defineProperty(this, "_value", void 0);

    _defineProperty(this, "__v_isRef", true);

    // 参数前加 public 修饰符，标识此属性挂载到实例上.
    this._value = rawValue; // this.rawValue
  }

  get value() {
    // track(this,TrackOpTypes.GET,"value")
    return this._value;
  }

  set value(newValue) {
    // trigger(this, TriggerOpTypes.SET, 'value')
    this._value = newValue;
  }

} */