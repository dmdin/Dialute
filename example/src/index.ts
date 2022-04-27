import { Dialute, SberRequest } from 'dialute';

function* script(r: SberRequest) {
  while (true) {
    yield 'Hello world from Dialute!';
  }
}

const d = Dialute.fromEntrypoint(script as GeneratorFunction);
d.start();
