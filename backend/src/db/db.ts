import type { IDrone } from "../models/droneModel.js";
import type { IOrder } from "../models/orderModel.js";
import { WAREHOUSE_COORDS } from "../constants.js";
import { calculateDeliveryTime } from "../services/deliveryTimeService.js";

export const drones: IDrone[] = [
    {
        droneId: 1,
        name: "Drone 1",
        model: "Model A",
        manufacturer: "Manufacturer X",
        batteryLevel: 100,
        position: {
            latitude: WAREHOUSE_COORDS.latitude,
            longitude: WAREHOUSE_COORDS.longitude,
            altitude: WAREHOUSE_COORDS.altitude,
            timestamp: new Date().toISOString(),
        },
<<<<<<< HEAD
        maxCapacity: { length: 100, width: 100, height: 100, weight: 10 },
        status: "idle"
=======
        maxCapacity: {
            length: 100,
            width: 100,
            height: 100,
            weight: 10,
            maxWeight: 10,
            maxVolume: 1000000,
            currentLoad: 0,
            currentOrders: []
        },
        status: "in-flight"

>>>>>>> origin/main
    },
    {
        droneId: 2,
        name: "Drone 2",
        model: "Model B",
        manufacturer: "Manufacturer Y",
        batteryLevel: 100,
        position: {
            latitude: WAREHOUSE_COORDS.latitude,
            longitude: WAREHOUSE_COORDS.longitude,
            altitude: WAREHOUSE_COORDS.altitude,
            timestamp: new Date().toISOString(),
        },
        maxCapacity: { length: 50, width: 50, height: 200, weight: 15 },
        status: "idle"
    },
    {
        droneId: 3,
        name: "Drone 3",
        model: "Model C",
        manufacturer: "Manufacturer Z",
        batteryLevel: 100,
        position: {
            latitude: WAREHOUSE_COORDS.latitude,
            longitude: WAREHOUSE_COORDS.longitude,
            altitude: WAREHOUSE_COORDS.altitude,
            timestamp: new Date().toISOString(),
        },
        maxCapacity: { length: 200, width: 200, height: 200, weight: 25 },
        status: "idle"
    }
];

export const orders: IOrder[] = [
    {
        id: 1,
<<<<<<< HEAD
        sender: "Coop Extra",
        firstName: "Emma",
        lastName: "Haugen",
        address: "Munkegata 26",
        zip: "7011",
        city: "Trondheim",
        length: 20, width: 15, height: 10, weight: 2.0,
        status: "Created",
        deliveryTime: calculateDeliveryTime(63.4303, 10.3948),
        target: { latitude: 63.4303, longitude: 10.3948, description: "Munkegata 26, Trondheim" },
        history: [{
            createdAt: new Date(), status: "Created", type: "status",
            location: { latitude: WAREHOUSE_COORDS.latitude, longitude: WAREHOUSE_COORDS.longitude, description: "Warehouse" },
            message: "Order created and queued for delivery"
        }]
    },
    {
        id: 2,
        sender: "Rema 1000",
        firstName: "Lars",
        lastName: "Bakken",
        address: "Prinsens gate 38",
        zip: "7012",
        city: "Trondheim",
        length: 30, width: 20, height: 15, weight: 3.5,
        status: "Created",
        deliveryTime: calculateDeliveryTime(63.4296, 10.3928),
        target: { latitude: 63.4296, longitude: 10.3928, description: "Prinsens gate 38, Trondheim" },
        history: [{
            createdAt: new Date(), status: "Created", type: "status",
            location: { latitude: WAREHOUSE_COORDS.latitude, longitude: WAREHOUSE_COORDS.longitude, description: "Warehouse" },
            message: "Order created and queued for delivery"
        }]
    },
    {
        id: 3,
        sender: "Apotek 1",
        firstName: "Sofie",
        lastName: "Dahl",
        address: "Ladeveien 30",
        zip: "7027",
        city: "Trondheim",
        length: 15, width: 10, height: 8, weight: 1.2,
        status: "Created",
        deliveryTime: calculateDeliveryTime(63.4512, 10.4530),
        target: { latitude: 63.4512, longitude: 10.4530, description: "Ladeveien 30, Trondheim" },
        history: [{
            createdAt: new Date(), status: "Created", type: "status",
            location: { latitude: WAREHOUSE_COORDS.latitude, longitude: WAREHOUSE_COORDS.longitude, description: "Warehouse" },
            message: "Order created and queued for delivery"
        }]
    },
    {
        id: 4,
        sender: "POWER",
        firstName: "Ola",
        lastName: "Strand",
        address: "Elgeseter gate 14",
        zip: "7030",
        city: "Trondheim",
        length: 40, width: 30, height: 20, weight: 5.0,
        status: "Created",
        deliveryTime: calculateDeliveryTime(63.4224, 10.3954),
        target: { latitude: 63.4224, longitude: 10.3954, description: "Elgeseter gate 14, Trondheim" },
        history: [{
            createdAt: new Date(), status: "Created", type: "status",
            location: { latitude: WAREHOUSE_COORDS.latitude, longitude: WAREHOUSE_COORDS.longitude, description: "Warehouse" },
            message: "Order created and queued for delivery"
        }]
    },
    {
        id: 5,
        sender: "Vinmonopolet",
        firstName: "Mia",
        lastName: "Thorsen",
        address: "Innherredsveien 120",
        zip: "7067",
        city: "Trondheim",
        length: 25, width: 20, height: 30, weight: 4.0,
        status: "Created",
        deliveryTime: calculateDeliveryTime(63.4430, 10.4270),
        target: { latitude: 63.4430, longitude: 10.4270, description: "Innherredsveien 120, Trondheim" },
        history: [{
            createdAt: new Date(), status: "Created", type: "status",
            location: { latitude: WAREHOUSE_COORDS.latitude, longitude: WAREHOUSE_COORDS.longitude, description: "Warehouse" },
            message: "Order created and queued for delivery"
        }]
    },
    {
        id: 6,
        sender: "Jernia",
        firstName: "Erik",
        lastName: "Nygård",
        address: "Brøsetvegen 186",
        zip: "7048",
        city: "Trondheim",
        length: 50, width: 40, height: 35, weight: 8.0,
        status: "Created",
        deliveryTime: calculateDeliveryTime(63.4086, 10.3637),
        target: { latitude: 63.4086, longitude: 10.3637, description: "Brøsetvegen 186, Trondheim" },
        history: [{
            createdAt: new Date(), status: "Created", type: "status",
            location: { latitude: WAREHOUSE_COORDS.latitude, longitude: WAREHOUSE_COORDS.longitude, description: "Warehouse" },
            message: "Order created and queued for delivery"
        }]
=======
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

        status: "In Transit",
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
>>>>>>> origin/main
    }
];
