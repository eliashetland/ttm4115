
import express from 'express';
import exampleRouter from './src/routers/exampleRouter.js';
import exampleMiddleware from './src/middlewares/exampleMiddleware.js';
import cors from 'cors';

const app = express()
app.use(cors({
    origin: ['http://localhost:5173'],
    credentials: true,
}))
app.use(express.json());

app.get('/', (req, res) => {
    res.send('hello world')
})


app.get('/health', (req, res) => {
    res.send('ok')
})

app.use(exampleMiddleware);


app.use('/api/example', exampleRouter);

app.listen(3000);