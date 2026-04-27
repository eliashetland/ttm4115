
import express from 'express';
import exampleRouter from './src/routers/exampleRouter.js';
import exampleMiddleware from './src/middlewares/exampleMiddleware.js';
import cors from 'cors';
import dronePositionRouter from './src/routers/dronePositionRouter.js';
import droneRouter from './src/routers/droneRouter.js';
import orderRouter from './src/routers/orderRouter.js';
import mqtt from 'mqtt';
import { updateDroneFromHeartbeat } from './src/controllers/heartbeatController.js';


// MQTT setup

const client = mqtt.connect('mqtt://mqtt20.iik.ntnu.no:1883');

const HEARTBEAT_TOPIC = '09/heartbeat';

client.on('connect', () => {
    client.subscribe(HEARTBEAT_TOPIC);
});

client.on('message', (topic, message) => {
    switch (topic) {
        case HEARTBEAT_TOPIC:

            const data = JSON.parse(message.toString());
            const {
                id,
                battery_level,
                gps,
                timestamp,
                state
            } = data;


            const res = updateDroneFromHeartbeat(id, battery_level, {
                latitude: gps.latitude,
                longitude: gps.longitude,
                altitude: 100,
                timestamp: timestamp
            });

            console.log(res);

            break;
    }
});



//express setup
const app = express()
app.use(cors({
    origin: ['http://localhost:5173'],
    credentials: true,
}))
app.use(express.json());

app.get('/health', (req, res) => {
    res.send('ok')
})

app.use(exampleMiddleware);



app.use('/api/example', exampleRouter);
app.use('/api/drone', droneRouter);
app.use('/api/drone-position', dronePositionRouter);
app.use('/api/order', orderRouter);

app.listen(3000);



