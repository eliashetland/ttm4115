import express from "express";
import exampleRouter from "./src/routers/exampleRouter.js";
import exampleMiddleware from "./src/middlewares/exampleMiddleware.js";
import cors from "cors";
import dronePositionRouter from "./src/routers/dronePositionRouter.js";
import droneRouter from "./src/routers/droneRouter.js";
import orderRouter from "./src/routers/orderRouter.js";

//express setup
const app = express();
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  }),
);
app.use(express.json());

app.get("/health", (req, res) => {
  res.send("ok");
});

app.use(exampleMiddleware);

app.use("/api/example", exampleRouter);
app.use("/api/drone", droneRouter);
app.use("/api/drone-position", dronePositionRouter);
app.use("/api/order", orderRouter);

app.listen(3000, (err) => {
  const status = !err ? "Success" : "Failed";
  console.log(`Express listen status: ${status} ${err}`);
});

import mqttRouter from "./src/routers/mqtt/mqttRouter.js";
import { client } from "./src/controllers/mqttController.js";
// Starts MQTT endpoints
if (process.env.MQTT_DEBUG) console.log("MQTT DEBUG ON");
client.on("message", (topic, payload) => {
  if (process.env.MQTT_DEBUG)
    console.log(`MQTT Router got topic: ${topic} and message: ${payload}`);
  try {
    mqttRouter(topic, payload);
  } catch (error) {
    console.log(error)
  }
});
