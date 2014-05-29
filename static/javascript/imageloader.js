CaduceusWiki.ImageLoader = (function() {

    function insertFile(file) {
        var content = document.getElementById('content');
        var dataURI = file.target.result;
        var img = document.createElement("img");
        img.src = dataURI;
        var selection = window.getSelection();
        selection.getRangeAt(0).insertNode(img);
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

    return {
        init: function() {
            ['dragenter', 'dragstart', 'dragend', 'dragleave', 'drag', 'dragover'].forEach(function(eventType) {
                window.addEventListener(eventType, function(event) {
                    event.preventDefault();
                });
            });
            window.addEventListener('drop', handleDrop);
        }
    };    

})();
