// https://stackoverflow.com/a/62266439

export class Editor {
    constructor() {
        this.contentEl = document.querySelector('.content');
        this.setEditable();
        this.initEventHandlers();
    }

    setEditable() {
        this.contentEl.contentEditable = true;
        this.contentEl.addEventListener('click', this.documentClickHandler.bind(this));
        const title = document.querySelector('h1');
        title.contentEditable = true;
        title.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                this.contentEl.focus();
                event.preventDefault();
            }
        });
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

    // TODO: rename
    saveArticle(callback = null) {
        const method = this.getMethod();
        const article = document.querySelector('article');
        const request = new XMLHttpRequest();
        request.open(method, document.URL, true);
        this.contentEl.setAttribute('data-empty', 'false');
        const formData = new FormData();
        formData.append('content', article.innerHTML);
        if (callback) {
            request.onload = callback;
        }
        request.send(formData);
        this.refreshSidebar();
    }

    setStrikethrough(el) {
        if (el.checked) {
            el.parentElement.style.textDecoration = 'line-through';
            el.setAttribute('checked', 'checked');
        } else {
            el.parentElement.style.textDecoration = '';
            el.removeAttribute('checked');
        }
    }

    initEventHandlers() {
        const buttons = [
            {
                name: 'delete',
                action: this.deleteArticle.bind(this),
            },
            {
                name: 'link',
                action: this.insertLink.bind(this),
            },
            {
                name: 'list',
                // TODO:
                action: () => { document.execCommand('insertUnorderedList'); },
            },
            {
                name: 'del',
                // TODO:
                action: () => { document.execCommand('strikeThrough'); },
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
        buttons.forEach((button) => {
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
            // TODO: append at once?
            response.pages.forEach((page) => {
                const a = document.createElement('a');
                const text = document.createTextNode(page);
                a.appendChild(text);
                a.setAttribute('href', `/${page}`);
                linkList.appendChild(a);
            });
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

    insertLink() {
        const selectedText = document.getSelection().toString();
        // TODO:
        document.execCommand('createLink', true, selectedText);
    }

    getBlockParent(el) {
        let parent = null;
        let currentChild = el;
        do {
            parent = currentChild.parentElement;
            currentChild = parent;
        } while (window.getComputedStyle(parent).display !== 'block');
        return parent;
    }

    toggleBlock(tagName) {
        // FIXME: get block level parent
        const node = this.getBlockParent(document.getSelection().anchorNode);
        if (node.tagName == tagName) {
            // TODO:
            document.execCommand('formatBlock', true, 'P');
        } else {
            // TODO:
            document.execCommand('formatBlock', true, tagName);
        }
    }

    getMethod() {
        if (this.contentEl.getAttribute('data-empty') === 'true') {
            return 'POST';
        } else {
            return 'PUT';
        }
    }
}
