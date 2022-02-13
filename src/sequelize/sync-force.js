import { createAssociations } from './models/associations.js';
import { sequelizeSync } from './sync.js';


createAssociations()
await sequelizeSync(true)
