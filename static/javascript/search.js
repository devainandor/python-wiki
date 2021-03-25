export class Search {
    constructor() {
        this.typing = false;
        this.search = null;
        document.querySelector('.search')
            .addEventListener('keyup', (event) => {
                this.typing = true;
                this.doSearch(event);
            });
        this.filelistEl = document.querySelector('.pages');
    }

    showResults(request) {
        this.clearResults();
        const result = JSON.parse(request.responseText);
        for (let i = 0; i < this.filelistEl.children.length; i++) {
            const href = this.filelistEl.children[i].getAttribute('href');
            if (result.pages.indexOf(href.substring(1)) == -1) {
                this.filelistEl.children[i].style.display = 'none';
            }
        }
    }

    clearResults() {
        for (let i = 0; i < this.filelistEl.children.length; i++) {
            this.filelistEl.children[i].style.display = 'block';
        }
    }

    doSearch(event) {
        if (this.typing) {
            this.typing = false;
            clearTimeout(this.search);
            this.search = setTimeout(() => {
                this.doSearch(event);
            }, 400);
            return;
        }
        if (event.target.value === '') {
            this.clearResults();
            return;
        }
        const query = event.target.value;
        const request = new XMLHttpRequest();
        request.open('GET', '/search/' + query.replace('#', '%23'));
        request.onload = this.showResults.bind(this, request);
        request.send();
    }
}
