import express from "express";
import exampleMiddleware from "./src/middlewares/exampleMiddleware.js";
import cors from "cors";
import dronePositionRouter from "./src/routers/dronePositionRouter.js";
import droneRouter from "./src/routers/droneRouter.js";
import orderRouter from "./src/routers/orderRouter.js";
import "dotenv/config";

const app = express();
app.use(cors({ origin: ["http://localhost:5173"], credentials: true }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.send("ok");
});

app.use(exampleMiddleware);
app.use("/api/drone", droneRouter);
app.use("/api/drone-position", dronePositionRouter);
app.use("/api/order", orderRouter);

app.listen(3000, (err) => {
  const status = !err ? "Success" : "Failed";
  console.log(`Express listen status: ${status} ${err}`);
});

import mqttRouter from "./src/routers/mqtt/mqttRouter.js";
import { getMqttClient } from "./src/controllers/mqttController.js";
// import { startBatteryDrainTimer, resumeChargingDrones } from "./src/services/droneMovementService.js";
import { deliveryQueueService } from "./src/services/deliveryQueueService.js";
import { orders } from "./src/db/db.js";

// startBatteryDrainTimer();
// resumeChargingDrones();

// Enqueue all seed orders at startup with a short stagger
orders.forEach((order, index) => {
  setTimeout(() => {
    deliveryQueueService.addToQueue(order);
    console.log(`Enqueued order ${order.id} (${order.firstName} ${order.lastName})`);
  }, 2000 + index * 500);
});

if (process.env.MQTT_DEBUG) console.log("MQTT DEBUG ON");
const client = getMqttClient();
client.on("message", (topic, payload) => {
  if (process.env.MQTT_DEBUG)
    // console.log(`MQTT Router got topic: ${topic} and message: ${payload}`);
  try {
    mqttRouter(topic, payload);
  } catch (error) {
    console.log(error);
  }
});
