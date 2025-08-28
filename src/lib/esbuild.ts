import * as esbuild from 'esbuild-wasm'

let loaded = false
let isLoading = false

export const loadEsbuild = async () => {
  if (loaded) {
    return
  }

  if (isLoading) {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (!isLoading) {
          clearInterval(interval)
          resolve('')
        }
      }, 100)
    })
  }

  isLoading = true

  try {
    await esbuild.initialize({
      worker: true,
      wasmURL: 'https://unpkg.com/esbuild-wasm/esbuild.wasm',
    })
    loaded = true
  } catch (error) {
    console.log(error)
  }
  isLoading = false
}

function transformESMToReturn(code: string) {
  // 匹配 export {...} 语句
  // 例如：export { r as default, x as something };
  // 支持多行、多空格
  return code.replace(
    /export\s*{\s*([^}]+)\s*};?/g,
    (_, exportsList: string) => {
      // 找到 default 导出的变量
      const matches = exportsList
        .split(',')
        .map((s) => s.trim())
        .map((s) => {
          // s 可能是 "r as default" 或 "x"
          const m = s.match(/(\w+)\s+as\s+default/)
          return m ? m[1] : null
        })
        .filter(Boolean)

      if (matches.length === 0) return '' // 没有 default 导出，不替换
      // 只返回第一个 default 导出的变量
      return `return ${matches[0]};`
    },
  )
}

export const bundle = async (contents: string) => {
  await loadEsbuild()
  const result = await esbuild.transform(contents, {
    loader: 'tsx',
    format: 'esm',
    jsx: 'transform',
    // jsxFactory: 'React.createElement',
    // jsxFragment: 'React.Fragment',
    platform: 'browser',
    minify: true,
  })
  // return result.code
  return transformESMToReturn(result.code)
  // return result.outputFiles[0].text
}
