var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./imgs/hero_hooded.png");
ASSET_MANAGER.queueDownload("./imgs/skeleton.png");

ASSET_MANAGER.downloadAll(function () {
    var canvas = document.getElementById("gameworld");
    var context = canvas.getContext("2d");

    var gameEngine = new GameEngine();
    gameEngine.init(context);
    gameEngine.start();

    gameEngine.addEntity(new Hero(gameEngine, ASSET_MANAGER.getAsset("./imgs/hero_hooded.png")));
    gameEngine.addEntity(new Enemy(gameEngine, ASSET_MANAGER.getAsset("./imgs/skeleton.png")));
    gameEngine.addEntity(new Mage(gameEngine, ASSET_MANAGER.getAsset("./imgs/hero_hooded.png")));
});
