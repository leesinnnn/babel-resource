import path from 'path'
import { transformSync } from '@babel/core'
import { getSourceCode } from '../utils'
export const autoI18n = () =>
  transformSync(getSourceCode(path.resolve(__dirname, './sourceCode.tsx')), {
    plugins: []
  })
