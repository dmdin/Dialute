import {ScriptStep, DialogManger} from "./dialog";
import {Dialute} from "./server";
import { SberRequest, SberResponse } from './api';

function* script(r: SberRequest): ScriptStep {
  const rsp = r.buildRsp();
  while (true) {
    rsp.msg = r.msg;
    rsp.kbrd = ['1', '2', '3'];
    // yield r.nlu.lemmaIntersection(['привет', 'салют', 'дело']).toString();
    yield rsp;
    yield a(r)
  }
}

function* a(r: SberRequest): ScriptStep {
  console.log('hey')
  yield 'Hello from a'
  yield 'Hello from a 2'
  yield b(r, 1)
}

function* b(r: SberRequest, num: number): ScriptStep {
  yield `Hello from b, num is ${num}`
  yield 'Hello from b 2'
  yield script(r)
}

const d = Dialute.fromEntrypoint(script as GeneratorFunction)
d.start()
