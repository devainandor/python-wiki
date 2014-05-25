function showResults() {
    clearResults();
    result = JSON.parse(this.responseText);
    var filelist = document.getElementById('pages');
    for (var i=0; i<filelist.children.length; i++) {
        var href = filelist.children[i].getAttribute('href');
        if (result.pages.indexOf(href.substring(1)) == -1) {
            filelist.children[i].style.visibility = 'hidden';
        }
    }
}

function clearResults() {
    var filelist = document.getElementById('pages');
    for (var i=0; i<filelist.children.length; i++) {
        filelist.children[i].style.visibility = 'visible';
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
