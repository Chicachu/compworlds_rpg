var ASSET_MANAGER = new AssetManager();

//ASSET_MANAGER.queueDownload("./imgs/hero_hooded.png");
ASSET_MANAGER.queueDownload("./imgs/skeleton.png");
ASSET_MANAGER.queueDownload("./imgs/warrior.png")
ASSET_MANAGER.queueDownload("./imgs/npc-female.png")
ASSET_MANAGER.queueDownload("./imgs/woods.png");
ASSET_MANAGER.queueDownload("./imgs/desert.png");

ASSET_MANAGER.downloadAll(function () {
    var canvas = document.getElementById("gameworld");
    var context = canvas.getContext("2d");

    var gameEngine = new GameEngine();

    var warrior = new Warrior(gameEngine, new Statistics(50, 20, 10));
    var enemy = new Enemy(gameEngine, new Statistics(1000, 15, 5));
    var npc = new NPC(gameEngine);

    gameEngine.addEntity(warrior);
    gameEngine.addEntity(enemy);
    gameEngine.addEntity(npc);

    //gameEngine.addEntity(new Enemy(gameEngine, ASSET_MANAGER.getAsset("./imgs/skeleton.png")));
    gameEngine.init(context);
    
   // console.log(warrior.stats.health);
   // enemy.fight(warrior);
   // console.log(warrior.stats.health);
    gameEngine.start();
    
    
});
