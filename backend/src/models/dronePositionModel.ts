
export interface IDronePosition {
    latitude: number;
    longitude: number;
    timestamp: string;
}

export interface IDronePositionInsert extends Omit<IDronePosition, "timestamp"> { }