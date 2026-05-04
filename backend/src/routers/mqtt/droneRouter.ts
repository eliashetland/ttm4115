import { getMqttClient } from "../../controllers/mqttController.js";
import { createDrone, getDrone } from "../../controllers/droneController.js";
import type { IDrone } from "../../models/droneModel.js";

const client = getMqttClient();
client.subscribe(`09/drones/create`);
getDrone().forEach((drone) => {
  client.subscribe(`09/drones/${drone.droneId}/drone-ack`);
});

export function droneCreateMQTT(_topic: string, message: string) {
  const droneDetails: {
    nonce: string;
    drone: IDrone;
  } = JSON.parse(message.toString());

  const nonce = droneDetails?.nonce;
  let drone = droneDetails?.drone;

  if (!drone || !nonce) return;

  drone = createDrone(drone);
  client.subscribe(`09/drones/${drone.droneId}/#`);

  const response = JSON.stringify({ id: drone.droneId });
  // if (process.env.MQTT_DEBUG) console.log(response);
  client.publish(`09/drones/nonce/${nonce}/id`, response);
}

export function droneAckMQTT(id: number, _message: string) {
  if (isNaN(id)) {
    if (process.env.MQTT_DEBUG) console.log("Id is not valid");
    return;
  }
  client.publish(`09/drones/${id}/api-ack`, JSON.stringify({ ack: 1 }));
}
