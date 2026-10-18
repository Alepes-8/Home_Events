const path = require('path');
const Ajv = require('ajv');
const { types } = require('../catalog.json');
const schemasDir = path.join(__dirname, '../schemas');
const {formatErrors} = require('./errors.js');

const ajv = new Ajv({ allErrors: true });      // strict mode stays ON (default)

function compileSchema(name, entry) {
  try {
    return ajv.compile(require(path.join(schemasDir, entry.schema)));
  } catch (err) {
    throw new Error(`schema for "${name}" (${entry.schema}) is invalid: ${err.message}`);
  }
}

// Create a map containing schema name, and compiled validator. compiled once
const checkData = Object.fromEntries(
  Object.entries(types).map(([name, entry]) => [name, compileSchema(name, entry)]),
);

function validateData(type, data) {
  const fail = (...errors) => ({ ok: false, errors });

  if (typeof type !== 'string') return fail('type must be a string');

  //check if the list of schemas has the type.
  if (!Object.hasOwn(checkData, type)) return fail(`unknown type: ${type}`);

  const check = checkData[type];
  return check(data) ? { ok: true, errors: [] } : fail(...formatErrors(check.errors));
}

module.exports = { validateData };
