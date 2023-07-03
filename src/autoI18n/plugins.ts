import { declare } from '@babel/helper-plugin-utils'
import { addDefault } from '@babel/helper-module-imports';
import generate from '@babel/generator';
import fs from 'fs'
import path from 'path'
import { type NodePath } from '@babel/traverse';
import { ImportDeclaration, JSXAttribute, type StringLiteral, type TemplateLiteral } from '@babel/types'

interface IAutoI18nOption {
  outputPath: string;
}

const I18N_SOURCE = 'i18n';

export const autoI18nPlugin = declare((api, option: IAutoI18nOption) => {
  api.assertVersion(7)
  const textArr: { name: string; value: string }[] = [];

  const isChildOfImportDeclaration = (path: NodePath): NodePath<ImportDeclaration> | null =>
    path.find(loopPath => loopPath.isImportDeclaration()) as NodePath<ImportDeclaration> | null

  const isChildOfJSXAttribute = (path: NodePath): NodePath<JSXAttribute> | null =>
    path.find(loopPath => loopPath.isJSXAttribute()) as NodePath<JSXAttribute> | null

  const needIgnore = (path: NodePath<TemplateLiteral | StringLiteral>) => {
    let needIgnore = false
    if (!path.node.leadingComments) {
      return needIgnore
    } else {
      path.node.leadingComments.forEach(item => {
        if (item.value === 'i18n-disable') {
          needIgnore = true
        }
      })
    }
    return needIgnore
  }

  const getI18nKey = (() => {
    let index = 0
    return (stringValue: string) => {
      const targetItem = textArr.find(item => item.value === stringValue)
      if (targetItem) {
        return targetItem.name
      } else {
        return `i18nKey_${++index}`
      }
    }
  })()

  return {
    visitor: {
      Program(path, state) {
        let imported = false
        path.traverse({
          ImportDeclaration(curPath) {
            const sourceName = curPath.get('source').node.value
            if (sourceName !== I18N_SOURCE) {
              return
            }
            const specifiers = curPath.get('specifiers')
            specifiers.forEach(specifyPath => {
              const isImportDefaultSpecifier = specifyPath.isImportDefaultSpecifier()
              if (isImportDefaultSpecifier) {
                imported = true
                state.i18nName = specifyPath.get('local').node.name
              }
            })
          }
        })
        if (!imported) {
          state.i18nName = addDefault(path, I18N_SOURCE, { nameHint: I18N_SOURCE }).name
        }
      },
      StringLiteral(path, state) {
        if (isChildOfImportDeclaration(path) || needIgnore(path)) {
          path.skip()
          return
        }
        const stringValue = path.node.value
        const i18nKey = getI18nKey(stringValue)
        const i18nExpression = api.template.expression(`${state.i18nName}.t('${i18nKey}')`)()
        const jsxAttributePath = isChildOfJSXAttribute(path)
        if (jsxAttributePath && !jsxAttributePath.get('value').isJSXExpressionContainer()) {
          path.replaceWith(api.types.jsxExpressionContainer(i18nExpression))
        } else {
          path.replaceWith(i18nExpression)
        }
        textArr.push({
          name: i18nKey,
          value: stringValue
        })
        path.skip()
      },
      TemplateLiteral(path, state) {
        if (isChildOfImportDeclaration(path) || needIgnore(path)) {
          path.skip()
          return
        }
        const templateStr = path.get('quasis').map(quasisPath => quasisPath.node.value.raw).join('{placeholder}')
        const i18nKey = getI18nKey(templateStr)
        const paramsStr = path.get('expressions').map(expPath => generate(expPath.node).code).join(',')
        const i18nExpression = api.template.expression(`${state.i18nName}.t(\`${i18nKey}\`${paramsStr ? ','+ paramsStr : ''})`)()
        const jsxAttributePath = isChildOfJSXAttribute(path)
        if (jsxAttributePath && !jsxAttributePath.get('value').isJSXExpressionContainer()) {
          path.replaceWith(api.types.jsxExpressionContainer(i18nExpression))
        } else {
          path.replaceWith(i18nExpression)
        }
        textArr.push({
          name: i18nKey,
          value: templateStr
        })
        path.skip()
      }
    },
    post() {
      const i18nSourceMap = textArr.reduce((map, item) => {
        map[item.name] = item.value
        return map
      }, {} as Record<string, string>)
      fs.writeFileSync(path.resolve(__dirname, './i18nSource.json'), JSON.stringify(i18nSourceMap, null, 2))
    }
  }
})