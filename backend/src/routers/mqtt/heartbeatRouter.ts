import { client } from "../../controllers/mqttController.js";
import { updateDroneFromHeartbeat } from "../../controllers/heartbeatController.js";

const HEARTBEAT_TOPIC = "drones/+/heartbeat";
client.on("connect", () => {
  client.subscribe(HEARTBEAT_TOPIC);
});

export function heartbeatMQTT(topic: string, message: string) {
  const data = JSON.parse(message.toString());
  const { id, battery_level, gps, timestamp, delivery_status } = data;

  const res = updateDroneFromHeartbeat(
    id,
    battery_level,
    {
      latitude: gps.latitude,
      longitude: gps.longitude,
      altitude: 100,
      timestamp: timestamp,
    },
    delivery_status   
  );

  if (process.env.MQTT_DEBUG) console.log(res);
}
