import { client } from "../../controllers/mqttController.js";
import { createDrone, getDrone } from "../../controllers/droneController.js";
import type { IDrone } from "../../models/droneModel.js";

client.subscribe(`drones/create`);
getDrone().forEach((drone) => {
  client.subscribe(`drones/${drone.droneId}/droneAck`);
});

export function droneCreateMQTT(topic: string, message: string) {
  const droneDetails: {
    nonce: number;
    timestamp: EpochTimeStamp;
    drone: IDrone;
  } = JSON.parse(message.toString());

  const nonce = droneDetails?.nonce;

  const timestamp = droneDetails?.timestamp;

  let drone = droneDetails?.drone;

  if (!drone || !nonce || !timestamp) {
    return;
  }

  drone = createDrone(drone);

  client.subscribe(`drones/${drone.droneId}/#`);

  const response = JSON.stringify(drone);

  if (process.env.MQTT_DEBUG) console.log(response);

  client.publish(`drones/nonce/${nonce}/timestamp/${timestamp}/id`, response);
}

export function droneAckMQTT(id: number, message: string) {
  if (isNaN(id)) {
    if (process.env.MQTT_DEBUG) console.log("Id is not valid");
    return;
  }
  client.publish(`drones/${id}/APIAck`, JSON.stringify({ ack: 1 }));
}
