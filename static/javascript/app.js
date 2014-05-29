var CaduceusWiki = {};

window.onload = function() {
    CaduceusWiki.Editor.init();
    CaduceusWiki.ImageLoader.init();
    CaduceusWiki.Search.init();
    this.onbeforeunload = CaduceusWiki.Editor.checkBeforeUnload;
};
