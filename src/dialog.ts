/* tslint:disable:max-classes-per-file */
import chalk from 'chalk';
import type { Db } from './db/types';
import { SberRequest, SberResponse } from './api';

const Second = 1000;
const Minute = Second * 60;

export type ScriptStep = string | SberResponse | Generator | GeneratorFunction;

export function dateLog(msg: string) {
  console.log(`${chalk.cyanBright(new Date().toUTCString())} - ${msg}`);
}

type Callback = (s: Session) => Promise<any>;

export enum Event {
  CreateSession = 'CREATE_SESSION',
  DeleteSession = 'DELETE_SESSION',
}

interface Hooks {
  [event: string]: string;
}

export class DialogManager {
  start: any;
  sessions: any;
  hooks: { [event in Event]: Callback[] };
  deleteSessionAfter: number;
  deleteEachTime: number;
  static ctxDb: Db;

  constructor(
    start: GeneratorFunction,
    optional = {
      deleteSessionAfter: Minute * 4,
      deleteEachTime: Minute * 2,
    }
  ) {
    this.start = start;
    this.sessions = {};
    this.deleteEachTime = optional.deleteEachTime;
    this.deleteSessionAfter = optional.deleteSessionAfter;
    this.hooks = {
      CREATE_SESSION: [],
      DELETE_SESSION: [],
    };

    // Important: setInterval changes context without wrapper function
    setInterval(() => this.deleteSessions(), this.deleteEachTime);
  }

  setCtxDb(db: Db) {
    DialogManager.ctxDb = db;
    return this;
  }

  async createCtx(userId: string): Promise<any> {
    let ctx = {};
    if (DialogManager.ctxDb) {
      ctx = await DialogManager.ctxDb.getById(userId) || {};
    }
    // @ts-ignore
    ctx['_id'] = userId;
    return ctx;
  }

  async process(request: any): Promise<SberResponse> {
    if (!(request instanceof SberRequest)) {
      request = new SberRequest(request);
    }

    if (!this.sessions.hasOwnProperty(request.userId)) {
      const ctx = await this.createCtx(request.userId);
      const newSession = new Session(this.start, request, ctx);
      for (const hook of this.hooks[Event.CreateSession]) {
        await hook(newSession);
      }
      this.sessions[request.userId] = newSession;
    }
    const session = this.sessions[request.userId];
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
      rsp = await this.process(request);
    } else if ({}.toString.call(scriptStep) === '[object GeneratorFunction]') {
      session.script = scriptStep(session.request, session.ctx);
      rsp = await this.process(request);
    } else {
      dateLog(
        chalk.redBright(
          'You have returned unsupported type from your generator'
        )
      );
    }

    if (rsp.end) {
      delete this.sessions[request.userId];
    }
    return rsp;
  }

  newHook(event: Event, callback: Callback) {
    this.hooks[event].push(callback);
    return this;
  }

  newInterceptor() {

  }

  async deleteSessions() {
    const len = Object.keys(this.sessions).length;
    dateLog(chalk.magentaBright(`Total sessions: ${len}`));
    dateLog(chalk.magentaBright('Deleting unused sessions'));

    let counter = 0;
    for (const [key, value] of Object.entries(this.sessions)) {
      const s = (value as Session).lastActive;
      if (Date.now() - s > this.deleteSessionAfter) {
        for (const hook of this.hooks[Event.CreateSession]) {
          await hook(this.sessions[key]);
        }
        delete this.sessions[key];
        counter++;
      }
    }
    dateLog(chalk.magentaBright(`Deleted ${counter} sessions`));
  }
}


const ctxHandler = {
  get(target: any, key: any, receiver: any) {
    return Reflect.get(target, key, receiver);
  },
  set(target: any, key: any, val: any, receiver: any) {
    const newVal = Reflect.set(target, key, val, receiver);
    if (DialogManager.ctxDb) {
      DialogManager.ctxDb.setById(target._id, receiver);
    }
    return newVal
  }
}

export class Session {
  start: any;
  script: Generator<SberRequest, string | SberResponse | Function>;
  ctx: any;
  request: SberRequest; // The link for updating object
  lastActive: number;

  constructor(start: any, request: SberRequest, ctx: Object) {
    this.start = start;
    this.request = request;
    this.ctx = new Proxy(ctx, ctxHandler);
    this.script = start(request, this.ctx);
    this.lastActive = Date.now();
  }

  step(): ScriptStep {
    this.lastActive = Date.now();
    const { value, done } = this.script.next();
    if (done) {
      dateLog(chalk.bgYellow('Script ended. Reloading'));
      this.script = this.start(this.request, this.ctx);
      return this.step();
    }
    return value as ScriptStep;
  }
}
