import mqtt from "mqtt";

const mqttHost = `${process.env.MQTT_HOST}`;
const mqttPort = `${process.env.MQTT_PORT}`;
const url = `mqtt://${mqttHost}:${mqttPort}`;

export const client = mqtt.connect(url);
if (process.env.MQTT_DEBUG) {
  console.log("Connecting to:", url);

  client.on("connect", () => {
    console.log("✅ MQTT connected");
  });

  client.on("reconnect", () => {
    console.log("🔄 MQTT reconnecting...");
  });

  client.on("close", () => {
    console.log("❌ MQTT connection closed");
  });

  client.on("offline", () => {
    console.log("📴 MQTT offline");
  });

  client.on("end", () => {
    console.log("🛑 MQTT connection ended");
  });

  client.on("error", (err) => {
    console.error("🚨 MQTT error:", err.message);
  });
}
