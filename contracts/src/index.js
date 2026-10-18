// makes it read only, so that the catalog.json isn't accidently updated.
const deepFreeze = (o) => { 
    Object.values(o).forEach((v) => typeof v === 'object' && deepFreeze(v)); return Object.freeze(o); 
};

module.exports = { 
    ...require('./validate'), 
    ...require('./topics'), 
    catalog: deepFreeze(require('../catalog.json')) 
};