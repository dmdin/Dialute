# 🧶 Dialute

The way you will want to create Chat and Canvas Apps for SberSalute. Use the power of generator based scripts and simple
interface of the framework. Based
on [SmartApp API](https://developer.sberdevices.ru/docs/ru/developer_tools/amp/smartappapi_description_and_guide)

## ⚙️ Install

The framework is published in __[NPM](https://www.npmjs.com/package/dialute)__, thus you can simply install it into your existing
```shell
$: npm install dialute
```

The preferred way to initialize the project is to clone needed [template](https://github.com/Dikower/dialute-starter-svelte) and immediately start development.

```shell
$: git clone https://github.com/Dikower/dialute-starter-svelte
# or simply
$: npx degit dikower/dialute-starter-svelte
```

## 🚀 Startup
__Dialute__ uses [__Express__](https://expressjs.com/) behind to handle requests from [__SmartMarket__](https://developers.sber.ru/).
Thanks to the framework, you can skip all boring and routine stuff about parsing request bodies and managing sessions of users and focus
on logic and dialog creation using [__JavaScript Generators__](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator).
If you are using [_example_](https://github.com/Dikower/Dialute/tree/master/example) or [_template_](https://github.com/Dikower/dialute-starter-svelte) and familiar with [__ngrok__](https://ngrok.com/), just run
```shell
# Shell №1
$: npm run dev

#-------------
# Shell №2
$: ngrok http 8000

```

## 💎 Concept
The generator represents a dialog. When a user sends a message it triggers the update of _SberRequest_ object, that is passed to the generator as reference.
That's why you can easily read the updated message from the same variable. On the other hand, yield will return the content, you pass to user, and then will wait until next message 
to continue executing script. The generator saves context inside, so it helps us to construct state dependent dialog using just plain JavaScript or TypeScript

* Import the framework starter and _SberRequest_ for type annotation
  ```ts
  import { Dialute, SberRequest } from 'dialute';
  ```
* Write a generator, that describes the dialog. It must have one required argument: _SberRequest_ and one optional argument _Context_, you can  
  ```ts
    // You can use any name for generator you want
    // r: this is a ref for SberRequest, it will be updated after each user message
    // ctx: Optional argument for advanced techniques, you can skip it for now
    // function* script(r: SberRequest, ctx: any) {
    function* script(r: SberRequest) { // Also possible
      while (true) {
        // send the message to user 
        yield 'Hello world from Dialute!';
        // yield r.msg  // This will make echo-bot, that repeats user input
      }
    }
    ```
* Set the entrypoint of dialog and start the server
    ```ts
    // Creates ready to start server from generator
    const d = Dialute.fromEntrypoint(script as GeneratorFunction);
    // Starts listening for requests from SmartMarket
    d.start();
    ```
  
* Use [*nodemon*](https://www.npmjs.com/package/nodemon) in *package.json* scripts to enable hot reload
    ```json
    "scripts": {
      "dev": "nodemon --exec npx ts-node src/index.ts",
    }
    ```
* Run *ngrok* tunnel on __port 8000__. Paste https link into Webhook field in __SmartApp__ settings.
    ```shell
    $: ngrok http 8000
    ```
* The whole code can be found inside [_example_](https://github.com/Dikower/Dialute/tree/master/example) directory
## 📋 Docs
https://dialute.vercel.app

## 🥰 Support

You can always click on the ⭐️ of the repo and donate. I will be very glad for any support

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/Dikower)
