var Module = {
    noInitialRun: true,

    canvas: function() {
        return document.getElementById('canvas');
    }(),

    preRun: [function() {
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
    }]
};
