import { client, baseUrl } from "../../controllers/mqttController.js";
import { updateDroneFromHeartbeat } from "../../controllers/heartbeatController.js";

const HEARTBEAT_TOPIC = "drones/+/heartbeat";

export function heartbeatRouter() {
  client.on("connect", () => {
    client.subscribe(HEARTBEAT_TOPIC);
  });

  client.on("message", (topic, message) => {
    switch (topic) {
      case HEARTBEAT_TOPIC:
        const data = JSON.parse(message.toString());
        const { id, battery_level, gps, timestamp, state } = data;

        const res = updateDroneFromHeartbeat(id, battery_level, {
          latitude: gps.latitude,
          longitude: gps.longitude,
          altitude: 100,
          timestamp: timestamp,
        });

        console.log(res);

        break;
    }
  });
}
