var CaduceusWiki = {};

window.onload = function() {
    CaduceusWiki.Editor.init();
    // CaduceusWiki.ImageLoader.init();
    this.onbeforeunload = CaduceusWiki.Editor.checkBeforeUnload;
};

