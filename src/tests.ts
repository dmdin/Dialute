import { ScriptStep, DialogManager, Event } from './dialog';
import { Dialute } from './server';
import { SberRequest, SberResponse } from './api';
import { Mongo } from './db';

// const db = new Mongo({
//   uri: `test`,
//   dbName: 'test',
//   collectionName: 'test',
// });

function* script(r: SberRequest, ctx: any): ScriptStep {
  console.log(ctx)
  const rsp = r.buildRsp();
  while (true) {
    rsp.msg = r.msg;
    rsp.kbrd = ['1', '2', '3'];
    // yield r.nlu.lemmaIntersection(['привет', 'салют', 'дело']).toString();
    yield rsp;
    ctx.num = 2;
    yield a;
  }
}

function* a(r: SberRequest): ScriptStep {
  yield 'Hello from a';
  yield 'Hello from a 2';
  yield b;
}

function* b(r: SberRequest, ctx: any): ScriptStep {
  const { num } = ctx;
  yield `Hello from b, num is ${num}`;
  yield 'Hello from b 2';
  yield script(r, ctx);
}

const dm = new DialogManager(script as GeneratorFunction)
  // .setCtxDb(db)
  .newHook(Event.CreateSession, async s =>
    console.log('New session!', s.request.userId)
  );

const d = new Dialute({ dm, port: '8000' });

// const d = Dialute.fromEntrypoint(script as GeneratorFunction)
d.start();
