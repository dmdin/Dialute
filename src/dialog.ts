/* tslint:disable:max-classes-per-file */

import chalk from 'chalk';
import { SberRequest, SberResponse } from './api';

const Second = 1000;
const Minute = Second * 60;

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
    if (typeof fromScript === 'string') {
      rsp = request.buildRsp();
      rsp.msg = fromScript;
    } else {
      rsp = fromScript;
    }
    return rsp.body;
  }

  deleteSessions() {
    const len = Object.keys(this.sessions).length;
    console.info(chalk.magentaBright(`Total sessions: ${len}`));
    console.info(chalk.magentaBright('Deleting unused sessions'));
    let counter = 0;

    // @ts-ignore
    for (const [key, value]: any of Object.entries(this.sessions)) {
      // @ts-ignore
      const s = value.lastActive;
      if (Date.now() - s > this.deleteSessionAfter) {
        delete this.sessions[key];
        counter++;
      }
    }
    console.info(chalk.magentaBright(`Deleted ${counter} sessions`));
  }
}

export class Session {
  start: any;
  script: Generator<SberRequest, string | SberResponse>;
  request: SberRequest;
  lastActive: number;

  constructor(start: any, request: SberRequest) {
    this.start = start;
    this.request = request;
    this.script = start(request);
    this.lastActive = Date.now();
  }

  step(): any {
    this.lastActive = Date.now();
    const { value, done } = this.script.next();
    if (done) {
      console.warn('Script ended. Reloading');
      this.script = this.start(this.request);
      return this.step();
    }
    return value;
  }
}
