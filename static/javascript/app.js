import { Editor } from './editor.js';
import { Search } from './search.js';
import { ImageLoader } from './imageloader.js';

class Wiki {
    constructor() {
        this.editor = new Editor();
        this.search = new Search();
        this.imageLoader = new ImageLoader();
    }
}

window.onload = () => {
    const wiki = new Wiki();
};
