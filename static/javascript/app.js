import { Editor } from './editor.js';
import { Search } from './search.js';
import { ImageLoader } from './imageloader.js';
import { ImageViewer } from './imageviewer.js';

class Wiki {
    constructor() {
        this.editor = new Editor();
        this.search = new Search();
        this.imageLoader = new ImageLoader();
        this.imageViewer = new ImageViewer();
        window.addEventListener('imageinsert', () => { this.imageViewer.initImageHandlers(); });
        window.addEventListener('documentsave', this.showNotification);
    }

    showNotification(event) {
        const el = document.querySelector('.notification');
        el.classList.add('notification--active');
        el.innerHTML = event.detail;
        setTimeout(() => {
            el.classList.remove('notification--active');
        }, 1000);
    }
}

window.onload = () => {
    const wiki = new Wiki();
};

if (localStorage.getItem('pywiki.editable') === null) {
    localStorage.setItem('pywiki.editable', 'true');
}
