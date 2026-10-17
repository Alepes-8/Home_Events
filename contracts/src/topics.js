const catalog = require('../catalog.json');
const envelopeSchema = require('../schemas/envelope.schema.json');

const ROOT = 'home';
const TOPIC_VERSION = 'v1';
const SECTION = 'device';
const PREFIX = `${ROOT}/${TOPIC_VERSION}/${SECTION}`;

// One source of truth: same pattern the envelope schema uses
const DEVICE_ID = new RegExp(envelopeSchema.properties.deviceId.pattern);

const isClass = (cls) => Object.hasOwn(catalog.classes, cls);
const isDeviceType = (type) => catalog.groups.all.includes(type);
const deviceTypeOf = (deviceId) => deviceId.split('-')[0];

// Used by OUR code → bad input is a bug → throw
function topicFor(deviceId, cls) {
  if (typeof deviceId !== 'string' || !DEVICE_ID.test(deviceId)) {
    throw new Error(`Invalid deviceId: ${deviceId}`);
  }
  if (!isDeviceType(deviceTypeOf(deviceId))) {
    throw new Error(`Unknown device type: ${deviceTypeOf(deviceId)}`);
  }
  if (!isClass(cls)) {
    throw new Error(`Unknown class: ${cls}`);
  }
  return `${PREFIX}/${deviceId}/${cls}`;
}

// Input from the NETWORK → bad input is expected → return
function parseTopic(topic) {
  const fail = (error) => ({ ok: false, error });

  if (typeof topic !== 'string') return fail('topic must be a string');

  const parts = topic.split('/');
  if (parts.length !== 5) return fail(`expected 5 segments, got ${parts.length}`);

  const [root, version, section, deviceId, cls] = parts;
  if (root !== ROOT) return fail(`unknown root: ${root}`);
  if (version !== TOPIC_VERSION) return fail(`unsupported topic version: ${version}`);
  if (section !== SECTION) return fail(`unknown section: ${section}`);
  if (!DEVICE_ID.test(deviceId)) return fail(`invalid deviceId: ${deviceId}`);

  const deviceType = deviceTypeOf(deviceId);
  if (!isDeviceType(deviceType)) return fail(`unknown device type: ${deviceType}`);
  if (!isClass(cls)) return fail(`unknown class: ${cls}`);

  return { ok: true, deviceId, deviceType, cls };
}

module.exports = { topicFor, parseTopic };