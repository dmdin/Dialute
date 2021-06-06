import { SberRequest } from './api';

export function* script(r: SberRequest) {
  while (true) {
    yield 'Hello world from Dialute!';
    yield r.msg;
  }
}
