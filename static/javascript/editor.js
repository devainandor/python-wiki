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
                name: 'quote',
                action: () => { this.toggleBlock('BLOCKQUOTE'); },
            },
            {
                name: 'save',
                action: this.saveArticle.bind(this),
            },
        ];
        const fragment = document.createDocumentFragment();
        this.buttons.forEach((_) => {
            const el = document.createElement('button');
            el.classList.add(_.name);
            el.appendChild(document.createTextNode(_.name[0].toUpperCase() + _.name.slice(1)));
            fragment.appendChild(el);
        });
        document.querySelector('.toolbar').appendChild(fragment);
        this.contentEl = document.querySelector('.content');
        this.contentEl.contentEditable = true;
        this.contentEl.addEventListener('click', this.documentClickHandler.bind(this));
        this.contentEl.addEventListener('keydown', this.keyHandler.bind(this));
        this.initEventHandlers();
    }

    keyHandler(event) {
        if (event.code === 'KeyS' && event.metaKey) {
            this.saveArticle(() => { this.showNotification('Document saved'); });
            event.preventDefault();
        }
    }

    showNotification(message) {
        const event = new CustomEvent('documentsave', { detail: message });
        window.dispatchEvent(event);
    }

    documentClickHandler(event) {
        if (event.target.tagName == 'A') {
            this.saveArticle(() => {
                window.location = event.target.getAttribute('href').toString();
            });
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

    toggleBlock(tagName) {
        const anchorNode = selection.anchorNode;
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
