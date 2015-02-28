var ASSET_MANAGER = new AssetManager();

//ASSET_MANAGER.queueDownload("./imgs/hero_hooded.png");
ASSET_MANAGER.queueDownload("./imgs/skeleton.png");
ASSET_MANAGER.queueDownload("./imgs/Hero-Warrior.png");
ASSET_MANAGER.queueDownload("./imgs/npc-female.png");
ASSET_MANAGER.queueDownload("./imgs/woods.png");
ASSET_MANAGER.queueDownload("./imgs/desert.png");
ASSET_MANAGER.queueDownload("./imgs/tiles.png");
ASSET_MANAGER.queueDownload("./imgs/fire.png");
ASSET_MANAGER.queueDownload("./imgs/fire2.png");
ASSET_MANAGER.queueDownload("./imgs/malboro.png");
ASSET_MANAGER.queueDownload("./imgs/storekeeper.png");
ASSET_MANAGER.queueDownload("./imgs/game_over.png");

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
ASSET_MANAGER.queueDownload("./imgs/items/ax.png");
ASSET_MANAGER.queueDownload("./imgs/items/quest_potion.png");


ASSET_MANAGER.downloadAll(function () {
    var canvas = document.getElementById("gameworld");
    var context = canvas.getContext("2d");

    var gameEngine = new GameEngine();
    //var skeleton_sprites = ASSET_MANAGER.getAsset("./imgs/skeleton.png");
    //var malboro_sprites = ASSET_MANAGER.getAsset("./imgs/malboro.png");
    var npc_sprites = ASSET_MANAGER.getAsset("./imgs/npc-female.png");
    var storekeeper_spritesheet = ASSET_MANAGER.getAsset("./imgs/storekeeper.png");
	var ghost_spritesheet = ASSET_MANAGER.getAsset("./imgs/ghost.png");

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
    var warrior = new Warrior(gameEngine, new Statistics(50, 200, 200, 4, 3, 1));

    var girl_sprites = new SpriteSet(new Animation(npc_sprites, 0, 10, 64, 64, 0.05, 9, true, false),
                                            new Animation(npc_sprites, 0, 8, 64, 64, 0.05, 9, true, false),
                                            new Animation(npc_sprites, 0, 9, 64, 64, 0.05, 9, true, false),
                                            new Animation(npc_sprites, 0, 11, 64, 64, 0.05, 9, true, false),
                                            null, null, null);
    //var skeleton = new Enemy(gameEngine, new Statistics(50, 15, 5), skeleton_anims);
    var girl_npc = new NPC(gameEngine, ["Oh! My love!! You're back from the war! *sobs heavily*",
                                        "The village has been destroyed by an evil dragon, everyone... they are gone.",
                                        "... except the store keeper. I'm not sure how he made it out alive.",
                                        "We must do something about the dragon! I saw it fly to the southeast *points determinedly*",
                                        "Revenge must be had! And once we are safe from the dragon, we can start to rebuild the village.",
                                        "And by rebuild, I mean repopulate. *wink wink*"], girl_sprites, [new Point(160, 200), new Point(280, 200)], .16, false, [0]);

    var storekeeper_sprites = new SpriteSet(new Animation(storekeeper_spritesheet, 1, 0, 32, 32, 0.05, 1, true, false), 
                                            new Animation(storekeeper_spritesheet, 1, 3, 32, 32, 0.05, 1, true, false),
                                            new Animation(storekeeper_spritesheet, 1, 1, 32, 32, 0.05, 1, true, false),
                                            new Animation(storekeeper_spritesheet, 1, 2, 32, 32, 0.05, 1, true, false), null, null, null);
    var sk_quest_reward = new SpecialItem(gameEngine, "Ax", ASSET_MANAGER.getAsset("./imgs/items/ax.png"), 3, function () { });
    var storekeeper_quest = new KILL_QUEST(gameEngine, "Willy", sk_quest_reward, "Skeleton", 10);
    var storekeeper = new Storekeeper(gameEngine, "Willy", [["Why hello there! It's good to see another survivor in all of this destruction.",
                                             "Unfortunately, I'm dealing with even more damage to my store with all of these skeletons running about.",
                                             "I'd pay handsomely if someone as strong looking as yourself would perhaps rid me of a few. *wink*"],
                                           ["Look kid, I'd really love to sell you some gear but those skeletons are making it impossible to keep the store open.",
                                             "You're the last person in the village I'd want to ask, but since you basically ARE the last person in the village...",
                                             "I'll have a reward for you when you're done helping me out."],
                                           ["Hey! You did a great job at reducing my skeleton problem. I can finally get to work on reparing the store!",
                                           "Why are you still standing there?",
                                           "Oh... I suppose you want that reward. Here you go; this ax has been in my family for generations! Take good care of it."],
                                           ["Hello again, kid. You've been a great help to the town so far.",
                                            "Not to brag or anything, but this town's economy relies solely on the health of this store.",
                                            "However, I cannot and will not open it back up again until that dragon is slain."],
                                            ["Seriously, kid, go kill that dragon."]], storekeeper_sprites,
                                            [new Point(485, 207)], .1, false, [3,4], storekeeper_quest);

  

										//var mal = new Enemy(gameEngine, new Statistics(100, 20, 10), malboro_anims, true);
										
	var ghost_sprites	= new SpriteSet(new Animation(ghost_spritesheet, 1, 0, 48, 32, 0.05, 1, true, false), 
                                            new Animation(ghost_spritesheet, 1, 3, 48, 32, 0.05, 1, true, false),
                                            new Animation(ghost_spritesheet, 1, 1, 48, 32, 0.05, 1, true, false),
                                            new Animation(ghost_spritesheet, 1, 2, 48, 32, 0.05, 1, true, false), null, null, null);
											
	var ghost_quest_potion = new SpecialItem(gameEngine, "Mysterious Potion", ASSET_MANAGER.getAsset("./imgs/items/quest_potion.png"), 1, function () { });	
	var ghost_quest_reward = new SpecialItem(gameEngine, "King Arthur's Rock", ASSET_MANAGER.getAsset("./imgs/items/stone.png"), 1, function () { });	
	var ghost_quest = new RETRIEVE_ITEM_QUEST(gameEngine, "Ghost", ghost_quest_reward, ghost_quest_potion);
	var ghost = new Ghost(gameEngine, "Ghost", ["Set my soul free, Brave Warrior!"], ghost_sprites, [new Point(928, 30)], .1,false, [3,4], ghost_quest);
	

    // WHEN ADDING THE OTHER TWO HEROS (the mage and archer) ADD THEM TO SPOTS 1 and 2
        // the 3 heroes should only be in slots 0-2 in this array. Other code depends on it. 
    gameEngine.addEntity(warrior);
    //test items
    var heal_berry = new Potion(gameEngine, "Heal Berry", 10, 2, ASSET_MANAGER.getAsset("./imgs/items/heal_berry.png"), "health", 1);
    var amulet = new Armor(gameEngine, "Inherited Amulet", 130, ASSET_MANAGER.getAsset("./imgs/items/amulet1.png"), "accessory", new Statistics(0, 0, 0, 0, 0, 0));
    warrior.recieveItem(heal_berry);
    warrior.recieveItem(amulet);
    //gameEngine.addAuxillaryEntity(mal);
    //gameEngine.addAuxillaryEntity(skeleton);
    gameEngine.addEntity(girl_npc);
    gameEngine.addEntity(storekeeper);
	gameEngine.addEntity(ghost);

    gameEngine.init(context);
    gameEngine.esc_menu.initHero(warrior);
    gameEngine.start();
});
