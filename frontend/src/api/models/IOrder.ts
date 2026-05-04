export interface IOrder {
    id: number;
    sender: string;
    firstName: string;
    lastName: string;
    address: string;
    zip: string;
    city: string;
    length: number;
    width: number;
    height: number;
    weight: number;
    status: "Created" | "In Transit" | "Delivered";
    target: IOrderLocation;
    history: IOrderHistory[];
    deliveryTime: number;
}

export interface IOrderHistory {
    createdAt: string;
    status: string;
    message: string;
    type: "status" | "drone";
    location: IOrderLocation;
}

export interface IOrderLocation {
    latitude: number;
    longitude: number;
    description: string;
}

export interface IOrderInsert extends Omit<IOrder, "id" | "status" | "history" | "deliveryTime"> { }

export function createEmptyOrder(): IOrderInsert {
    return {
        sender: "",
        firstName: "",
        lastName: "",
        address: "",
        zip: "",
        city: "",
        length: 0,
        width: 0,
        height: 0,
        weight: 0,
        target: { latitude: 0, longitude: 0, description: "" }
    };
}
