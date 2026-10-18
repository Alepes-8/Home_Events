# Validate

The validation code runs the input through each validation step to check that it is approved. If a message passes through the validate file, it is approved to continue. The steps run in the following order:

| # | Check | Handled by |
|---|-------|------------|
| 1 | Is the topic well-formed? | `parseTopic` |
| 2 | Is the envelope well-formed? | `validateEnvelope` |
| 3 | Is the `schemaVersion` supported (N or N-1)? | new |
| 4 | Is `type` in the catalog? | catalog |
| 5 | Does the type’s class match the topic’s class? (`soil.moisture` must arrive on `…/telemetry`) | catalog + topic |
| 6 | May this device type use this type? (soil can’t send `button.pressed`) | catalog + topic |
| 7 | Does `msg.deviceId` match the topic’s `deviceId`? | topic + message |
| 8 | Class-specific fields: `cmd` needs `correlationId`, `source`, `expiresAt`; `ack` needs `correlationId`, `result`; other classes must not have them | catalog + message |
| 9 | Is `data` valid for its type? | `validateData` |

Each step is done either directly within the validation code or within the respective file responsible for that task.