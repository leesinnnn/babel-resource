import path from 'path'
import { transformSync } from '@babel/core';
import { autoTrackPlugin } from './plugin';
import { getSourceCode } from '../utils'

export const injectTracker = () => transformSync(getSourceCode(path.resolve(__dirname, './sourceCode.ts')), {
  plugins: [[autoTrackPlugin, { trackerPath: 'test'}]]
})