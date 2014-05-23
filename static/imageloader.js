function handleDrag(event) {
    event.stopPropagation();
    event.preventDefault();
}

function insertFile(file) {
    var dataURI = file.target.result;
    var img = document.createElement("img");
    img.src = dataURI;
    var x = event.clientX;
    var y = event.clientY;
    // Back to 1999…
    // Firefox
    if (document.caretPositionFromPoint) {
        var pos = document.caretPositionFromPoint(x, y);
        range = document.createRange();
        range.setStart(pos.offsetNode, pos.offset);
        range.collapse();
        range.insertNode(img);
    }
    // WebKit
    else if (document.caretRangeFromPoint) {
        range = document.caretRangeFromPoint(x, y);
        range.insertNode(img);
    } else {
        // IE…
    }
}

function handleDrop(event) {
    event.stopPropagation();
    event.preventDefault();
    var files = event.dataTransfer.files;
    for (var i = 0; i < files.length; i++) {
        file = files.item(i);
        if (file.type.match('image.*')) {
            var reader = new FileReader();
            reader.onload = insertFile;
            reader.readAsDataURL(file);
        }
    }
}

var dropZone = document.getElementById('content');
dropZone.addEventListener('dragover', handleDrag, false);
dropZone.addEventListener('drop', handleDrop, false);
