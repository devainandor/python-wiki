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

    insertFile(file) {
        const dataURI = file.target.result;
        const img = document.createElement('img');
        img.src = dataURI;
        const selection = window.getSelection();
        selection.getRangeAt(0).insertNode(img);
    }

    handleDrop(event) {
        event.stopPropagation();
        event.preventDefault();
        const files = event.dataTransfer.files;
        for (let i = 0; i < files.length; i++) {
            const file = files.item(i);
            if (file.type.match('image.*')) {
                const reader = new FileReader();
                reader.onload = this.insertFile.bind(this);
                reader.readAsDataURL(file);
            }
        }
    }
}
