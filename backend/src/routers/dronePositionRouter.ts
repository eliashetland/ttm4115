import { Router } from "express";
import { getDronePositionById, updateDronePosition } from "../controllers/dronePositionController.js";
import type { IDronePositionInsert } from "../models/dronePositionModel.js";


const dronePositionRouter = Router();

dronePositionRouter.get("/:droneId", (req, res) => {
    const id = parseInt(req.params.droneId);
    if (!id) {
        return res.status(400).json({ message: "Invalid drone ID" });
    }
    const dronePosition = getDronePositionById(id);
    if (!dronePosition) {
        return res.status(404).json({ message: "Drone position not found" });
    }
    res.json(dronePosition);
});

dronePositionRouter.put("/:droneId", (req, res) => {
    const id = parseInt(req.params.droneId);
    if (!id) {
        return res.status(400).json({ message: "Invalid drone ID" });
    }

    const { latitude, longitude, altitude } = req.body;
    if (typeof latitude !== "number" || typeof longitude !== "number" || typeof altitude !== "number") {
        return res.status(400).json({ message: "Invalid position data" });
    }

    const newPosition: IDronePositionInsert = { latitude, longitude, altitude };

    const updatedPosition = updateDronePosition(id, newPosition);
    if (!updatedPosition) {
        return res.status(404).json({ message: "Drone not found" });
    }

    res.json(updatedPosition);
});

export default dronePositionRouter;