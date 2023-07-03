import path from 'path'
import { transformSync } from '@babel/core'
import { autoI18nPlugin } from './plugins'
import { getSourceCode } from '../utils'
export const autoI18n = () =>
  transformSync(getSourceCode(path.resolve(__dirname, './sourceCode.tsx')), {
    parserOpts: {
      plugins: ['jsx']
    },
    plugins: [autoI18nPlugin]
  })
