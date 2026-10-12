# Contracts

The `contracts` folder defines which messages are allowed in the system and what they must look like. It validates that a message contains everything it needs, and nothing it shouldn't, before it is accepted.

It does **not** contain the logic that handles a message after it has been approved.

> **Note:** The contract validates the same message whether it comes from a device or travels between services. Messages sent between services may carry more information than the ones a device sends. See [Envelope](#envelope) for details.

The contracts folder has three areas:

| Area                    | Purpose                                         |
|-------------------------|-------------------------------------------------|
| [Envelope](#envelope)   | Declares which messages are allowed             |
| [src](#src)             | Validates messages against those declarations   |
| [test](#test)           | Verifies that the validation works as intended  |

---

## Envelope

The envelope declares which kinds of messages are allowed and which are not, including the fields every message must have. [topics.md](topics.md) explains what each field means, whether it is required, and its type.

The envelope does **not** verify anything itself. It only declares which message types are allowed and what each message should look like.

### Types

The `types` folder inside the envelope folder defines the different message types that can be sent. Each type also declares which device types may use it.

After all, a soil sensor should not be able to send an air temperature reading when it doesn't have the electronics for that task. Limiting which devices can send each message lets the system block unsolicited messages that look correct but come from a device that shouldn't be able to perform that task.

---

## src

The `src` folder contains the code that validates messages and handles errors. The envelope declares the requirements; `src` checks that a message follows them.

It does **not** check whether the content itself is correct or usable. For example, a timestamp can have a valid format but still hold the wrong time. That kind of check is left to the subscribers, because a value may be fine for one subscriber but not for another.

The `src` folder has three files:

| File          | Purpose |
|---------------|---------|
| `envelope.js` | Validates that the message contains the required information, based on the envelope. |
| `index.js`    | _TBD_ |
| `topics.js`   | Validates that the topic exists and is allowed for the device. |

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
