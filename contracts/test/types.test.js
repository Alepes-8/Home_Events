const { validateData } = require('../src/data');
const testValues = require('./fixtures/types.json');

// [type, data] pairs flattened out of fixtures/types.json
const pairs = (key) =>
  Object.entries(testValues).flatMap(([type, cases]) => (cases[key] ?? []).map((data) => [type, data]));

describe('validateData: valid', () => {
    // validate that the type.json data
    test.each(pairs('valid'))('parses %s', (type, data) => {
        expect(validateData(type, data)).toEqual({ ok: true, errors: [] });
    });
});

describe('validateData: invalid', () => {
  test.each(pairs('invalid'))('%s rejects %j', (type, data) => {
    const result = validateData(type, data);
    expect(result.ok).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

describe('Invalid Validate: bad input', () => {
    test('rejects a non-string type', () => {
        expect(validateData(42, {})).toEqual({ ok: false, errors: ['type must be a string'] });
    });

    test('rejects an unknown type', () => {
        expect(validateData('toaster.toast', {})).toEqual({ ok: false, errors: ['unknown type: toaster.toast'] });
    });
})

describe('fixture coverage', () => {
  test('every catalog type has fixtures', () => {
    const { types } = require('../catalog.json');
    expect(Object.keys(testValues).sort()).toEqual(Object.keys(types).sort());
  });

  test.each(Object.keys(testValues))('%s has valid and invalid fixtures', (type) => {
    expect(testValues[type].valid?.length).toBeGreaterThan(0);
    expect(testValues[type].invalid?.length).toBeGreaterThan(0);
  });
});
