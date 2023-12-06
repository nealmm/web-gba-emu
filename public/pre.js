function setupEventListeners() {
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

            if (key != undefined) {
                Module.setKeyStatus(key, true);
            }
        }
    });

    document.addEventListener('keyup', event => {
        const key = keymap[event.code];

        if (key != undefined) {
            Module.setKeyStatus(key, false);
        }
    });

    if ('ontouchstart' in window || (window.DocumentTouch && document instanceof DocumentTouch)) {
        const touchControls = document.getElementById('touch-controls');
        touchControls.hidden = false;

        const mediaQuery = window.matchMedia('(orientation: portrait)');

        if (mediaQuery.matches) {
            document.getElementById('display').style.height = '50%';
        }

        mediaQuery.addEventListener('change', event => {
            if (event.matches) {
                document.getElementById('display').style.height = '50%';
            }
            else {
                document.getElementById('display').style.height = '100%';
            }
        });

        const buttonMap = {
            'up-button': Module.Key.Up,
            'down-button': Module.Key.Down,
            'left-button': Module.Key.Left,
            'right-button': Module.Key.Right,
            'start-button': Module.Key.Start,
            'select-button': Module.Key.Select,
            'a-button': Module.Key.A,
            'b-button': Module.Key.B,
            'l-button': Module.Key.L,
            'r-button': Module.Key.R
        };

        const handlePress = id => {
            const key = buttonMap[id];

            if (key != undefined) {
                Module.setKeyStatus(key, true);
            }
        };

        const handleDepress = id => {
            const key = buttonMap[id];

            if (key != undefined) {
                Module.setKeyStatus(key, false);
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

var Module = {
    noInitialRun: true,

    canvas: function() {
        return document.getElementById('canvas');
    }(),

    preRun: [function() {
        const storedTheme = typeof localStorage !== "undefined" && localStorage.getItem("theme");
        const theme = storedTheme || (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");

        // should check for valid stored theme value

        const root = document.documentElement;

        if ((theme === "dark" && root.classList.contains("dark")) || (theme === "light" && !root.classList.contains("dark"))) {
            // nothing to set here
        }
        else {
            document.documentElement.classList.toggle("dark", theme === "dark");
        }

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

            Module.callMain([file.name]);

            setupEventListeners();

            dialog.close();
        });
    }]
};
