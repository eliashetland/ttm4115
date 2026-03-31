import { Router } from "express";
import { createOrder, getAllOrders, getOrderById } from "../controllers/orderController.js";

const orderRouter = Router();

orderRouter.post("/", (req, res) => {
    const newOrderData = req.body;

    try {
        const createdOrder = createOrder(newOrderData);
        return res.status(201).json({ message: "Order created successfully", order: createdOrder });

    } catch (error) {
        if (!(error instanceof Error)) {
            return res.status(400).json({ message: "Invalid order data" });
        }
        return res.status(400).json({ message: error.message });
    }

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

export default orderRouter;
