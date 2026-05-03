import { drones, orders } from "../db/db.js"
import type { IDrone, IDroneInsert } from "../models/droneModel.js";
import { timeFromWarehouse, timeBetweenPoints } from "../services/deliveryTimeService.js";


export const getDrone = () => {
    return drones.map((drone) => {

        let timeLeft = undefined;

        console.log(drone.status);


        const order = orders.find(order => order.id === drone.orderId);

        if (order && order?.status === "In Transit") {
            timeLeft = timeBetweenPoints(
                drone.position.latitude,
                drone.position.longitude,
                order.target.latitude,
                order.target.longitude
            ) + timeFromWarehouse(
                order.target.latitude,
                order.target.longitude
            );
        } else {
            timeLeft = timeFromWarehouse(
                drone.position.latitude,
                drone.position.longitude
            );
        }


        return {
            ...drone,
            timeLeft: Math.ceil(timeLeft),
        }
    }).sort((a, b) => a.batteryLevel - b.batteryLevel);
};

export const getDroneById = (droneId: number) => {
    const drone = drones.find(drone => drone.droneId === droneId);
    return drone;
};

// droneData can contain droneId if the type IDrone is used. This overwrites the newly given droneId
// Fix implemented at the moment is setting the droneId after the droneData sets the Id
export const createDrone = (droneData: IDroneInsert) => {
    const newDrone: IDrone = {
        droneId: drones.length + 1,
        batteryLevel: droneData.batteryLevel ?? 100,
        status: droneData.status ?? "idle",
        ...droneData
    }
    newDrone.droneId = drones.length + 1;
    drones.push(newDrone);
    return newDrone;
};

export const updateDroneBatteryLevel = (droneId: number, batteryLevel: number) => {
    const drone = drones.find(drone => drone.droneId === droneId);
    if (!drone) {
        return null;
    }

    drone.batteryLevel = batteryLevel;
    return drone;
};
