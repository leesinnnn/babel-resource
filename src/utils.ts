import fs from 'fs'
export const getSourceCode = (filePath: string) =>
  fs.readFileSync(filePath).toString()