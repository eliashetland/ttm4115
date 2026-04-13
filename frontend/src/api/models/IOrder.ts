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
    history: IOrderHistory[];
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



export interface IOrderInsert extends Omit<IOrder, "id" | "history"> { }

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
    };
}