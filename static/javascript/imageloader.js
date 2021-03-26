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
        const img = document.createElement('img');
        img.src = `/static/images/${fileName}`;
        const selection = window.getSelection();
        selection.getRangeAt(0).insertNode(img);
        img.setAttribute('width', 'auto');
        img.setAttribute('height', 'auto');
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
