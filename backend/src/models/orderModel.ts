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
    target: IOrderLocation;
    deliveryTime: number; // in minutes
}


export interface IOrderHistory {
    createdAt: Date;
    status: string;
    type: "status" | "drone";
    location: IOrderLocation;
    message: string;
}

export interface IOrderLocation {
    latitude: number;
    longitude: number;
    description: string;
}

export interface IOrderInsert extends Omit<IOrder, "id" | "history" | "deliveryTime"> { }