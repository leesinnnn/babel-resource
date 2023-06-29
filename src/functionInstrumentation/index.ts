import { transformSync } from '@babel/core';
import { autoTrackPlugin } from './plugin';
import sourceCode from './sourceCode';

export const instrumentation = () => transformSync(sourceCode, {
  plugins: [[autoTrackPlugin, { trackerPath: 'test'}]]
})