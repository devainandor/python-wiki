export class Editor {
    constructor() {
        this.buttons = [
            {
                name: 'delete',
                action: this.deleteArticle.bind(this),
            },
            {
                name: 'link',
                action: this.toggleLink.bind(this),
            },
            {
                name: 'list',
                action: () => { document.execCommand('insertUnorderedList'); },
            },
            {
                name: 'h2',
                action: () => { this.toggleBlock('H2'); },
            },
            {
                name: 'blockquote',
                action: () => { this.toggleBlock('BLOCKQUOTE'); },
            },
            {
                name: 'save',
                action: this.saveArticle.bind(this),
            },
        ];
        this.contentEl = document.querySelector('.content');
        this.contentEl.contentEditable = true;
        this.contentEl.addEventListener('click', this.documentClickHandler.bind(this));
        this.contentEl.addEventListener('keydown', this.keyHandler.bind(this));
        this.initEventHandlers();
    }

    keyHandler(event) {
        if (event.code === 'KeyS' && event.metaKey) {
            this.saveArticle();
            event.preventDefault();
        }
    }

    documentClickHandler(event) {
        if (event.target.tagName == 'A') {
            this.saveArticle(() => {
                window.location = event.target.getAttribute('href').toString();
            });
        } else if (event.target.tagName == 'INPUT'
            && event.target.parentElement.tagName === 'LI') {
            this.setStrikethrough(event.target);
        }
    }

    saveArticle(callback = null) {
        const method = this.getMethod();
        const content = document.querySelector('.content');
        const request = new XMLHttpRequest();
        request.open(method, document.URL, true);
        this.contentEl.setAttribute('data-empty', 'false');
        const formData = new FormData();
        formData.append('content', content.innerHTML);
        if (callback) {
            request.onload = callback;
        }
        request.send(formData);
        this.refreshSidebar();
    }

    initEventHandlers() {
        this.buttons.forEach((button) => {
            document.querySelector(`.${button.name}`)
                .addEventListener('click', button.action);
        });
    }

    refreshSidebar() {
        const request = new XMLHttpRequest();
        request.open('GET', '/files');
        request.onload = function () {
            const linkList = document.querySelector('.pages');
            linkList.innerHTML = '';
            const response = JSON.parse(this.responseText);
            const fragment = document.createDocumentFragment();
            response.pages.forEach((page) => {
                const a = document.createElement('a');
                const text = document.createTextNode(page);
                a.appendChild(text);
                a.setAttribute('href', `/${page}`);
                fragment.appendChild(a);
            });
            linkList.appendChild(fragment);
        };
        request.send();
    }

    deleteArticle() {
        const request = new XMLHttpRequest();
        request.open('DELETE', document.URL);
        request.send();
        request.onload = function () {
            window.location = '/';
        };
    }

    toggleLink() {
        const node = document.getSelection().anchorNode;
        if (node.parentNode.nodeName === 'A') {
            document.execCommand('unlink', false, false);
        } else {
            const selectedText = document.getSelection().toString();
            document.execCommand('createLink', true, selectedText);
        }
    }

    getCurrentBlock(el) {
        let block = el;
        while (window.getComputedStyle(block).display !== 'block') {
            block = block.parentElement;
        }
        return block;
    }

    toggleBlock(tagName) {
        // FIXME:
        const anchorNode = document.getSelection().anchorNode;
        console.log(anchorNode);
        const block = anchorNode.nodeType === 1
            ? anchorNode
            : anchorNode.parentNode;
        const newTagName = block.tagName === tagName
            ? 'p'
            : tagName;
        const el = document.createElement(newTagName);
        el.innerHTML = block.innerHTML;
        block.replaceWith(el);
    }

    getMethod() {
        if (this.contentEl.getAttribute('data-empty') === 'true') {
            return 'POST';
        } else {
            return 'PUT';
        }
    }
}
