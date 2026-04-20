import { client } from "../../controllers/mqttController.js";
import { createDrone } from "../../controllers/droneController.js";

import type { IDrone } from "../../models/droneModel.js";

client.subscribe("drones/create");

client.on("message", (topic, payload) => {
  if (topic != "drones/create") {
    return;
  }

  const droneDetails: {
    nonce: number;
    timestamp: EpochTimeStamp;
    drone: IDrone;
  } = JSON.parse(payload.toString());

  const nonce = droneDetails?.nonce;

  const timestamp = droneDetails?.timestamp;

  let drone = droneDetails?.drone;

  if (!drone || !nonce || !timestamp) {
    return;
  }

  drone = createDrone(drone);

  client.subscribe(`drones/${drone.droneId}/+`);

  const message = JSON.stringify({ nonce: nonce, timestamp: timestamp, drone: drone });

  client.publish(topic, message);
});

client.on("message", (topic, payload) => {
  const topicDetails = topic.split("/");
  const id = topic.at(1);
  if (
    topicDetails.length == 3 &&
    topic.at(0) != "drones" &&
    id &&
    topic.at(2) != "ack"
  ) {
    return;
  }

  client.publish(topic, payload);
});
