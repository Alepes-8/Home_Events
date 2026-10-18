const { schemaVersion, groups, types } = require('../catalog.json');
const { parseTopic } = require('./topics');
const { validateEnvelope } = require('./envelope');
const { validateData } = require('./data');

const CLASS_FIELDS = {
  cmd: ['correlationId', 'source', 'expiresAt'],
  ack: ['correlationId', 'result'],
};
const OPTIONAL_FIELDS = ['correlationId', 'source', 'expiresAt', 'result'];

// "all" → groups.all, ["light"] → ["light"]
const resolveDeviceTypes = (deviceTypes) =>
  typeof deviceTypes === 'string' ? groups[deviceTypes] : deviceTypes;

// Full check of a message received on a topic: topic → envelope → catalog rules → data
function validate(topic, msg) {
    const fail = (...errors) => ({ ok: false, errors }); 

    //validate that the topic is fine.
    const parsed = parseTopic(topic) // here we get: deviceId, deviceType, cls
    if(!parsed.ok) return fail(parsed.error)

    //validate the msg follows enveolope schema
    const envelope = validateEnvelope(msg);
    if (!envelope.ok) return fail(...envelope.errors);

    //check version approval
    if (!schemaVersion.supported.includes(msg.schemaVersion)) {
        return fail(`unsupported schemaVersion: ${msg.schemaVersion}`);
    }

    // validate type in catalog
    if (!Object.hasOwn(types, msg.type)) return fail(`unknown type: ${msg.type}`);
        const entry = types[msg.type];

    // validate that the catalog topic class match type class
    if (entry.class !== parsed.cls) {
        return fail(`type ${msg.type} belongs to class ${entry.class}, not ${parsed.cls}`);
    }

    // validate if device is allowed the type
    if (!resolveDeviceTypes(entry.deviceTypes).includes(parsed.deviceType)) {
        return fail(`${parsed.deviceType} devices may not use ${msg.type}`);
    }

    // does the msg device id match the device id
    if (msg.deviceId !== parsed.deviceId) {
        return fail(`deviceId ${msg.deviceId} does not match topic deviceId ${parsed.deviceId}`);
    }

    // Class-specific fields: cmd needs correlationId, source, expiresAt; ack needs correlationId, result; other classes must not have them
    const required = CLASS_FIELDS[parsed.cls] ?? [];    // check if the ack is included in class fields
    const missing = required.filter((f) => !Object.hasOwn(msg, f));  // check if any of the extra fields are missing
    if (missing.length) return fail(`${parsed.cls} requires: ${missing.join(', ')}`);

    // go through all the optional fiels and see if the msg has one that it is not allowed to have despite being ACK or CMD.
    const forbidden = OPTIONAL_FIELDS.filter((f) => !required.includes(f) && Object.hasOwn(msg, f)); // Which optional fields does this message have that its class is not allowed to have?
    if (forbidden.length) return fail(`${parsed.cls} must not have: ${forbidden.join(', ')}`);

    // validate msg data match type schema.
    const data = validateData(msg.type, msg.data);
    if (!data.ok) return fail(...data.errors);

    return { ok: true, errors: [] };
}

module.exports = { validate };
