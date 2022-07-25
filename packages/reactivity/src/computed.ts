import { isFunction } from "@vue/shared/src"
import { track, trigger, effect, ReactiveEffect } from './effect';
import { TrackOpTypes, TriggerOpTypes } from "./operations";
import { ReactiveFlags } from './reactive';
import { Ref } from './ref';
export type ComputedGetter<T> = (ctx?: any) => T
export type ComputedSetter<T> = (v: T) => void

export interface ComputedRef<T = any> extends WritableComputedRef<T> {
  readonly value: T
}

export interface WritableComputedRef<T> extends Ref<T> {
  readonly effect: ReactiveEffect<T>
}

export interface WritableComputedOptions<T> {
  get: ComputedGetter<T>
  set: ComputedSetter<T>
}


export function computed<T>(getterOrOptions) {

  let getter: ComputedGetter<T>
  let setter: ComputedSetter<T>

  if (isFunction(getterOrOptions)) {
    getter = getterOrOptions
    setter = () => console.log('Write operation failed: computed value is readonly')
  } else {
    getter = getterOrOptions.get
    setter = getterOrOptions.set
  }
  return new ComputedRefImpl(getter, setter, isFunction(getterOrOptions) || !getterOrOptions.set)
}


class ComputedRefImpl<T>{

  private _value!: T
  private _dirty = true

  public readonly effect

  public readonly __v_isRef = true;
  public readonly [ReactiveFlags.IS_READONLY]: boolean

  constructor(getter: ComputedGetter<T>, private readonly setter: ComputedSetter<T>, isReadonly: boolean) {
    const self  = this
    this.effect = effect(getter, {
      lazy: true,
      value:self._value,
      scheduler: () => {
        if (!this._dirty) {
          this._dirty = true
          trigger(this, TriggerOpTypes.SET, 'value')
        }
      }
    })
    this[ReactiveFlags.IS_READONLY] = isReadonly
  }

  get value() {
    const self = this
    if (self._dirty) { // 避免 getter 里的值没有变化 就去触发自身的依赖
      self._value = this.effect()
      self._dirty = false
    }
    // 当render 的时候此时收集ComputedRefImpl 的依赖
    track(self, TrackOpTypes.GET, 'value')
    return self._value
  }

  set value(newValue:T) {
    this.setter(newValue)
    trigger(this, TriggerOpTypes.SET, 'value')
  }
}