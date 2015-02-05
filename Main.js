var ASSET_MANAGER = new AssetManager();

//ASSET_MANAGER.queueDownload("./imgs/hero_hooded.png");
ASSET_MANAGER.queueDownload("./imgs/skeleton.png");
ASSET_MANAGER.queueDownload("./imgs/warrior.png")
ASSET_MANAGER.queueDownload("./imgs/npc-female.png")
ASSET_MANAGER.queueDownload("./imgs/woods.png");
ASSET_MANAGER.downloadAll(function () {
    var canvas = document.getElementById("gameworld");
    var context = canvas.getContext("2d");

    var gameEngine = new GameEngine();

    var warrior = new Warrior(gameEngine, new Statistics(50, 20, 10));
    //var npc = new NPC(gameEngine);
    var enemy = new Enemy(gameEngine, new Statistics(30, 15, 5));

    var battlescreen = new BattleScreen("./imgs/woods.png", gameEngine);

    battlescreen.drawBackground(context);
    gameEngine.addEntity(warrior);
    //gameEngine.addEntity(npc);
    gameEngine.addEntity(enemy);

    //gameEngine.addEntity(new Enemy(gameEngine, ASSET_MANAGER.getAsset("./imgs/skeleton.png")));
    gameEngine.init(context);
    
   // console.log(warrior.stats.health);
   // enemy.fight(warrior);
   // console.log(warrior.stats.health);
    gameEngine.start();

    
});
