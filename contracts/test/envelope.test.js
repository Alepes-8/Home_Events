const { validateEnvelope } = require('../src/envelope');

describe('envelope', () => {
  test('accepts a valid message', () => {
    const message = require('./fixtures/valid/button.pressed.json');
    const result = validateEnvelope(message);

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
  });

  // [fixture file, text the error must contain]
  test.each([
    ['envelope.bad-device-id.json', '/deviceId'],
    ['envelope.missing-id.json',    "required property 'id'"],
    ['envelope.ts-string.json',     '/ts'],
  ])('rejects %s', (file, expectedError) => {
    const message = require(`./fixtures/invalid/${file}`);
    const result = validateEnvelope(message);

    expect(result.ok).toBe(false);
    expect(result.errors.join('\n')).toContain(expectedError);
  });
});