/* tslint:disable:max-classes-per-file */

import chalk from 'chalk';
import { SberRequest, SberResponse } from './api';

const Second = 1000;
const Minute = Second * 60;

export function DateLog(msg: string) {
  console.log(`${chalk.cyanBright(new Date().toUTCString())} - ${msg}`)
  // console.log(`${chalk.cyanBright(new Date().toUTCString())} - ${msg}`)
}

export class DialogManger {
  start: any;
  sessions: any;

  // TODO: check if this works correctly
  deleteSessionAfter: number = Minute * 4;
  deleteEachTime: number = Minute * 2;

  constructor(start: any) {
    this.start = start;
    this.sessions = {};
    // Important: setInterval changes context without wrapper function
    setInterval(() => this.deleteSessions(), this.deleteEachTime);
  }

  process(request: any): SberResponse {
    request = new SberRequest(request);
    if (!this.sessions.hasOwnProperty(request.userId)) {
      this.sessions[request.userId] = new Session(this.start, request);
    }
    const session = this.sessions[request.userId];
    session.request.clone(request);

    let rsp;
    const fromScript = session.step();

    // while ['[object Generator]', '[object GeneratorFunction]'].includes(Object.toString.call(fromScript)) {
    //
    // }

    if (typeof fromScript === 'string') {
      rsp = request.buildRsp();
      rsp.msg = fromScript;
    } else if (fromScript instanceof SberResponse) {
      rsp = fromScript;
      // } else if (Object.toString.call(fromScript) === '[object Generator]'){
      //   session.script =
      //
      // } else if (Object.toString.call(fromScript) === '[object GeneratorFunction]') {
    } else {
      DateLog(chalk.redBright('You have passed unsupported type from script generator'));
    }

    if (rsp.end) {
      delete this.sessions[request.userId];
    }
    return rsp.body;
  }

  deleteSessions() {
    const len = Object.keys(this.sessions).length;
    DateLog(chalk.magentaBright(`Total sessions: ${len}`));
    DateLog(chalk.magentaBright('Deleting unused sessions'));
    let counter = 0;

    for (const [key, value] of Object.entries(this.sessions)) {
      const s = (value as Session).lastActive;
      if (Date.now() - s > this.deleteSessionAfter) {
        delete this.sessions[key];
        counter++;
      }
    }
    DateLog(chalk.magentaBright(`Deleted ${counter} sessions`));
  }
}

export class Session {
  start: any;
  script: Generator<SberRequest, string | SberResponse | Function>;
  // scriptStorage: {string: Function | Generator}
  request: SberRequest;
  lastActive: number;

  constructor(start: any, request: SberRequest) {
    this.start = start;
    this.request = request;
    this.script = start(request);
    // this.scriptStorage = {'/': start};
    this.lastActive = Date.now();
  }

  step(): any {
    this.lastActive = Date.now();
    const { value, done } = this.script.next();
    if (done) {
      DateLog(chalk.bgYellow('Script ended. Reloading'));
      this.script = this.start(this.request);
      return this.step();
    }
    return value;
  }
}
