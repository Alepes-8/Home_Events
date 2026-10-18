const { validate } = require('../src/validate');
const valid = require('./fixtures/valid/validate.json');
const invalid = require('./fixtures/invalid/validate.invalid-inputs.json');

describe('validate: valid', () => {
  test.each(Object.entries(valid))('accepts %s', (name, fixture) => {
    expect(validate(fixture.topic, fixture.message)).toEqual({ ok: true, errors: [] });
  });
});

describe('validate: invalid', () => {
  test.each(Object.entries(invalid))('rejects %s', (name, fixture) => {
    expect(fixture.expectedError).toEqual(expect.any(String));   // guard: every fixture states why

    const result = validate(fixture.topic, fixture.message);
    expect(result.ok).toBe(false);
    expect(result.errors.join('\n')).toContain(fixture.expectedError);
  });
});