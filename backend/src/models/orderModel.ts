export type DeliveryMethod = "drone" | "car";

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
    deliveryMethod: DeliveryMethod;
    deliveryNotice?: string | undefined; // human-readable explanation, e.g. why a car was chosen
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

export interface IOrderInsert
    extends Omit<IOrder, "id" | "history" | "deliveryTime" | "deliveryMethod" | "deliveryNotice"> { }