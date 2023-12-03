var Module = {
    noInitialRun: true,

    canvas: function() {
        return document.getElementById('canvas');
    }(),

    preRun: [function() {
        FS.mkdir('saves');
        FS.mount(IDBFS, {}, 'saves');
        FS.syncfs(true, () => {});

        const dialog = document.getElementById('rom-dialog');
        const input = document.getElementById('rom-file-input');
        const button = document.getElementById('play-rom-button');

        dialog.showModal();

        input.addEventListener('change', event => {
            if (input.files.length > 0) {
                button.hidden = false;
                button.title = `Play ${input.files[0].name}`;
            }
            else {
                button.hidden = true;
            }
        });

        button.addEventListener('click', async () => {
            const file = input.files[0];
            const buffer = new Uint8Array(await file.arrayBuffer());
            const stream = FS.open(file.name, 'w+');

            FS.write(stream, buffer, 0, buffer.length);
            FS.close(stream);

            dialog.close();

            Module.callMain([file.name]);
        });
    }],

    onRuntimeInitialized: function() {
        const keymap = {
            'KeyW': Module.Key.Up,
            'KeyS': Module.Key.Down,
            'KeyA': Module.Key.Left,
            'KeyD': Module.Key.Right,
            'KeyX': Module.Key.Start,
            'KeyZ': Module.Key.Select,
            'KeyL': Module.Key.A,
            'KeyK': Module.Key.B,
            'ShiftLeft': Module.Key.L,
            'ShiftRight': Module.Key.R
        };

        document.addEventListener('keydown', event => {
            if (!event.repeat) {
                const key = keymap[event.code];

                if (key !== undefined) {
                    Module.setKeyStatus(key, true);
                }
            }
        });

        document.addEventListener('keyup', event => {
            const key = keymap[event.code];

            if (key !== undefined) {
                Module.setKeyStatus(key, false);
            }
        });

        if ('ontouchstart' in window || (window.DocumentTouch && document instanceof DocumentTouch)) {
            const touchControls = document.getElementById('touch-controls');
            touchControls.hidden = false;

            const handlePress = id => {
                switch (id) {
                    case 'up-button':
                        Module.setKeyStatus(Module.Key.Up, true);
                        break;

                    case 'down-button':
                        Module.setKeyStatus(Module.Key.Down, true);
                        break;

                    case 'left-button':
                        Module.setKeyStatus(Module.Key.Left, true);
                        break;

                    case 'right-button':
                        Module.setKeyStatus(Module.Key.Right, true);
                        break;

                    case 'start-button':
                        Module.setKeyStatus(Module.Key.Start, true);
                        break;

                    case 'select-button':
                        Module.setKeyStatus(Module.Key.Select, true);
                        break;

                    case 'a-button':
                        Module.setKeyStatus(Module.Key.A, true);
                        break;

                    case 'b-button':
                        Module.setKeyStatus(Module.Key.B, true);
                        break;

                    case 'l-button':
                        Module.setKeyStatus(Module.Key.L, true);
                        break;

                    case 'r-button':
                        Module.setKeyStatus(Module.Key.R, true);
                        break;
                }
            };

            const handleDepress = id => {
                switch (id) {
                    case 'up-button':
                        Module.setKeyStatus(Module.Key.Up, false);
                        break;

                    case 'down-button':
                        Module.setKeyStatus(Module.Key.Down, false);
                        break;

                    case 'left-button':
                        Module.setKeyStatus(Module.Key.Left, false);
                        break;

                    case 'right-button':
                        Module.setKeyStatus(Module.Key.Right, false);
                        break;

                    case 'start-button':
                        Module.setKeyStatus(Module.Key.Start, false);
                        break;

                    case 'select-button':
                        Module.setKeyStatus(Module.Key.Select, false);
                        break;

                    case 'a-button':
                        Module.setKeyStatus(Module.Key.A, false);
                        break;

                    case 'b-button':
                        Module.setKeyStatus(Module.Key.B, false);
                        break;

                    case 'l-button':
                        Module.setKeyStatus(Module.Key.L, false);
                        break;

                    case 'r-button':
                        Module.setKeyStatus(Module.Key.R, false);
                        break;
                }
            };

            const lastTarget = {};

            touchControls.addEventListener('touchstart', event => {
                for (touch of event.changedTouches) {
                    lastTarget[touch.identifier] = touch.target;
                    handlePress(touch.target.id);
                }
            });

            touchControls.addEventListener('touchend', event => {
                for (touch of event.changedTouches) {
                    handleDepress(lastTarget[touch.identifier].id);
                    delete lastTarget[touch.identifier];
                }
            });

            touchControls.addEventListener('touchmove', event => {
                for (touch of event.changedTouches) {
                    const elem = document.elementFromPoint(touch.clientX, touch.clientY);

                    if (lastTarget[touch.identifier] != elem) {
                        handleDepress(lastTarget[touch.identifier].id);
                        lastTarget[touch.identifier] = elem;
                        handlePress(elem.id);
                    }
                }
            });

            touchControls.addEventListener('touchcancel', event => {
                for (touch of event.changedTouches) {
                    handleDepress(lastTarget[touch.identifier].id);
                    delete lastTarget[touch.identifier];
                }
            });
        }
    }
};
