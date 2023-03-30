import { cloneDeep } from 'lodash';
import { transformSync } from '@babel/core';
import { parse }  from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import addLogPreset, { traverseOptionsMap } from './plugins';

export const addLog1 = (sourceCode: string) => {
  // 使用babel的各个子包实现
  return Object.entries(traverseOptionsMap).map(([key, option]) => {
    const ast = parse(sourceCode, { sourceType: 'unambiguous', plugins: ['jsx']})
    // traverse会更改传入的option对象的引用
    traverse(ast, cloneDeep(option))
    const { code } = generate(ast, { sourceMaps: false})
    return [key, code]
  })
}

export const addLog2 = (sourceCode: string) => {
  const { code } = transformSync(sourceCode, {
    presets: [addLogPreset],
    plugins: [],
    parserOpts: {
      sourceType: 'unambiguous',
      plugins: ['jsx']
    }
  }) || {}
  return code
}