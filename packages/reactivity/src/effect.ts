import { isArray,isIntergerkey } from "@vue/shared/src";
import { TrackOpTypes, TriggerOpTypes } from "./operations";

export interface ReactiveEffect<T = any> {
  (): T
  _isEffect: true
  id: number
  active: boolean
  raw: () => T
  allowRecurse: boolean
}
interface EffectOption {
  lazy?: Boolean,
  value?:any
  scheduler?: (job: ReactiveEffect) => void
}
export function effect(fn, option: EffectOption = {}) {
  // 需要让这个 effect 变成响应式的effect,做到数据变化自动执行此函数
  const effect = createReactiveEffect(fn, option)
  if (!option.lazy) { // 默认的effect 会先执行
    effect()  // 响应式的effect 会先执行一次
  }
  return effect
}

let uid = 0;
let activeEffect; // 存储当前的effect
const effectStack = [] // 把当前的effect 收集到一起，执行最后一次的effect
function createReactiveEffect(fn, option = {}) {
  const effect = function reactiveEffect() {
    if (!effectStack.includes(effect)) {
      try {
        effectStack.push(effect)
        activeEffect = effect
        return fn() // 函数执行时会取值，会执行 basahandler 里 的get方法
      } finally {
        effectStack.pop() // 删除最后一个报错的effect
        activeEffect = effectStack[effectStack.length - 1]
      }
    }

  }

  effect.id = uid++ // 制作一个effect标示，用于区分effect 组件渲染时用
  effect._isEffect = true // 用于标示这个是响应式effect
  effect.raw = fn // 保留原有的effect
  effect.options = option // 在effect 保存用户的属性
  return effect
}


const targetMap = new WeakMap()

// 让某个对象中的属性 收集当前对应的依赖 effect 函数
export function track(target:object, trackOpTypes: TrackOpTypes, key) { // 收集依赖
  // activeEffect // 当前正在运行的effect
  if (activeEffect === undefined) { // 某个属性不存在对象,则不用手机依赖
    return
  }
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }
  let dep = depsMap.get(key)
  if (!dep) {
    // Set 避免重复收集
    depsMap.set(key, (dep = new Set()))
  }
  if (!dep.has(activeEffect)) {
    dep.add(activeEffect)
  }
  console.log(activeEffect)
}

// 函数调用是一个栈型结构
/* effect(() => {
  state.name = 'cxx'// =>effect1
  effect(() => { //effect2
    state.age = 99 //effect2
  })
  state.address = '福州' //effect1
}) */


//触发更新
export function trigger(target, type: TriggerOpTypes, key?, newValue?, oldValue?) {
  console.log(target, type, key, newValue, oldValue)
  const depsMap = targetMap.get(target)

  // 如果没有收集这个属性,没有收集过这个依赖，则需不需要做任何操作
  if (!depsMap) {
    // never been tracked
    return
  }

  // 将所有的effect 收集到一个集合中,最终一起执行,避免重复执行effect 
  // Set 可以对effects去重
  const effetcs = new Set()

  const add = (effectsToAdd) => {
    if (effectsToAdd) {
      effectsToAdd.forEach(effect => {
        effetcs.add(effect)
      });
    }
  }

  // 看修改属性是不是数组长度，数组长度影响的比较多
  if (key == 'length' && isArray(target)) {
    depsMap.forEach((dep, key) => {
      console.log(depsMap,dep, key)
      // var arr = [1, 2, 3]
      // app.innerHTML = arr[2]
      // arr.length =1

      if (key === 'length' || key >=newValue) {
        //1.如果更改的长度小于收集的索引
        //2.那么这个索引也要触发 effect 重新执行
        add(dep)
      }
    })
  } else {
    if (key !== undefined) { //修改
      add(depsMap.get(key))
    }
    // 如果修改某个数组的索引该怎么办？
    switch (type) {
      case TriggerOpTypes.ADD:
        if (isArray(target) && isIntergerkey(key)) {
          // 如果是数组且是通过索引修改数组
          // length changes
          add(depsMap.get('length'))
        }
        break;
    
      default:
        break;
    }
  }
  console.log(effetcs)
  const run = (effect) => {
    if (effect.options.scheduler) {
      effect.options.scheduler(effect);
  }
  else {
      effect();
  }
  }
  effetcs.forEach(run)
}