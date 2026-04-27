import { client } from "../../controllers/mqttController.js";
import { createDrone, getDrone } from "../../controllers/droneController.js";
import type { IDrone } from "../../models/droneModel.js";

export function droneRouter() {
  client.subscribe("drones/create");

  getDrone().forEach((drone)=>{
    client.subscribe(`drones/${drone.droneId}/#`)
  })

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

    client.subscribe(`drones/${drone.droneId}/#`);

    const message = JSON.stringify(drone);
    console.log(message);
    client.publish(`drones/nonce/${nonce}/timestamp/${timestamp}/id`, message);
  });

  client.on("message", (topic, payload) => {
    const topicDetails = topic.split("/");
    const id = topic.at(1);
    if (
      topicDetails.length == 3 &&
      topic.at(0) != "drones" &&
      id &&
      topic.at(2) != "api"
    ) {
      return;
    }

    client.publish(`drone/${id}/drone`, JSON.stringify({ack: 1}))
  });
}
