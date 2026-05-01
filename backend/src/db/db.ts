import type { IDrone } from "../models/droneModel.js";
import type { IOrder } from "../models/orderModel.js";

const WAREHOUSE = { latitude: 63.415777440500655, longitude: 10.406715511683895, altitude: 100 };
const DRONE_SPEED_KMH = 50;

function calcDeliveryMinutes(targetLat: number, targetLon: number): number {
    const R = 6371;
    const toRad = (d: number) => d * Math.PI / 180;
    const dLat = toRad(targetLat - WAREHOUSE.latitude);
    const dLon = toRad(targetLon - WAREHOUSE.longitude);
    const a = Math.sin(dLat / 2) ** 2
        + Math.cos(toRad(WAREHOUSE.latitude)) * Math.cos(toRad(targetLat)) * Math.sin(dLon / 2) ** 2;
    const distKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.ceil((distKm / DRONE_SPEED_KMH) * 60);
}

export const drones: IDrone[] = [
    {
        droneId: 1,
        name: "Drone 1",
        model: "Model A",
        manufacturer: "Manufacturer X",
        batteryLevel: 100,
        position: {
            latitude: WAREHOUSE.latitude,
            longitude: WAREHOUSE.longitude,
            altitude: WAREHOUSE.altitude,
            timestamp: new Date().toISOString(),
        },
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
        status: "idle"
    },
    {
        droneId: 2,
        name: "Drone 2",
        model: "Model B",
        manufacturer: "Manufacturer Y",
        batteryLevel: 100,
        position: {
            latitude: WAREHOUSE.latitude,
            longitude: WAREHOUSE.longitude,
            altitude: WAREHOUSE.altitude,
            timestamp: new Date().toISOString(),
        },
        maxCapacity: {
            length: 50,
            width: 50,
            height: 300,
            weight: 15,
            maxWeight: 15,
            maxVolume: 750000,
            currentLoad: 0,
            currentOrders: []
        },
        status: "idle"
    },
    {
        droneId: 3,
        name: "Drone 3",
        model: "Model C",
        manufacturer: "Manufacturer Z",
        batteryLevel: 100,
        position: {
            latitude: WAREHOUSE.latitude,
            longitude: WAREHOUSE.longitude,
            altitude: WAREHOUSE.altitude,
            timestamp: new Date().toISOString(),
        },
        maxCapacity: {
            length: 200,
            width: 200,
            height: 200,
            weight: 25,
            maxWeight: 25,
            maxVolume: 8000000,
            currentLoad: 0,
            currentOrders: []
        },
        status: "idle"
    }
];

export const orders: IOrder[] = [
    {
        id: 1,
        sender: "Coop Extra",
        firstName: "Emma",
        lastName: "Haugen",
        address: "Munkegata 26",
        zip: "7011",
        city: "Trondheim",
        length: 20,
        width: 15,
        height: 10,
        weight: 2.0,
        deliveryTime: calcDeliveryMinutes(63.4303, 10.3948),
        target: {
            latitude: 63.4303,
            longitude: 10.3948,
            description: "Munkegata 26, Trondheim"
        },
        history: [
            {
                createdAt: new Date(),
                status: "Created",
                message: "Order created and queued for delivery",
                location: {
                    latitude: WAREHOUSE.latitude,
                    longitude: WAREHOUSE.longitude,
                    description: "Warehouse"
                },
                type: "status"
            }
        ]
    },
    {
        id: 2,
        sender: "Rema 1000",
        firstName: "Lars",
        lastName: "Bakken",
        address: "Prinsens gate 38",
        zip: "7012",
        city: "Trondheim",
        length: 30,
        width: 20,
        height: 15,
        weight: 3.5,
        deliveryTime: calcDeliveryMinutes(63.4296, 10.3928),
        target: {
            latitude: 63.4296,
            longitude: 10.3928,
            description: "Prinsens gate 38, Trondheim"
        },
        history: [
            {
                createdAt: new Date(),
                status: "Created",
                message: "Order created and queued for delivery",
                location: {
                    latitude: WAREHOUSE.latitude,
                    longitude: WAREHOUSE.longitude,
                    description: "Warehouse"
                },
                type: "status"
            }
        ]
    },
    {
        id: 3,
        sender: "Apotek 1",
        firstName: "Sofie",
        lastName: "Dahl",
        address: "Ladeveien 30",
        zip: "7027",
        city: "Trondheim",
        length: 15,
        width: 10,
        height: 8,
        weight: 1.2,
        deliveryTime: calcDeliveryMinutes(63.4512, 10.4530),
        target: {
            latitude: 63.4512,
            longitude: 10.4530,
            description: "Ladeveien 30, Trondheim"
        },
        history: [
            {
                createdAt: new Date(),
                status: "Created",
                message: "Order created and queued for delivery",
                location: {
                    latitude: WAREHOUSE.latitude,
                    longitude: WAREHOUSE.longitude,
                    description: "Warehouse"
                },
                type: "status"
            }
        ]
    },
    {
        id: 4,
        sender: "POWER",
        firstName: "Ola",
        lastName: "Strand",
        address: "Elgeseter gate 14",
        zip: "7030",
        city: "Trondheim",
        length: 40,
        width: 30,
        height: 20,
        weight: 5.0,
        deliveryTime: calcDeliveryMinutes(63.4224, 10.3954),
        target: {
            latitude: 63.4224,
            longitude: 10.3954,
            description: "Elgeseter gate 14, Trondheim"
        },
        history: [
            {
                createdAt: new Date(),
                status: "Created",
                message: "Order created and queued for delivery",
                location: {
                    latitude: WAREHOUSE.latitude,
                    longitude: WAREHOUSE.longitude,
                    description: "Warehouse"
                },
                type: "status"
            }
        ]
    },
    {
        id: 5,
        sender: "Vinmonopolet",
        firstName: "Mia",
        lastName: "Thorsen",
        address: "Innherredsveien 120",
        zip: "7067",
        city: "Trondheim",
        length: 25,
        width: 20,
        height: 30,
        weight: 4.0,
        deliveryTime: calcDeliveryMinutes(63.4430, 10.4270),
        target: {
            latitude: 63.4430,
            longitude: 10.4270,
            description: "Innherredsveien 120, Trondheim"
        },
        history: [
            {
                createdAt: new Date(),
                status: "Created",
                message: "Order created and queued for delivery",
                location: {
                    latitude: WAREHOUSE.latitude,
                    longitude: WAREHOUSE.longitude,
                    description: "Warehouse"
                },
                type: "status"
            }
        ]
    },
    {
        id: 6,
        sender: "Jernia",
        firstName: "Erik",
        lastName: "Nygård",
        address: "Brøsetvegen 186",
        zip: "7048",
        city: "Trondheim",
        length: 50,
        width: 40,
        height: 35,
        weight: 8.0,
        deliveryTime: calcDeliveryMinutes(63.4086, 10.3637),
        target: {
            latitude: 63.4086,
            longitude: 10.3637,
            description: "Brøsetvegen 186, Trondheim"
        },
        history: [
            {
                createdAt: new Date(),
                status: "Created",
                message: "Order created and queued for delivery",
                location: {
                    latitude: WAREHOUSE.latitude,
                    longitude: WAREHOUSE.longitude,
                    description: "Warehouse"
                },
                type: "status"
            }
        ]
    }
];
