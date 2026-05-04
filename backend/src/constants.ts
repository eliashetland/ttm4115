import { calculateDeliveryTime } from "./services/deliveryTimeService.js";

export const WAREHOUSE_COORDS = {
    latitude: 63.415777440500655,
    longitude: 10.406715511683895,
    altitude: 100,
};

export const DRONE_SPEED_KMH = 50;


export const MOCK_ORDERS = [{
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
},
{
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
},
{
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
},
{
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
},
{
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
},
{
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
}
];