import { Editor } from './editor.js';
import { Search } from './search.js';

class Wiki {
    constructor() {
        this.editor = new Editor();
        this.search = new Search();
    }
}

window.onload = () => {
    const wiki = new Wiki();
};
