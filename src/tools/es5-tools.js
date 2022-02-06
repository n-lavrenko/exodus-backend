import { createRequire } from 'module'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'


export const require = createRequire(import.meta.url)
export const __filename = fileURLToPath(import.meta.url)
export const __dirname = path.join(dirname(__filename), '../../')
