import type { IDrone } from "../models/droneModel.js";
import type { IOrder, IOrderHistory } from "../models/orderModel.js";


export const drones: IDrone[] = [
    {
        droneId: 1,
        name: "Drone 1",
        model: "Model A",
        manufacturer: "Manufacturer X",
        orderId: 1,
        batteryLevel: 100,
        position: {
            latitude: 63.415808,
            longitude: 10.416744,
            altitude: 100,
            timestamp: new Date().toISOString(),
        },
        maxCapacity: {
            length: 100,
            width: 100,
            height: 100,
            weight: 10
        },
        status: "idle"

    },
    {
        droneId: 2,
        name: "Drone 2",
        model: "Model B",
        manufacturer: "Manufacturer Y",
        batteryLevel: 40,
        position: {
            latitude: 63.416808,
            longitude: 10.396744,
            altitude: 150,
            timestamp: new Date().toISOString(),
        },
        maxCapacity: { //cm
            length: 50,
            width: 50,
            height: 300,
            weight: 15
        }
        ,
        status: "in-flight"
    },
    {
        droneId: 3,
        name: "Drone 3",
        model: "Model C",
        manufacturer: "Manufacturer Z",
        batteryLevel: 20,
        position: {
            latitude: 63.425808,
            longitude: 10.448744,
            altitude: 200,
            timestamp: new Date().toISOString(),
        },
        maxCapacity: { //cm
            length: 200,
            width: 200,
            height: 200,
            weight: 25
        },
        status: "charging"
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
        target: {
            latitude: 63.394284,
            longitude: 10.419027,
            description: "Recipient's address"
        },
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
