export class ImageLoader {
    constructor() {
        [
            'dragenter',
            'dragstart',
            'dragend',
            'dragleave',
            'drag',
            'dragover',
        ].forEach((eventType) => {
            window.addEventListener(eventType, (event) => {
                event.preventDefault();
            });
        });
        window.addEventListener('drop', this.handleDrop.bind(this));
    }

    insertImage(fileName) {
        const path = `/static/images/${fileName}`;
        const a = document.createElement('a');
        a.href = path;
        const img = document.createElement('img');
        img.src = path;
        a.appendChild(img);
        const selection = window.getSelection();
        selection.getRangeAt(0).insertNode(a);
        img.setAttribute('width', 'auto');
        img.setAttribute('height', 'auto');
        const event = new Event('imageinsert');
        window.dispatchEvent(event);
    }

    handleDrop(event) {
        event.stopPropagation();
        event.preventDefault();
        const files = event.dataTransfer.files;
        for (let i = 0; i < files.length; i++) {
            const file = files.item(i);
            const formData = new FormData();
            formData.append('file', file);
            fetch('/upload', {
                method: 'POST',
                body: formData,
            })
                .then(this.insertImage.bind(this, file.name));
        }
    }
}
