export class ImageViewer {
    constructor() {
        this.name = 'image-viewer';
        document.querySelector('.image-viewer')
            .addEventListener('click', (event) => {
                event.currentTarget.classList.remove(`${this.name}--visible`);
            });
        this.initImageHandlers();
    }

    initImageHandlers() {
        document.querySelectorAll('.content img').forEach((_) => {
            _.addEventListener('click', this.showImage.bind(this));
        });
    }

    showImage(event) {
        console.log(event.target);
        const el = document.querySelector(`.${this.name} img`);
        const src = event.target.getAttribute('src');
        if (el.getAttribute('src') !== src) {
            el.setAttribute('src', src);
        }
        el.parentElement.classList.add(`${this.name}--visible`);
    }
}
