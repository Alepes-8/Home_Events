const Ajv = require('ajv');
const envelopeSchema = require('../schemas/envelope.schema.json');

//Another JSON Schema Validator
const ajv = new Ajv({ allErrors: true });      // strict mode stays ON (default)
const checkEnvelope = ajv.compile(envelopeSchema); // compiled ONCE, at load time

function formatErrors(errors = []) {
  return errors.map((e) => `${e.instancePath || '/'} ${e.message}`);
}

function validateEnvelope(message) {
  const ok = checkEnvelope(message);
  return ok ? { ok: true, errors: [] } : { ok: false, errors: formatErrors(checkEnvelope.errors) };
}

module.exports = { validateEnvelope };