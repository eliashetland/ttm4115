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


interface IOrderHistory {
    createdAt: Date;
    status: string;
    location: string;
    message: string;
}

export interface IOrderInsert extends Omit<IOrder, "id" | "history"> { }