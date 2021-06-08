import chalk from 'chalk';
import express from 'express';
import { DialogManger } from './dialog';
import { SberRequest } from './api';

function* script(r: SberRequest) {
  while (true) {
    const rsp = r.buildRsp();
    console.log(r.type);
    rsp.msg = 'Привет!';
    rsp.msgJ = 'Привет!';
    yield rsp;
  }
}

const dm = new DialogManger(script);
const app = express();
const port: number = 8000;

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
