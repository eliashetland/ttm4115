import { droneAckMQTT, droneCreateMQTT } from "./droneRouter.js";
import { heartbeatMQTT } from "./heartbeatRouter.js";

export default function mqttRouter(
  topic: string,
  message: Buffer<ArrayBufferLike>,
) {
  function isJSON(strJson: string) {
    try {
      const parsed = JSON.parse(strJson);
      if (parsed && typeof parsed === "object") {
        return true;
      }
    } catch {
      return false;
    }
    return false;
  }

  if (!isJSON(message.toString())) {
    if (process.env.MQTT_DEBUG) console.log("Not a valid JSON");
    return;
  }

  const strId = topic.split("/").at(1);
  const id = parseInt(strId ? strId : "");

  // if(process.env.MQTT_DEBUG && isNaN(id)) console.log(`09/drones/${id}/droneAck`)

  let strMessage = message.toString();

  switch (topic) {
    case "09/drones/create":
      droneCreateMQTT(topic, strMessage);
      break;
    case `09/drones/${id}/drone-ack`:
      droneAckMQTT(id, strMessage);
      break;
    default:
      if (topic.endsWith("/heartbeat")) {
        heartbeatMQTT(topic, strMessage);
      } else {
        console.log(`No MQTT router found for topic: ${topic}`);
      }
      break;
  }
}
