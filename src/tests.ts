import {ScriptStep, DialogManger, Event} from "./dialog";
import {Dialute} from "./server";
import { SberRequest, SberResponse } from './api';

function* script(r: SberRequest): ScriptStep {
  const rsp = r.buildRsp();
  while (true) {
    rsp.msg = r.msg;
    rsp.kbrd = ['1', '2', '3'];
    // yield r.nlu.lemmaIntersection(['привет', 'салют', 'дело']).toString();
    yield rsp;
    yield a
  }
}

function* a(r: SberRequest): ScriptStep {
  yield 'Hello from a'
  yield 'Hello from a 2'
  yield b(r, 1)
}

function* b(r: SberRequest, num: number): ScriptStep {
  yield `Hello from b, num is ${num}`
  yield 'Hello from b 2'
  yield script(r)
}

// const d = Dialute.fromEntrypoint(script as GeneratorFunction)

const dm = new DialogManger(script as GeneratorFunction);
dm.newHook(
  Event.CreateSession,
  async (s)=> console.log('New session!', s.userId)
)

const d = new Dialute({dm, port: '8000'})
d.start()
