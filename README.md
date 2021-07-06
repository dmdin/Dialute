# 🧶 Dialute

The way you will want to create Chat and Canvas Apps for SberSalute. Use the power of generator based scripts and simple
interface of the framework. Based
on [SmartApp API](https://developer.sberdevices.ru/docs/ru/developer_tools/amp/smartappapi_description_and_guide)

## ⚙️ Install

```bash
$: npm install dialute
```

## 🚀 Startup

* Initiate the ordinary *express* project
* Write a generator with the single argument: __request__
    ```js
    // you can use any names you want
    function* script(r /*this is a link*/) { 
      // each time after yield the request object will be updated
      while (true) {
        // send the message to user
        yield 'Hello world from Dialute!';
      }
    }
    ```
* Import the framework and create the __DialogManager__, pass the generator to it
    ```js
    const {DialogManger} = require("dialute");
    const dm = new DialogManger(script);
    ```
* Use *json* parser middleware
    ```js
    const express = require("express");
    const app = express();
    app.use(express.json());
    ```
* Add handler for a POST method on *"/app-connector/"* and use __DialogManager__ to process the request body
    ```js
    app.post('/app-connector/', (request, response) => {
      const body = dm.process(request.body);
      response.send(body);
    });
    ```
* Start the server
    ```js
    app.listen(8000, () => console.log(`Started server on http://localhost:8000/`));
    ```
* Use *nodemon* in *package.json* scripts to enable hot reload
    ```json
    "dev": "nodemon index.js",
    ```
* Run *ngrok* tunnel on __port 8000__. Paste https link into Webhook field in __SmartApp__ settings.
    ```bash
    $: ngrok http 8000
    ```

## 📋 Docs

Coming soon...

## 🥰 Support

You can always click on the star of repo and donate. I will be very glad for any support

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/gbraad)
