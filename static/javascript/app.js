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
    }
}

window.onload = () => {
    const wiki = new Wiki();
};
