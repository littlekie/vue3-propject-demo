// 只针对具体的某个包

const fs = require('fs')
const execa = require('execa') // 开启子进程 进行打包 最终还是用rollup 打包
const target = 'reactivity'

// 对我们目标依次打包，并行打包

async function build(target) {
  console.log('target', target);
  await execa('rollup', [
    '-cw', // w 代表监听
    '--environment',
    [
      `TARGET:${target}`,
    ]
  ],
    { stdio: 'inherit' } // 当子进程打包的信息共享给父进程
  )
}


build(target)