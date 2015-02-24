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

// items
ASSET_MANAGER.queueDownload("./imgs/items/heal_berry.png");
ASSET_MANAGER.queueDownload("./imgs/items/amulet1.png");
ASSET_MANAGER.queueDownload("./imgs/items/amulet2.png");
ASSET_MANAGER.queueDownload("./imgs/items/armor1.png");
ASSET_MANAGER.queueDownload("./imgs/items/armor2.png");
ASSET_MANAGER.queueDownload("./imgs/items/leather_armor1.png");
ASSET_MANAGER.queueDownload("./imgs/items/pendant.png");
ASSET_MANAGER.queueDownload("./imgs/items/sword1.png");
ASSET_MANAGER.queueDownload("./imgs/items/shield1.png");
ASSET_MANAGER.queueDownload("./imgs/items/shield2.png");

ASSET_MANAGER.downloadAll(function () {
    var canvas = document.getElementById("gameworld");
    var context = canvas.getContext("2d");

    var gameEngine = new GameEngine();
    //var skeleton_sprites = ASSET_MANAGER.getAsset("./imgs/skeleton.png");
    //var malboro_sprites = ASSET_MANAGER.getAsset("./imgs/malboro.png");
    var npc_sprites = ASSET_MANAGER.getAsset("./imgs/npc-female.png");

    //var skeleton_anims = new SpriteSet(new Animation(skeleton_sprites, 0, 10, 64, 64, 0.05, 9, true, false), 
    //    new Animation(skeleton_sprites, 0, 8, 64, 64, 0.05, 9, true, false),
    //    new Animation(skeleton_sprites, 0, 19, 64, 64, 0.05, 13, true, false),
    //    new Animation(skeleton_sprites, 0, 11, 64, 64, 0.05, 9, true, false),
    //    new Animation(skeleton_sprites, 0, 19, 64, 64, 0.05, 13, true, false),
    //    new Animation(skeleton_sprites, 0, 20, 64, 64, 0.07, 5, true, false),
    //    new Animation(skeleton_sprites, 6, 20, 64, 64, .1, 1, true, false));

    //var malboro_anims = new SpriteSet(null, null, null, new Animation(malboro_sprites, 0, 0, 71, 91, .15, 3, true, false),
    //    new Animation(malboro_sprites, 0, 1, 71, 91, .12, 6, true, false),
    //    new Animation(malboro_sprites, 0, 2, 71, 91, .15, 3, true, false),
    //    new Animation(malboro_sprites, 0, 2, 71, 91, .08, 6, true, false)
    //    );
    var warrior = new Warrior(gameEngine, new Statistics(50, 20, 10));

    var sprites = new SpriteSet(new Animation(npc_sprites, 0, 10, 64, 64, 0.05, 9, true, false),
                                            new Animation(npc_sprites, 0, 8, 64, 64, 0.05, 9, true, false),
                                            new Animation(npc_sprites, 0, 9, 64, 64, 0.05, 9, true, false),
                                            new Animation(npc_sprites, 0, 11, 64, 64, 0.05, 9, true, false),
                                            null, null, null);
    //var skeleton = new Enemy(gameEngine, new Statistics(50, 15, 5), skeleton_anims);
    var girl_npc = new NPC(gameEngine, ["Oh! My love!! You're back from the war! *sobs heavily*",
                                        "The village has been destroyed by an evil dragon, everyone... they are gone.",
                                        "We must do something! I saw the dragon fly to the southeast *points determindly*",
                                        "Revenge must be had! And once we are safe from the dragon, we can start to rebuild the village.",
                                        "And by rebuild, I mean repopulate. *wink wink*"], sprites, [new Point(160, 200), new Point(280, 200)], false);
    //var mal = new Enemy(gameEngine, new Statistics(100, 20, 10), malboro_anims, true);

    // WHEN ADDING THE OTHER TWO HEROS (the mage and archer) ADD THEM TO SPOTS 1 and 2
        // the 3 heroes should only be in slots 0-2 in this array. Other code depends on it. 
    gameEngine.addEntity(warrior);
    var item = new Item("Amulet", 130, 1, ASSET_MANAGER.getAsset("./imgs/items/amulet1.png"), false);
    warrior.recieveItem(item);
    //gameEngine.addAuxillaryEntity(mal);
    //gameEngine.addAuxillaryEntity(skeleton);
    gameEngine.addEntity(girl_npc);

    gameEngine.init(context);
    gameEngine.esc_menu.initHero(warrior);
    gameEngine.start();
    
    
});
