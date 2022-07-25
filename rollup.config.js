// rollup 配置
import path from "path";
import jsonPlugin from "@rollup/plugin-json";
import resolvePlugin from "@rollup/plugin-node-resolve";
import tsPlugin from "rollup-plugin-typescript2";
console.log('rollup.env', process.env.TARGET);
// 根据环境变量中的target 属性，获取对应模块的 package.json
const packageDir = path.resolve(__dirname, 'packages') // 找到packages 目录

const targetDir = path.resolve(packageDir, process.env.TARGET) // 找到要打包的某个 目录
console.log(targetDir);

const resolve = (p) => {
  console.log('resolve=<<',p,targetDir)
  return path.resolve(targetDir, p)
}

const packageConetnt = require(resolve('package.json'))
const name = path.basename(targetDir) //  取文件名
console.log(packageConetnt);
console.log('name',name);

// 对打包类型先做一个映射表,根据 packageConetnt 里的 formats,打包需要的内容

const outputConfig = {
  'esm-bundler': {
    file: resolve(`dist/${name}.esm-bundler.js`),
    format: 'es'
  },
  'cjs': {
    file: resolve(`dist/${name}.cjs.js`),
    format: 'cjs'
  },
  'global': {
    file: resolve(`dist/${name}.global.js`),
    format: 'iife' // 表示立即执行函数
  },
}

const buildOptions = packageConetnt.buildOptions
function createConfig(format,output) {
  output.name = buildOptions.name
  output.sourcemap = buildOptions.sourcemap // 打包需要调试

  // 生成rollup 配置
  return {
    input: resolve(`src/index.ts`),
    output,
    plugins: [ // 注意这里是plugins!!!，我就是写成了plugin，结果插件都无效
      jsonPlugin(),
      tsPlugin({
        tsconfig:path.resolve(__dirname,'tsconfig.json')
      }),
      resolvePlugin() // 解析第三方模块插件
    ]
  }
}

// rollup 需要输出
export default buildOptions.formats.map(format => {
  return createConfig(format, outputConfig[format])
})