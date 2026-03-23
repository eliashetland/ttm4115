
import express from 'express';

const app = express()

app.get('/', (req, res) => {
  res.send('hello world')
})


app.get('/health', (req, res) => {
  res.send('ok')
})

app.listen(3000)