var Module = {
    noInitialRun: true,

    canvas: function() {
        return document.getElementById('canvas');
    }(),

    preRun: [function() {
        alert('preRun');
        FS.mkdir('saves');
        FS.mount(IDBFS, {}, 'saves');
        FS.syncfs(true, () => {});

        const dialog = document.getElementById('rom-dialog');
        const input = document.getElementById('rom-file-input');
        const button = document.getElementById('play-rom-button');

        dialog.showModal();

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
        alert('onRuntimeInitialized');
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
    }
};
