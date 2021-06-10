import chalk from 'chalk';
import express from 'express';
import {DialogManger} from 'dialute';

function* script(r) {
  while (true) {
    yield 'Hello world from Dialute!';
  }
}

const dm = new DialogManger(script);
const app = express();
const port = 8000;

app.use((req, res, next) => {
  console.info(`${chalk.cyanBright(new Date().toUTCString())} - ${chalk.green(req.method)}:`, chalk.cyan(req.path));
  next();
});
app.use(express.json());
app.post('/app-connector/', (request, response) => {
  const body = dm.process(request.body);
  response.send(body);
});

app.listen(port, () => console.log(chalk.blue(`Start server on http://localhost:${port}/`)));
