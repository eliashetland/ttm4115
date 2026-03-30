import type { IDrone } from "../models/droneModel.js";
import type { IOrder } from "../models/orderModel.js";


export const drones: IDrone[] = [
    {
        droneId: 1,
        name: "Drone 1",
        model: "Model A",
        manufacturer: "Manufacturer X",
        position: {
            latitude: 37.7749,
            longitude: -122.4194,
            altitude: 100,
            timestamp: new Date().toISOString(),
        }
    },
    {
        droneId: 2,
        name: "Drone 2",
        model: "Model B",
        manufacturer: "Manufacturer Y",
        position: {
            latitude: 34.0522,
            longitude: -118.2437,
            altitude: 150,
            timestamp: new Date().toISOString(),
        }
    },
    {
        droneId: 3,
        name: "Drone 3",
        model: "Model C",
        manufacturer: "Manufacturer Z",
        position: {
            latitude: 40.7128,
            longitude: -74.0060,
            altitude: 200,
            timestamp: new Date().toISOString(),
        }
    }
]


export const orders: IOrder[] = [
    {
        id: 1,
        sender: "Kitchn As",
        firstName: "John",
        lastName: "Doe",
        address: "123 Main St",
        zip: "12345",
        city: "Anytown",
        length: 10,
        width: 5,
        height: 2,
        weight: 1.5,
        history: [
            {
                createdAt: new Date(),
                status: "Created",
                message: "Order has been created and is being processed",
                location: "Warehouse"
            }
        ]
    }
];