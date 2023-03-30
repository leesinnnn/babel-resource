import { stringLiteral, arrayExpression, expressionStatement, assertAnyTypeAnnotation } from '@babel/types'
import template from '@babel/template'
import type { TraverseOptions, Node } from '@babel/traverse'
import type { PluginItem } from '@babel/core';

const logType = ['log', 'info', 'debug', 'error'].map(item => `console.${item}`)

export const traverseOptionsMap: Record<string, TraverseOptions<Node>> = {
  // 增加打印行和列信息
  addLineColumn: {
    CallExpression(path) {
      const callName = path.get('callee').toString();
      if (logType.includes(callName)) {
        path.node.arguments.unshift(stringLiteral(`line number ${path.node.loc?.start?.line}, column number ${path.node.loc?.start?.column}`))
      }
    }
  },
  // 在打印信息前增加一行
  addNewLine: {
    ExpressionStatement(path) {
      if ((path.node as any).isCreated) {
        path.skip();
      }
    },
    CallExpression(path) {
      const callName = path.get('callee').toString();
      if (logType.includes(callName)) {
        const expressionAST = template.expression(`console.log('line ${path.node.loc?.start?.line}', 'column ${path.node.loc?.start?.column}')`)();
        const jsxExpressionContainerPath = path.find(path => path.isJSXExpressionContainer())
        if (jsxExpressionContainerPath) {
          path.replaceWith(arrayExpression([expressionAST, path.node]))
          path.skip()
        } else {
          const _expressionStatement = expressionStatement(expressionAST) as any
          _expressionStatement.isCreated = true;
          path?.parentPath?.insertBefore(_expressionStatement)
        }
      }
    }
  }
}

// 使用@babel/core和插件形式实现
export const addNewLinePlugin: PluginItem = ({ types, template }) => ({
  visitor: traverseOptionsMap.addNewLine
})

export const addLineColumnPlugin: PluginItem = (api, option) => ({
  visitor: traverseOptionsMap.addLineColumn
})

// 使用预设
const addLogPreset: PluginItem = () => ({
  plugins: [addLineColumnPlugin, addNewLinePlugin]
})

export default addLogPreset