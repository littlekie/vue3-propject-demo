/**
 * 1、 是不是仅读 ，仅读没有 set ,报一场
 * 2、是不是深度
 */

export function createGetter(isReadonly:Boolean = false, isShallow:Boolean =false) {
  
}

const get = createGetter()
const shallowGet = createGetter(false,true)
const readonlyGet = createGetter(true,false)
const shallowReadonlyGet = createGetter(false,true)

export const mutableCollectionHandlers = {
  get,

}
export const readonlyCollectionHandlers = {
  get: readonlyGet
}
export const shallowCollectionHandlers = {
  get: shallowGet
}

export const shallowReadonlyCollectionHandlers = {
  get: shallowReadonlyGet
}