/* tslint:disable:max-classes-per-file */

import chalk from 'chalk';
import { SberRequest, SberResponse } from './api';
import { start } from "repl";

const Second = 1000;
const Minute = Second * 60;

export type ScriptStep = string | SberResponse | Generator | GeneratorFunction

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

  constructor(start: GeneratorFunction) {
    this.start = start;
    this.sessions = {};
    // Important: setInterval changes context without wrapper function
    setInterval(() => this.deleteSessions(), this.deleteEachTime);
  }

  process(request: any): SberResponse {
    if (!(request instanceof SberRequest)) {
      request = new SberRequest(request);
    }

    if (!this.sessions.hasOwnProperty(request.userId)) {
      this.sessions[request.userId] = new Session(this.start, request);
    }
    const session = this.sessions[request.userId];
    console.log(session.request)
    session.request.clone(request);

    let rsp: SberResponse;
    const scriptStep = session.step();

    if (typeof scriptStep === 'string') {
      rsp = request.buildRsp();
      rsp.msg = scriptStep;

    } else if (scriptStep instanceof SberResponse) {
      rsp = scriptStep;

    } else if ({}.toString.call(scriptStep) === '[object Generator]') {
      session.script = scriptStep;
      rsp = this.process(request);
    } else if ({}.toString.call(scriptStep) === '[object GeneratorFunction]') {
      session.script = scriptStep(session.request);
      rsp = this.process(request);
    } else {
      DateLog(chalk.redBright('You have passed unsupported type from script generator'));
    }

    if (rsp.end) {
      delete this.sessions[request.userId];
    }
    console.log(rsp.body)
    return rsp;
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
  request: SberRequest;  // The link for updating object
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
