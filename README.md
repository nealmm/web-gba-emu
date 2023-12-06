# Web Game Boy Advance Emulator

A port of [@fleroviux](https://github.com/fleroviux)'s [NanoBoyAdvance](https://github.com/nba-emu/NanoBoyAdvance) compiled to [WebAssembly](https://webassembly.org) with [Emscripten](https://emscripten.org).

## Building

[Node.js](https://nodejs.org) is required to build the application.

After cloning the repository, install the necessary packages using `npm` or your preferred package manager.
```
$ npm install
```

Then run the provided `config` script to initialize and update the git submodules, as well as install and activate the Emscripten toolchain.
```
$ npm run config
```

Once configured, just run the provided `build` script.
```
$ npm run build
```

The application should now be built and found in the `dist` directory.

To test the build in a local server, run the provided `preview` script.
```
$ npm run preview
```
