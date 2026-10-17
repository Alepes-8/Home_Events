const { topicFor, parseTopic } = require('../src/topics');

describe('topicFor', () => {
  test('builds a topic for a valid deviceId and class', () => {
    expect(topicFor('soil-a3f2c1', 'telemetry')).toBe('home/v1/device/soil-a3f2c1/telemetry');
  });

  test.each([
    ['soil-a3f2c1', 'random',    'Unknown class'],
    ['soil-a3f2c1', 'constructor', 'Unknown class'],   // inherited-property trap
    ['Soil 1',      'event',     'Invalid deviceId'],
    ['toaster-a3f2c1', 'event',  'Unknown device type'],
  ])('throws for (%s, %s)', (deviceId, cls, message) => {
    expect(() => topicFor(deviceId, cls)).toThrow(message);
  });
});

describe('parseTopic: valid', () => {
  test.each([
    ['home/v1/device/soil-a3f2c1/telemetry', { deviceId: 'soil-a3f2c1', deviceType: 'soil',  cls: 'telemetry' }],
    ['home/v1/device/light-0b12ff/cmd',      { deviceId: 'light-0b12ff', deviceType: 'light', cls: 'cmd' }],
  ])('parses %s', (topic, expected) => {
    expect(parseTopic(topic)).toEqual({ ok: true, ...expected });
  });
});

describe('parseTopic: invalid', () => {
  test.each([
    ['house/v1/device/soil-a3f2c1/telemetry',        'unknown root'],
    ['home/v2/device/soil-a3f2c1/telemetry',         'unsupported topic version'],
    ['home/v1/devices/soil-a3f2c1/telemetry',        'unknown section'],
    ['home/v1/device/soil-a3f2c1/temperature',       'unknown class'],
    ['home/v1/device/Soil-1/telemetry',              'invalid deviceId'],
    ['home/v1/device/toaster-a3f2c1/event',          'unknown device type'],
    ['home/v1/device/soil-a3f2c1',                   'expected 5 segments'],
    ['home/v1/device/soil-a3f2c1/telemetry/extra',   'expected 5 segments'],
  ])('rejects %s', (topic, reason) => {
    const result = parseTopic(topic);
    expect(result.ok).toBe(false);
    expect(result.error).toContain(reason);
  });
});