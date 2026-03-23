
import express from 'express';
import exampleRouter from './src/routers/exampleRouter.js';
import exampleMiddleware from './src/middlewares/exampleMiddleware.js';
import cors from 'cors';
import dronePositionRouter from './src/routers/dronePositionRouter.js';

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
app.use('/api/drone-position', dronePositionRouter);

app.listen(3000);