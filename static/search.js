function doSearch(event) {
    if (event.keyCode == '13') {
        var query = event.target.value;
        window.location = '/search/' + query;
    }
}

window.onload = function() {
    document.getElementById('search').addEventListener('keypress', doSearch);
};
