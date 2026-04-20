import mqtt from "mqtt";

const mqttHost = "HAHA"
export const client = mqtt.connect(`mqtt://${mqttHost}`)