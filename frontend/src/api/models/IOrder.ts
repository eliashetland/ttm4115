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

    target: IOrderLocation;
    history: IOrderHistory[];
    deliveryTime: number; // in minutes
    deliveryMethod: DeliveryMethod;
    deliveryNotice?: string;
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



export interface IOrderInsert
    extends Omit<IOrder, "id" | "history" | "deliveryTime" | "deliveryMethod" | "deliveryNotice"> { }

export interface ICreateOrderResponse {
    message: string;
    order: IOrder;
    deliveryMethod: DeliveryMethod;
    notice?: string;
}

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
        target: {
            latitude: 0,
            longitude: 0,
            description: ""
        }
    };
}
