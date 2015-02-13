var ASSET_MANAGER = new AssetManager();

//ASSET_MANAGER.queueDownload("./imgs/hero_hooded.png");
ASSET_MANAGER.queueDownload("./imgs/skeleton.png");
ASSET_MANAGER.queueDownload("./imgs/warrior.png");
ASSET_MANAGER.queueDownload("./imgs/npc-female.png");
ASSET_MANAGER.queueDownload("./imgs/woods.png");
ASSET_MANAGER.queueDownload("./imgs/desert.png");
ASSET_MANAGER.queueDownload("./imgs/tiles.png");
ASSET_MANAGER.queueDownload("./imgs/fire.png");
ASSET_MANAGER.queueDownload("./imgs/fire2.png");
ASSET_MANAGER.queueDownload("./imgs/malboro.png");

ASSET_MANAGER.downloadAll(function () {
    var canvas = document.getElementById("gameworld");
    var context = canvas.getContext("2d");

    var gameEngine = new GameEngine();
    
    var skeleton_sprites = ASSET_MANAGER.getAsset("./imgs/skeleton.png");
    var malboro_sprites = ASSET_MANAGER.getAsset("./imgs/malboro.png");

    var skeleton_anims = new Animations(new Animation(skeleton_sprites, 0, 10, 64, 64, 0.05, 9, true, false), 
        new Animation(skeleton_sprites, 0, 8, 64, 64, 0.05, 9, true, false),
        new Animation(skeleton_sprites, 0, 19, 64, 64, 0.05, 13, true, false),
        new Animation(skeleton_sprites, 0, 11, 64, 64, 0.05, 9, true, false),
        new Animation(skeleton_sprites, 0, 19, 64, 64, 0.05, 13, true, false),
        new Animation(skeleton_sprites, 0, 20, 64, 64, 0.07, 5, true, false),
        new Animation(skeleton_sprites, 6, 20, 64, 64, .1, 1, true, false));

    var malboro_anims = new Animations(null, null, null, new Animation(malboro_sprites, 0, 0, 71, 91, .15, 3, true, false),
        new Animation(malboro_sprites, 0, 1, 71, 91, .12, 6, true, false),
        new Animation(malboro_sprites, 0, 2, 71, 91, .15, 3, true, false),
        new Animation(malboro_sprites, 0, 2, 71, 91, .08, 6, true, false)
        );
    var warrior = new Warrior(gameEngine, new Statistics(50, 20, 10));
    var skeleton = new Enemy(gameEngine, new Statistics(50, 15, 5), skeleton_anims);
    var npc = new NPC(gameEngine);
    var mal = new Enemy(gameEngine, new Statistics(100, 20, 10), malboro_anims, true);

    gameEngine.addEntity(warrior);
    gameEngine.addAuxillaryEntity(mal);
    gameEngine.addAuxillaryEntity(skeleton);
    gameEngine.addEntity(npc);

    gameEngine.init(context);
    
    gameEngine.start();
    
    
});
