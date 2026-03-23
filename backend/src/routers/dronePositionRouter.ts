import { Router } from "express";
import { getDronePositionById } from "../controllers/dronePositionController.js";


const dronePositionRouter = Router();

dronePositionRouter.get("/:id", (req, res) => {
    const id = parseInt(req.params.id);
    if (!id) {
        return res.status(400).json({ message: "Invalid drone ID" });
    }
    const dronePosition = getDronePositionById(id);
    if (!dronePosition) {
        return res.status(404).json({ message: "Drone position not found" });
    }
    res.json(dronePosition);
});


export default dronePositionRouter;