import { declare } from "@babel/helper-plugin-utils";
import { addDefault } from "@babel/helper-module-imports";
import { type NodePath } from "@babel/traverse";
import {
  type FunctionDeclaration,
  type ClassMethod,
  type ArrowFunctionExpression,
  type FunctionExpression,
  type Statement,
  type Identifier
} from "@babel/types";

type funcTypePath = NodePath<FunctionDeclaration | ClassMethod | ArrowFunctionExpression | FunctionExpression>

interface funcTypeState {
  trackerName: string;
  trackerAST: Statement
}

export const autoTrackPlugin = declare((api, option) => {
  api.assertVersion(7)
  return {
    visitor: {
      Program(path, state) {
        path.traverse({
          ImportDeclaration(importPath) {
            const { value } = importPath.get('source').node
            if (value === option.trackerPath) {
              const specifiers =  importPath.get('specifiers')
              specifiers.forEach(specifyPath => {
                specifyPath.isImportDefaultSpecifier() &&
                  (state.trackerName = specifyPath.get('local').node.name)
              })
            }
          }
        })
        if (!state.trackerName) {
          state.trackerName =
            addDefault(path, option.trackerPath, { nameHint: option.trackerPath }).name
        }
        state.trackerAST = api.template.ast(`${state.trackerName}()`)
      },
      ['FunctionDeclaration|ClassMethod|ArrowFunctionExpression|FunctionExpression'](funcPath: funcTypePath, state: funcTypeState) {
        let hasTracker = false
        funcPath.traverse({
          CallExpression(callExpPath) {
            if (callExpPath.get('callee').isIdentifier() && (callExpPath.get('callee') as NodePath<Identifier>).node.name === state.trackerName) {
              hasTracker = true
            }
          }
        })
        if (hasTracker) {
          funcPath.skip()
          return
        }
        const bodyPath = funcPath.get('body')
        if (bodyPath.isBlockStatement()) {
          bodyPath.node.body.unshift(state.trackerAST)
        } else {
          (bodyPath as any).replaceWith(api.template(`{${state.trackerName}(); return PRE_BODY}`)({ PRE_BODY: bodyPath.node }))
        }
      }
    }
  }
})