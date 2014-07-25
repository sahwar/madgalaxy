This application uses 'debug', a library to help manage errors and logs that 
are outputted to the console. There are mutiple 'debug' groups in this 
application that can be selectivley turned on or off.

Here are is a list of all current debug groups:

- feedreader:feedparser
- feedreader:post_saver
- feedreader:elasticsearch
- api_v1
- router:api_v1
- taggingSystem
- server

Currenlty, which debug groups that are outputted to the console is determined by the startup script
in package.json
```
  "scripts": {
    "start": "DEBUG=server,feedreader:*,api_v1,router ./node_modules/.bin/supervisor ./bin/www", <-----this line
    "test": "./node_modules/.bin/mocha"
  },
```

If a debug group is included in the DEBUG variable, it is logged to the console, and if it is excluded,
it is not logged to the console.

Here is some more documentation od debug: https://github.com/visionmedia/debug

