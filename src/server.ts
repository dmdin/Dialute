import express = require('express');
import { DateLog, DialogManger } from './dialog';
import chalk from 'chalk';

export class Dialute {
  dm: DialogManger;
  app: express.Express;
  port: string;

  constructor({
    entrypoint,
    dm,
    port = '8000',
  }: {
    entrypoint: GeneratorFunction;
    dm: DialogManger;
    port: string;
  }) {
    this.dm = new DialogManger(entrypoint);
    this.app = express();
    this.port = port;

    this.app.use((req, res, next) => {
      DateLog(`${chalk.green(req.method)}: ${chalk.cyan(req.path)}`);
      next();
    });
    this.app.use(express.json());
    this.app.post('/app-connector/', (request, response) => {
      const body = this.dm.process(request.body).body;
      response.send(body);
    });
  }

  start() {
    this.app.listen(this.port, () => DateLog(chalk.blue(`Start server on http://localhost:${this.port}/`)));
  }
}
