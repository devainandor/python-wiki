CaduceusWiki.ImageLoader = (function() {

    function insertFile(file) {
        var content = document.getElementById('content');
        var dataURI = file.target.result;
        var img = document.createElement("img");
        img.src = dataURI;
        var selection = window.getSelection();
        selection.getRangeAt(0).insertNode(img);
        return;
        var x = event.clientX;
        var y = event.clientY;
        // http://stackoverflow.com/a/10659990
        var range;
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
        }
        // IE
        else if (document.body.createTextRange) {
            range = document.body.createTextRange();
            range.moveToPoint(x, y);
            var spanId = "temp_" + ("" + Math.random()).slice(2);
            range.pasteHTML('<span id="' + spanId + '">&nbsp;</span>');
            var span = document.getElementById(spanId);
            span.parentNode.replaceChild(img, span);
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

    ['dragenter', 'dragstart', 'dragend', 'dragleave', 'drag', 'dragover'].forEach(function(eventType) {
        window.addEventListener(eventType, function(event) {
            event.preventDefault();
        });
    });
    window.addEventListener('drop', handleDrop);

})();
