// 把packages 目录下进行打包

const fs = require('fs')
// const path = require('path')
// const chalk = require('chalk')
const execa = require('execa') // 开启子进程 进行打包 最终还是用rollup 打包
const targets = fs.readdirSync('packages').filter(file => {

  // 判断文件状态
  if (!fs.statSync(`packages/${file}`).isDirectory()) {
    // 把非文件夹的忽略
    return false
  }
  return true
})
console.log(targets)


// 对我们目标依次打包，并行打包

async function build(target) {
  console.log('target', target);
  await execa('rollup', [
    '-c',
    '--environment',
    [
      `TARGET:${target}`,
    ]
  ],
    { stdio: 'inherit' } // 当子进程打包的信息共享给父进程
  )
}

function runParallel(targets, iteratorFn) {
  const res = []
  for (const item of targets) {
    const p = Promise.resolve().then(() => iteratorFn(item))
    res.push(p)
  }
  return Promise.all(res)
}
try {
  runParallel(targets, build)

} catch (error) {
  
}