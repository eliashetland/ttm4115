import { droneRouter } from "./droneRouter.js";
import { heartbeatRouter } from "./heartbeatRouter.js";

export default function mqttRouter(){
    droneRouter();
    heartbeatRouter();
}