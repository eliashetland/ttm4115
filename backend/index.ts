
import express from 'express';
import exampleRouter from './src/routers/exampleRouter.js';
import exampleMiddleware from './src/middlewares/exampleMiddleware.js';

const app = express()

app.get('/', (req, res) => {
    res.send('hello world')
})


app.get('/health', (req, res) => {
    res.send('ok')
})

app.use(express.json());
app.use(exampleMiddleware);


app.use('/api/example', exampleRouter);

app.listen(3000);