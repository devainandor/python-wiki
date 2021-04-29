export class Editor {
    constructor() {
        this.isDirty = false;
        this.buttonGroups = [
            // styles
            [
                {
                    name: 'link',
                    action: this.toggleLink.bind(this),
                },
                {
                    name: 'list',
                    action: () => { this.setStyle('unorderedList'); },
                },
                {
                    name: 'h2',
                    action: () => { this.setBlockStyle('H2'); },
                },
                {
                    name: 'h3',
                    action: () => { this.setBlockStyle('H3'); },
                },
                {
                    name: 'quote',
                    action: () => { this.setBlockStyle('BLOCKQUOTE'); },
                },
                {
                    name: 'p',
                    action: () => { this.setBlockStyle('P'); },
                },
                {
                    name: 'em',
                    action: () => { this.setInlineStyle('EM'); },
                },
            ],
            // commands
            [
                {
                    name: 'delete',
                    action: this.deleteArticle.bind(this),
                },
                {
                    name: 'save',
                    action: () => {
                        this.saveArticle(() => {
                            this.isDirty = false;
                            this.showNotification('Document saved');
                        });
                    },
                },
            ]
        ];
        const fragment = document.createDocumentFragment();
        this.buttonGroups.forEach((group) => {
            const div = document.createElement('div');
            div.classList.add('toolbar__group');
            fragment.appendChild(div);
            group.forEach((_) => {
                const el = document.createElement('button');
                el.classList.add('toolbar__button');
                el.classList.add(_.name);
                el.appendChild(document.createTextNode(_.name));
                div.appendChild(el);
            });
        });
        const toolbar = document.querySelector('.toolbar');
        toolbar.appendChild(fragment);
        const readonlyButton = document.createElement('button');
        readonlyButton.classList.add('toolbar__button');
        readonlyButton.classList.add('toolbar__button--static');
        readonlyButton.classList.add('toolbar__button--readonly');
        readonlyButton.appendChild(document.createTextNode('Read only'));
        toolbar.appendChild(readonlyButton);
        const isEditable = localStorage.getItem('pywiki.editable') == 'true';
        if (!isEditable) {
            toolbar.classList.add('toolbar--hidden');
            readonlyButton.classList.add('toolbar__button--active');
        } else {
            toolbar.classList.remove('toolbar--hidden');
            readonlyButton.classList.remove('toolbar__button--active');
        }
        readonlyButton.addEventListener('click', this.toggleEditable.bind(this));
        this.contentEl = document.querySelector('.content');
        this.contentEl.contentEditable = localStorage.getItem('pywiki.editable') === 'true';
        this.contentEl.addEventListener('click', this.documentClickHandler.bind(this));
        this.contentEl.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) return;
            this.isDirty = true;
        });
        window.addEventListener('beforeunload', (e) => {
            if (this.isDirty) {
                e.preventDefault();
                return false;
            }
        });
        this.initEventHandlers();
    }

    toggleEditable() {
        let currentState = localStorage.getItem('pywiki.editable') == 'true';
        currentState = !currentState;
        localStorage.setItem('pywiki.editable', currentState.toString());
        this.contentEl.contentEditable = currentState;
        document.querySelector('.toolbar').classList.toggle('toolbar--hidden');
        document.querySelector('.toolbar__button--readonly').classList.toggle('toolbar__button--active');
    }

    setStyle(style) {
        switch (style) {
            case 'unorderedList':
                document.execCommand('insertUnorderedList');
                break;
        }
    }

    showNotification(message) {
        const event = new CustomEvent('documentsave', { detail: message });
        window.dispatchEvent(event);
    }

    documentClickHandler(event) {
        if (event.target.tagName == 'A') {
            this.saveArticle(() => {
                this.isDirty = false;
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
        this.buttonGroups.forEach((group) => {
            group.forEach((button) => {
                document.querySelector(`.${button.name}`)
                    .addEventListener('click', button.action);
            });
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
        const selection = document.getSelection();
        const node = selection.anchorNode;
        const selectedText = document.getSelection().toString();
        const range = selection.getRangeAt(0);
        if (node.parentNode.nodeName === 'A') {
            node.parentElement.parentElement.removeChild(node.parentElement);
            range.insertNode(document.createTextNode(selectedText));
        } else {
            if (selectedText === '') return;
            const el = document.createElement('a');
            el.setAttribute('href', `/${selectedText}`);
            range.surroundContents(el);
        }
        this.isDirty = true;
    }

    setInlineStyle(tagName) {
        const selection = document.getSelection();
        const selectedText = document.getSelection().toString();
        if (selectedText === '') return;
        const range = selection.getRangeAt(0);
        const el = document.createElement(tagName);
        range.surroundContents(el);
        this.isDirty = true;
    }

    setBlockStyle(tagName) {
        const selection = document.getSelection();
        const pos = selection.getRangeAt(0).startOffset;
        const anchorNode = selection.anchorNode;
        const block = anchorNode.nodeType === 1
            ? anchorNode
            : anchorNode.parentNode;
        const el = document.createElement(tagName);
        el.innerHTML = block.innerHTML;
        block.replaceWith(el);
        const range = document.createRange();
        range.setStart(el.childNodes[0], pos);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        this.isDirty = true;
    }

    getMethod() {
        if (this.contentEl.getAttribute('data-empty') === 'true') {
            return 'POST';
        } else {
            return 'PUT';
        }
    }
}
