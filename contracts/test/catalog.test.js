const fs = require('fs');
const path = require('path');
const { groups, classes, types } = require('../catalog.json');

const typeEntries = Object.entries(types);
const schemasDir = path.join(__dirname, '../schemas');

// "all" → groups.all, ["light"] → ["light"]
function resolveDeviceTypes(deviceTypes) {
  return typeof deviceTypes === 'string' ? groups[deviceTypes] : deviceTypes;
}

describe('catalog: consistency', () => {
  test.each(typeEntries)('%s has a known class', (name, entry) => {
    expect(Object.keys(classes)).toContain(entry.class);
  });

  test.each(typeEntries)('%s has known, non-empty deviceTypes', (name, entry) => {
    const resolved = resolveDeviceTypes(entry.deviceTypes);
    expect(resolved).toBeDefined();                    // unknown group name → undefined
    expect(resolved.length).toBeGreaterThan(0);        // [] would mean "no device can use it"
    expect(groups.all).toEqual(expect.arrayContaining(resolved));
  });

  test.each(Object.entries(groups))('group %s only has known device types', (name, members) => {
    expect(groups.all).toEqual(expect.arrayContaining(members));
  });

  test.each(typeEntries)('%s schema path follows the naming convention', (name, entry) => {
    expect(entry.schema).toBe(`types/${name}.json`);
  });
});

describe.skip('catalog: matches schema files', () => {   // remove .skip in step 4
  test.each(typeEntries)('%s schema file exists', (name, entry) => {
    const fullPath = path.join(schemasDir, entry.schema);
    expect(fs.existsSync(fullPath)).toBe(true);
  });

  test('every schema file has a catalog entry', () => {
    const fileTypes = fs.readdirSync(path.join(schemasDir, 'types'))
      .filter((f) => f.endsWith('.json'))
      .map((f) => f.replace(/\.json$/, ''));
    expect(fileTypes.sort()).toEqual(Object.keys(types).sort());
  });

  test.todo('every schema file compiles with Ajv');
});

describe('catalog: design decisions', () => {
  test('exactly the 7 classes from ADR-002', () => {
    expect(Object.keys(classes).sort())
      .toEqual(['ack', 'cmd', 'event', 'meta', 'state', 'status', 'telemetry']);
  });

  test('device types match device-types.md', () => {
    expect([...groups.all].sort()).toEqual(['button', 'light', 'motion', 'soil', 'weight']);
  });

  test('weight.measured is an event (the rules-engine must see it)', () => {
    expect(types['weight.measured'].class).toBe('event');
  });

  test.each(['meta', 'status', 'ack', 'device.reboot', 'device.identify'])(
    '%s applies to all devices',
    (name) => expect(types[name].deviceTypes).toBe('all'),
  );
});