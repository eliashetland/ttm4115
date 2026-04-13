import type { IDrone } from "../models/droneModel.js";
import type { IOrder, IOrderHistory } from "../models/orderModel.js";


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

function makePath(start: { latitude: number; longitude: number }, end: { latitude: number; longitude: number }, points = 10) {
    const path = [];

    for (let i = 1; i <= points; i++) {
        const t = i / (points + 1);

        path.push({
            latitude: start.latitude + (end.latitude - start.latitude) * t,
            longitude: start.longitude + (end.longitude - start.longitude) * t,
        });
    }

    return path;
}

const start = { latitude: 63.415808, longitude: 10.406744 };
const end = { latitude: 63.394284, longitude: 10.419027 };

const points = makePath(start, end, 10);
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
                location: {
                    latitude: 63.415808,
                    longitude: 10.406744,
                    description: "Warehouse"
                },
                type: "status"
            }
            ,
            {
                createdAt: new Date(new Date().getTime() + 1000 * 60 * 60), // 1 hour later
                status: "In Transit",
                message: "Order is in transit to the destination",
                location: {
                    latitude: 63.415808,
                    longitude: 10.406744,
                    description: "On the way"
                },
                type: "status"
            },

            ...points.map((point, index) => ({
                createdAt: new Date(new Date().getTime() + 1000 * 60 * 60 * (index + 1)), // Each point is 1 hour apart
                type: "drone",

                message: "traveling",
                location: {
                    latitude: point.latitude,
                    longitude: point.longitude,
                    description: `Midway point ${index + 1}`
                },
                status: "In Transit"
            } as IOrderHistory)),



            {
                createdAt: new Date(new Date().getTime() + 1000 * 60 * 60 * 2), // 2 hours later
                status: "Delivered",
                message: "Order has been delivered to the recipient",
                location: {
                    latitude: 63.394284,
                    longitude: 10.419027,
                    description: "Recipient's address"
                },
                type: "status"
            }


        ]
    }
];