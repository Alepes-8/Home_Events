# Contracts

The `contracts` folder defines which messages are allowed in the system and what they must look like. It validates that a message contains everything it needs, and nothing it shouldn't, before it is accepted.

It does **not** contain the logic that handles a message after it has been approved.

> **Note:** The contract validates the same message whether it comes from a device or travels between services. Messages sent between services may carry more information than the ones a device sends. See [schema](#schema) for details.

The contracts folder has three areas:

| Area              | Purpose                                         |
|-------------------|-------------------------------------------------|
| [schema](#schema) | Declares which messages are allowed             |
| [src](#src)       | Validates messages against those declarations   |
| [test](#test)     | Verifies that the validation works as intended  |

---

## Schema

The schema declares which kinds of messages are allowed and which are not, including the fields every message must have. [topics.md](topics.md) explains what each field means, whether it is required, and its type.

The schema is divided into two parts: the **envelope** and the **types**.

- The **envelope** describes what the whole message must look like, not including the topic. This covers fields such as the device type, the message data, `deviceId` and `schemaVersion`.
- The **types** describe what each allowed message type must contain in its `data`. The envelope tells us which fields are needed to identify the device, but not what the data should hold. For example, a message from a soil sensor should not be able to carry weight-scaling information. Each type schema therefore lists the fields its data may contain. It only covers the fields in `data`, not what the topic must look like.

The envelope and type schemas do **not** verify anything themselves. They only declare which message types are allowed and what each message should look like. The `src` code does the verification based on these schemas.

### Types

When a new type is added, a new schema must be created listing each of the parameters it allows. Note that adding a type schema does not set anything else up automatically. See [setup_of_new_type.md](setup_of_new_type.md) for the full setup.

### Envelope

If the envelope is updated in the future because a new parameter is required, the schema version will be increased. This means that devices will need to handle the new schema. The system accepts one previous version of the schema, but supporting two versions at once requires extra work.

---

## src

The `src` folder contains the code that validates messages and handles errors. The schemas declare the requirements; `src` checks that a message follows them.

It does **not** check whether the content itself is correct or usable. For example, a timestamp can have a valid format but still hold the wrong time. That kind of check is left to the subscribers, because a value may be fine for one subscriber but not for another.

The `src` folder has six files:

| File          | Purpose |
|---------------|---------|
| `envelope.js` | Validates that the message contains the required information, based on the envelope schema. |
| `data.js`     | Validates that the message's `data` matches the type schema for the type the message states. |
| `topics.js`   | Builds and parses topics, and validates that the topic exists and is allowed for the device. |
| `validate.js` | Validates the whole message, using the checks provided by `data.js`, `envelope.js` and `topics.js`. If it approves the message, the message and its topic are valid in the current system. See [validate.md](validate.md). |
| `errors.js`   | Contains the internal error handling for the contracts `src` code. |
| `index.js`    | Exposes the parts of `src` that external code needs. See [Index](#index). |

### Index

`index.js` is the file that any external code references when using the contracts. It gives external services access to only the parts they actually need:

- **validate**: checks whether the message and topic are valid as a whole, and returns either an approval or an error for the message.
- **topics**: does not do validation itself. It provides a single, shared way to build topics and to break a topic apart into its core information. Instead of each service building topic strings by hand, risking typos and missed messages, every service (and the validation itself) uses these functions.
- **catalog**: the contents of `catalog.json`, made read-only. Every device needs to know which kinds of message it may send, and which class each message type belongs to.

---

## test

The `test` folder verifies that the `src` code works as intended. This matters when someone later makes changes without knowing all the functionality or every connection. Any update must leave the tests green, or the tests must be updated to match the new validation requirements.

The tests go through each part of `src` and check it against fixtures of correctly formed messages.

---

## Extra files

### `catalog.json`

`catalog.json` isn't tied to any of the folders above. It defines:

- which **device types** may use each message type
- which **message class** each message type belongs to

See the *Device topics* section in [topics.md](topics.md) for more about the classes.

The catalog is organised to be easy to update:

- **Classes** are listed in their own section, so it is clear which kinds of message exist.
- **Device groups** collect device types under a shared name, which makes adding a new device type simple.

### One class per type

Each message type has exactly **one** class, because the class describes the message's action. Instead of letting one message do several things, add a new message type for each action. Then give it a class and list the device types allowed to use it. This keeps every type easy to handle and makes it easy to add more types later.
