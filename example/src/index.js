// You can use this version with simple JavaScript
// Just change dev command in package.json
// "nodemon --exec npx ts-node src/index.ts" to "nodemon src/index.js"
// and add in root "type": "module"
import { Dialute } from 'dialute';

// You can use any name for generator you want
// r: this is a ref for SberRequest, it will be updated after each user message
// ctx: Optional argument for advanced techniques, you can skip it for now
// function* script(r: SberRequest, ctx: any) {
function* script(r) { // Also possible
  while (true) {
    // send the message to user
    yield 'Hello world from Dialute!';
    // yield r.msg  // This will make echo-bot, that repeats user input
  }
}

// Creates ready to start server from generator
const d = Dialute.fromEntrypoint(script);
// Starts listening for requests from SmartMarket
d.start();