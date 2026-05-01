import { Router } from "express";
import { createOrder, getAllOrders, getOrderById, updateOrderStatus } from "../controllers/orderController.js";
import { calculateDeliveryTime } from "../services/deliveryTimeService.js";

const orderRouter = Router();

orderRouter.post("/", (req, res) => {
    const newOrderData = req.body;

    try {
        const result = createOrder(newOrderData);
        const message =
            result.deliveryMethod === "drone"
                ? "Order created successfully"
                : result.notice ?? "Order created — out of drone range, will be delivered by car";
        return res.status(201).json({
            message,
            order: result.order,
            deliveryMethod: result.deliveryMethod,
            notice: result.notice,
        });

    } catch (error) {
        if (!(error instanceof Error)) {
            return res.status(400).json({ message: "Invalid order data" });
        }
        return res.status(400).json({ message: error.message });
    }

});

orderRouter.post("/estimate-time", (req, res) => {
    const { latitude, longitude } = req.body;
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
        return res.status(400).json({ message: "Invalid coordinates" });
    }
    const time = calculateDeliveryTime(latitude, longitude); // Time in minutes
    return res.status(200).json({ deliveryTime: time });
});

orderRouter.get("/", (req, res) => {
    const orders = getAllOrders();
    return res.status(200).json(orders);
});

orderRouter.get("/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const order = getOrderById(id);
    if (!order) {
        return res.status(404).json({ message: "Order not found" });
    }
    return res.status(200).json(order);
});


orderRouter.put("/:id/status", (req, res) => {
    const id = parseInt(req.params.id);
    const { status, location, message } = req.body;

    try {
        const updatedOrder = updateOrderStatus(id, status, location, message);
        return res.status(200).json({ message: "Order status updated successfully", order: updatedOrder });
    } catch (error) {
        if (!(error instanceof Error)) {
            return res.status(400).json({ message: "Invalid order data" });
        }
        return res.status(400).json({ message: error.message });
    }
});

export default orderRouter;
