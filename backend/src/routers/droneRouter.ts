import { Router } from "express";
import {
  createDrone,
  getDrone,
  getDroneById,
  updateDroneBatteryLevel,
} from "../controllers/droneController.js";

const droneRouter = Router();

droneRouter.get("/", (req, res) => {
  const drones = getDrone();
  res.json(drones);
});

droneRouter.get("/:id", (req, res) => {
  const id = parseInt(req.params.id);
  if (!id) {
    return res.status(400).json({ message: "Invalid drone ID" });
  }
  const drone = getDroneById(id);
  if (!drone) {
    return res.status(404).json({ message: "Drone not found" });
  }
  res.json(drone);
});

droneRouter.get("/:id/battery", (req, res) => {
  const id = parseInt(req.params.id);
  if (!id) {
    return res.status(400).json({ message: "Invalid drone ID" });
  }

  const drone = getDroneById(id);
  if (!drone) {
    return res.status(404).json({ message: "Drone not found" });
  }

  return res.status(200).json({ batteryLevel: drone.batteryLevel });
});

droneRouter.get("/:id/delivery-status", (req, res) => {
  const id = parseInt(req.params.id);
  if (!id) {
    return res.status(400).json({ message: "Invalid drone ID" });
  }

  const drone = getDroneById(id);
  if (!drone) {
    return res.status(404).json({ message: "Drone not found" });
  }

  return res.status(200).json({ deliveryStatus: drone.deliveryStatus });
});

droneRouter.put("/:id/delivery-status", (req, res) => {
  const id = parseInt(req.params.id);
  if (!id) {
    return res.status(400).json({ message: "Invalid drone ID" });
  }

  const { deliveryStatus } = req.body;
  if (!deliveryStatus) {
    return res.status(400).json({ message: "deliveryStatus is required" });
  }

  const drone = getDroneById(id);
  if (!drone) {
    return res.status(404).json({ message: "Drone not found" });
  }

  drone.deliveryStatus = deliveryStatus;
  return res.status(200).json(drone);
});


droneRouter.post("/", (req, res) => {
  const newDroneData = req.body;
  if (!newDroneData.name || !newDroneData.model || !newDroneData.manufacturer) {
    return res.status(400).json({ message: "Missing required drone data" });
  }

  const newDrone = createDrone(newDroneData);
  if (!newDrone) {
    return res.status(500).json({ message: "Failed to create drone" });
  }

  res.status(201).json(newDrone);
});

droneRouter.put("/:id/battery", (req, res) => {
  const id = parseInt(req.params.id);
  if (!id) {
    return res.status(400).json({ message: "Invalid drone ID" });
  }

  const { batteryLevel } = req.body;
  if (
    typeof batteryLevel !== "number" ||
    batteryLevel < 0 ||
    batteryLevel > 100
  ) {
    return res.status(400).json({ message: "Invalid battery level" });
  }

  const updatedDrone = updateDroneBatteryLevel(id, batteryLevel);
  if (!updatedDrone) {
    return res.status(404).json({ message: "Drone not found" });
  }

  return res.status(200).json(updatedDrone);
});

export default droneRouter;
