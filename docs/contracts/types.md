# Types

With the setup of the data, there are different types of messages that can be sent. These types can be updated over time, based on the sensors that are acquired and set up. However, the core system and the core structure of this setup are used either way. It is important to know that not all messages are the same, and not all message types are the same either. This is because each type is set up in its own JSON file, which is described differently based on its task. For example, the `meta.json` file doesn't act the same as the `motion.detected.json` file. This file describes the types that are set up, along with their general purpose and task.

## Overview

| Type               | Direction       | What it is |
| ------------------ | --------------- | ---------- |
| `meta`             | device → server | "Here's who I am." Sent automatically on every boot, unasked: firmware version and capabilities. The registry uses it to discover the device. |
| `status`           | device → server | "I'm online / offline." `online` is sent right after connecting. `offline` is sent by the broker if the device disappears (last will). It's not a reply to anything. |
| `ack`              | device → server | "I got your command, and here's what happened." The reply to every command: `ok`, `rejected` or `expired`. |
| `device.identify`  | server → device | "Blink so I can find you." The device flashes its LED for a few seconds. Useful when you have five identical soil sensors and need to know which one is `soil-a3f2c1`. It returns no information (only an `ack`). |
| `device.reboot`    | server → device | Restart the device. |
| `config.set`       | server → device | Change a setting remotely, like the reporting interval.|
| `button.pressed`   | device → server | A button was pressed, and how (`single`, `double`, `long`). |
| `light`            | device → server | The light's current actual state. |
| `light.set`        | server → device | Turn on or off, plus brightness. |
| `motion.detected`  | device → server | Motion started. |
| `motion.cleared`   | device → server | Motion stopped. |
| `soil.moisture`    | device → server | A moisture reading. |
| `soil.calibrate`   | server → device | "Remember this as dry" (sensor in air) or "as wet" (sensor in water), so readings become accurate percentages. It checks the current value and sets that value|
| `weight.measured`  | device → server | A stable weight reading. |
| `weight.calibrate` | server → device | "There's exactly 5 kg on you now, adjust your scale factor." |
| `weight.tare`      | server → device | "Set zero to whatever is on you now." Same as the tare button on a kitchen scale: put the bowl on, press tare, and it shows 0. For your scale, it zeroes out the platform's own weight. |

- the soil.moisture has a value called raw. Raw is the unprocessed number in ESP32 actually measure from the sensor.

### config.set.json

`config.set` is used to update how often a device sends messages. But how does that work for devices that send on change rather than periodically? In those cases, the update changes a different setting instead, for example:

| Device   | Useful setting | What it does | Example |
| -------- | -------------- | ------------ | ------- |
| `motion` | `holdSec`      | How long without movement before sending `motion.cleared` | 30 s in a hallway, 5 min in an office where you sit still |
| `scale`  | `minKg`        | Ignore anything lighter | The cat (4 kg) or a bag shouldn't count as "someone stepped on" |
| `scale`  | `stableSec`    | How long the reading must hold steady | 2 s, so wobbling while stepping on doesn't fire |
| `button` | `longPressMs`  | How long a press must last to count as "long" | 800 ms |

## Naming

It is important to note some distinctions here. Each type name matches the name of its file. The first part is one word that describes the subject (`soil`, `weight`, `motion`, ...), while the second part (`pressed`, `detected`, `moisture`, and so on) describes the action that is performed. This is because the same subject can perform different tasks, which means we need to allow different messages to handle their own task. This gives a cleaner single-purpose setup and makes debugging easier later on.

## Universal types

The important distinctions here are `meta`, `status`, and `config.set`. They all include actions that are slightly different, as they don't care which system they belong to but are universal:

- **`meta`**: All units need to send a meta message at startup.
- **`status`**: Each unit sends a status message when it comes online, to inform the system that it is available. The broker sends one on the unit's behalf when it notices the unit is no longer online.
- **`config.set`**: Sets general system configuration. The settings can look very different depending on the system that uses them, but the overall structure and way of working with `config.set` is the same.
