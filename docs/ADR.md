
<!-- DECISIONS -->
<section id="decisions">
  <div class="sec-head">
    <h2>Decision log</h2>
    <p>What we settled while working through the design. Each row becomes one ADR (architecture decision record) in <code>/docs/adr</code> of the new repo, which is the first thing you write.</p>
  </div>
  <div class="tbl-wrap"><table>
    <thead><tr><th>#</th><th>Decision</th><th>Why</th></tr></thead>
    <tbody>
      <tr><td class="num">001</td><td>Mosquitto (MQTT) is the single event bus for devices and containers</td><td>One protocol to learn. Retained messages, last-will and shared subscriptions come built in. Easy to bridge later if you ever outgrow it.</td></tr>
      <tr><td class="num">002</td><td>Messages fall into classes: telemetry, event, state, command, plus meta/status</td><td>The broker has no priority queue. You get priority by separating message classes and giving each its own QoS, retention and expiry.</td></tr>
      <tr><td class="num">003</td><td>Commands expire. Late events are recorded but not acted on.</td><td>A stale command is a bug: the lamp turning on two hours late. A stale reading is still valid history.</td></tr>
      <tr><td class="num">004</td><td>Devices buffer telemetry while offline, keep the original timestamp and mark it <code>buffered: true</code></td><td>History has no gaps, and the rules engine can tell old data from new.</td></tr>
      <tr><td class="num">005</td><td>A central <b>rules-engine</b> container owns all IF-THEN logic. Rules are data in Mongo.</td><td>Devices stay simple. Your future floor-plan UI can show and edit rules without code changes.</td></tr>
      <tr><td class="num">006</td><td>Devices publish their own topics and subscribe only to their own <code>cmd</code> topic</td><td>No device-to-device coupling. Sensors still accept commands such as tare, calibrate or change interval.</td></tr>
      <tr><td class="num">007</td><td>Devices self-announce through a retained <code>meta</code> message and appear as <i>unassigned</i></td><td>Flash, power on, and the device shows up. You place it in a room afterwards.</td></tr>
      <tr><td class="num">008</td><td>Topics are keyed by device id, not location. The room lives in the registry.</td><td>Moving a device is a database edit, never a reflash. History stays under one id.</td></tr>
      <tr><td class="num">009</td><td>One shared JSON envelope, defined as JSON Schema in an <code>@home/contracts</code> package</td><td>Services and firmware validate against the same source of truth. Versioned with <code>schemaVersion</code>.</td></tr>
      <tr><td class="num">010</td><td>Every device and every container gets its own MQTT user and ACL, from day 1</td><td>A buggy container can't spoof the scale. Retrofitting auth later would mean reflashing every device.</td></tr>
      <tr><td class="num">011</td><td>Firmware is a shared core library plus one module per sensor type. The device id comes from the chip's MAC address.</td><td>The same binary goes on ten soil sensors with no edits. WiFi and MQTT credentials are entered on first boot through a captive portal.</td></tr>
      <tr><td class="num">012</td><td>New monorepo <code>home-events</code></td><td>A contract change ships in the same PR as its consumers. Images go to GHCR and deploy through Home_Lab compose, as today.</td></tr>
      <tr><td class="num">013</td><td>LED now, Shelly plug later, behind the same <code>light.set</code> contract</td><td>No mains wiring on a breadboard. Swapping the device later proves the abstraction works.</td></tr>
      <tr><td class="num">014</td><td>First end-to-end proof: simulated button → simulated light, then the real hardware</td><td>The whole chain is tested before the sensors arrive. Later the real devices replace the simulator, sending identical messages.</td></tr>
    </tbody>
  </table></div>
</section>