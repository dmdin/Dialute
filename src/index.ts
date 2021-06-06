import express from 'express'

const app = express();
const port: string = 5000;
app.get('/', (request, response) => {
  response.send('Hello world!');
});

app.listen(port, () => console.log(`Start server on http://localhost:${port}/`));