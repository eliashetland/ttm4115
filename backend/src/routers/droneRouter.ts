import { Router } from "express";
import { createDrone, getDrone, getDroneById } from "../controllers/droneController.js";

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


export default droneRouter;