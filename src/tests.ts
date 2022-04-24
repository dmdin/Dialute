// import chalk from 'chalk';
// import express = require("express");
// import { DateLog, DialogManger } from "./dialog";
// import { SberRequest, SberResponse } from './api';
//
// function* script(r: SberRequest) {
//   const rsp = r.buildRsp();
//   while (true) {
//     rsp.msg = r.msg;
//     rsp.kbrd = ['1', '2', '3'];
//     // yield r.nlu.lemmaIntersection(['привет', 'салют', 'дело']).toString();
//     yield rsp;
//   }
// }
//
// const dm = new DialogManger(script);
// const app = express();
// const port = 8000;
//
// app.use((req, res, next) => {
//   DateLog(`${chalk.green(req.method)}: ${chalk.cyan(req.path)}`);
//   next();
// });
// app.use(express.json());
// app.post('/app-connector/', (request, response) => {
//   const body = dm.process(request.body);
//   response.send(body);
// });
//
// app.listen(port, () => DateLog(chalk.blue(`Start server on http://localhost:${port}/`)));

function* s(): any {
  yield 'Hello';
  yield 'World';
  yield a
  yield b
  yield b()

}

function a() {
  return 'qeqw'
}

function* b() {
  yield '1'
  yield '2'
  yield s()
}

let f = s();

console.log(s.name);
let r;

r = f.next()
console.log(r)
r = f.next()
console.log(r)
r = f.next()

console.log(r)
r = f.next()
console.log(r)
r = f.next()
console.log(r)

f = r.value as Generator;
r = f.next()
console.log(r)
r = f.next()
console.log(r)
r = f.next()
console.log(r)

f = r.value as Generator;
r = f.next()
console.log(r)

console.log('----------------------------')
console.log({}.toString.call(s))
console.log({}.toString.call(f))
console.log({}.toString.call(f) === '[object Generator]')
console.log({}.toString.call(f) === '[object GeneratorFunction]')

