function formatErrors(errors = []) {
  return errors.map((e) => `${e.instancePath || '/'} ${e.message}`);
}

module.exports = { formatErrors }