# Topics & message contract

Status: v1 · see ADR-002, 003, 004, 008, 009

## Principles
- Topics contain only what never changes: **version, device identity, message class**.
- Anything that can change (room, name, thresholds) lives in **data** (the registry), never in the topic.
- `v1` lets the scheme change later without breaking existing devices.

## Topic tree

### Device topics
```
home/v1/device/{deviceId}/{class}
```
`deviceId` format: `{type}-{last 6 hex of MAC}`, e.g. `soil-a3f2c1`

| class       | Publisher → subscriber          | QoS | Retained | Purpose |
|-------------|---------------------------------|-----|----------|---------|
| `meta`      | device → registry               | 1   | yes      | Who I am: type, firmware, capabilities. Sent on every boot. |
| `status`    | device / broker (LWT) → anyone  | 1   | yes      | `online` on connect, `offline` via last will |
| `telemetry` | device → recorder               | 0/1 | no       | Periodic readings. May be `buffered: true`. |
| `event`     | device → rules-engine, recorder | 1   | no       | Something happened. Publish on change only. |
| `state`     | actuator → anyone               | 1   | yes      | Current actual state (reported, not requested) |
| `cmd`       | rules-engine → one device       | 1   | no       | Do something. Always expires. |
| `ack`       | device → rules-engine           | 1   | no       | Result of a command, matched by `correlationId` |

### System topics
| Topic                                   | Publisher     | Retained | Purpose |
|-----------------------------------------|---------------|----------|---------|
| `home/v1/system/{service}/status`       | each service  | yes      | Service online/offline (last will) |
| `home/v1/system/registry/changed`       | registry      | no       | A device was added, moved, renamed or retired |
| `home/v1/automation/{ruleId}/fired`     | rules-engine  | no       | A rule ran, with its result (audit / UI) |

## Subscription patterns (who listens to what)
| Subscriber      | Pattern(s) |
|-----------------|------------|
| device-registry | `home/v1/device/+/meta`, `home/v1/device/+/status` |
| rules-engine    | `home/v1/device/+/event`, `home/v1/device/+/state`, `home/v1/device/+/ack` |
| recorder        | `$share/recorder/home/v1/device/+/telemetry` (+ event, state, ack) |
| a device        | `home/v1/device/{itsOwnId}/cmd` only |

`+` = exactly one level, `#` = everything below. The rules-engine never subscribes to telemetry, which keeps high-volume readings away from automations (ADR-002).

## Envelope (every message)
| Field           | Type     | Required | Notes |
|-----------------|----------|----------|-------|
| `id`            | ULID     | yes      | Unique per message, used to drop duplicates (QoS 1 = at-least-once) |
| `schemaVersion` | int      | yes      | Starts at 1, we suport current version and current version - 1 |
| `deviceId`      | string   | yes      | Must match the topic's `{deviceId}` |
| `type`          | string   | yes      | e.g. `soil.moisture`, `light.set`; must belong to the topic's class |
| `ts`            | epoch ms | yes      | When it happened, on the device clock |
| `seq`           | int      | yes      | Per-device counter, reveals gaps |
| `buffered`      | boolean  | no       | true if sent late from the ring buffer |
| `data`          | object   | yes      | Type-specific payload (see device-types.md) |

Commands add: `correlationId`, `source` (e.g. `rules-engine/rule-12`), `expiresAt` (epoch ms).
Acks add: `correlationId`, `result` (`ok` | `rejected` | `expired`).

## Rules
1. **Commands expire.** Broker expiry (MQTT v5) *and* `expiresAt` in the payload. The device checks `expiresAt` itself, because ESP32 PubSubClient speaks MQTT 3.1.1 and never sees broker expiry (ADR-003).
2. **Late events are recorded, not acted on.** The rules-engine skips events older than the rule's `maxEventAgeSec`.
3. **Commands carry target state, not toggles.** `light.set {on: true}`, never `light.toggle`, so a duplicate delivery is harmless.
4. **Consumers never guess.** Unknown `schemaVersion` or `type` → log, count in a metric, drop.

## Versioning
- Adding an optional field → same `schemaVersion`.
- Renaming, removing or changing the meaning of a field → bump `schemaVersion`. Consumers support both versions during a transition.