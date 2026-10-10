# Device types

The event system supports a wide range of event types, depending on which implementations have been built and are supported. The following device types are implemented (or are currently being developed):

| Device type | Publishes | Receives | Status |
|---|---|---|---|
| Button | A press event: single, double, or long press. Each type can trigger a different result. | None | Planned |
| Light | Its current state (on/off and brightness), including periodic updates that it is still on. It is mainly a receiving unit that acts on incoming commands using its own internal logic. | `light.set` | Planned |
| Motion sensor | Motion events for a location, mainly `motion detected` and `motion cleared`. | `config.set`: how long to wait before reporting motion as cleared. | Planned |
| Soil sensor | Moisture and other soil data, as raw values and percentages, depending on the unit's capabilities. | `config.set`: how often to send status updates, plus configuration for the unit's own sensors. | Planned |
| Weight sensor | Single weight readings, optionally with extra information such as what or who is being weighed and the unit of measurement. | `config.set`: scale calibration and unit settings (e.g. kg or lb). | Planned |
| Humidity/temperature sensor | Current readings at a set interval. | `config.set`: how often to send readings. | Planned |