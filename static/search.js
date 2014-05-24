function showResults() {
    clearResults();
    result = JSON.parse(this.responseText);
    var filelist = document.getElementById('pages');
    for (var i=0; i<filelist.children.length; i++) {
        var href = filelist.children[i].getAttribute('href');
        if (href === undefined || href === null) {
            continue;
        }
        if (result.pages.indexOf(href.substring(1)) > -1) {
            filelist.children[i].className += ' highlighted';
        }
    }
}

function clearResults() {
    var filelist = document.getElementById('pages');
    for (var i=0; i<filelist.children.length; i++) {
        filelist.children[i].className = filelist.children[i].className.replace(' highlighted', '');
    }
}

function doSearch(event) {
    if (event.target.value === '') {
        clearResults();
        return;
    }
    var query = event.target.value;
    var request = new XMLHttpRequest();
    request.open('GET', '/search/' + query);
    request.onload = showResults;
    request.send();
}

document.getElementById('search').addEventListener('search', doSearch);
