var ASSET_MANAGER = new AssetManager();

//ASSET_MANAGER.queueDownload("./imgs/hero_hooded.png");
ASSET_MANAGER.queueDownload("./imgs/skeleton.png");
ASSET_MANAGER.queueDownload("./imgs/Hero-Warrior.png");
ASSET_MANAGER.queueDownload("./imgs/npc-female.png");
ASSET_MANAGER.queueDownload("./imgs/dragon_1.png");
ASSET_MANAGER.queueDownload("./imgs/woods.png");
ASSET_MANAGER.queueDownload("./imgs/desert.png");
ASSET_MANAGER.queueDownload("./imgs/tiles.png");
ASSET_MANAGER.queueDownload("./imgs/fire.png");
ASSET_MANAGER.queueDownload("./imgs/fire2.png");
ASSET_MANAGER.queueDownload("./imgs/malboro.png");
ASSET_MANAGER.queueDownload("./imgs/storekeeper.png");
ASSET_MANAGER.queueDownload("./imgs/witch.png");
ASSET_MANAGER.queueDownload("./imgs/game_over.png");
ASSET_MANAGER.queueDownload("./imgs/roomInteriorSpritesSheet.png")
ASSET_MANAGER.queueDownload("./imgs/dragoncave.png");
ASSET_MANAGER.queueDownload("./imgs/ice_cave.png");

// items
ASSET_MANAGER.queueDownload("./imgs/ghost.png");
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
ASSET_MANAGER.queueDownload("./imgs/items/stone.png");
ASSET_MANAGER.queueDownload("./imgs/items/book.png");
ASSET_MANAGER.queueDownload("./imgs/items/key.png");


ASSET_MANAGER.downloadAll(function () {
    var canvas = document.getElementById("gameworld");
    var context = canvas.getContext("2d");

    var gameEngine = new GameEngine();
    //var skeleton_sprites = ASSET_MANAGER.getAsset("./imgs/skeleton.png");
    //var malboro_sprites = ASSET_MANAGER.getAsset("./imgs/malboro.png");
    var npc_sprites = ASSET_MANAGER.getAsset("./imgs/npc-female.png");
    var storekeeper_spritesheet = ASSET_MANAGER.getAsset("./imgs/storekeeper.png");
	var ghost_spritesheet = ASSET_MANAGER.getAsset("./imgs/ghost.png");
	var witch_spritesheet = ASSET_MANAGER.getAsset("./imgs/witch.png");
	var dragon_spritesheet = ASSET_MANAGER.getAsset("./imgs/dragon_1.png");
    var warrior = new Warrior(gameEngine, new Statistics(50, 200, 200, 4, 3, 1));

    var girl_sprites = new SpriteSet(new Animation(npc_sprites, 0, 10, 64, 64, 0.25, 9, true, false),
                                            new Animation(npc_sprites, 0, 8, 64, 64, 0.25, 9, true, false),
                                            new Animation(npc_sprites, 0, 9, 64, 64, 0.25, 9, true, false),
                                            new Animation(npc_sprites, 0, 11, 64, 64, 0.25, 9, true, false),
                                            null, null, null);

    var girl_npc = new NPC(gameEngine, ["Oh! My love!! You're back from the war! *sobs heavily*",
                                        "The village has been destroyed by an evil dragon, everyone... they are gone.",
                                        "... except the store keeper. I'm not sure how he made it out alive.",
                                        "We must do something about the dragon! I saw it fly to the southeast *points determinedly*",
                                        "Revenge must be had! And once we are safe from the dragon, we can start to rebuild the village.",
                                        "And by rebuild, I mean repopulate. *wink wink*",
                                        "Oh, before you go! The healing berry bushes along the road have finally grown their berries for the season!",
                                        "You should pick a few for your journey!"], girl_sprites, [new Point(160, 200), new Point(280, 200)], .16, false, [0], "level1");

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
                                            ["Seriously, kid, go kill that dragon."],
                                            ["Wow! I didn't actually think you'd do it! Congratulations! Oh, sorry, but the store wont be open for a while yet.",
                                            "Trust me, I want this store open more than anyone around here. I'll be happy to take your money when the store is ready."]], storekeeper_sprites,
                                            [new Point(485, 207)], .1, false, [3, 4], storekeeper_quest, "level1");
										
	var ghost_sprites	= new SpriteSet(new Animation(ghost_spritesheet, 0, 0, 32, 32, 0.05, 1, true, false), 
                                        new Animation(ghost_spritesheet, 0, 3, 32, 32, 0.05, 1, true, false),
                                        new Animation(ghost_spritesheet, 0, 1, 32, 32, 0.05, 1, true, false),
                                        new Animation(ghost_spritesheet, 0, 2, 32, 32, 0.05, 1, true, false), null, null, null);
											
	var ghost_quest_potion = new SpecialItem(gameEngine, "Potion", ASSET_MANAGER.getAsset("./imgs/items/quest_potion.png"), 1, function () { });	
	var ghost_quest_reward = new SpecialItem(gameEngine, "King Arthur's Rock", ASSET_MANAGER.getAsset("./imgs/items/stone.png"), 1, function () { });	
	var ghost_quest = new RETRIEVE_ITEM_QUEST(gameEngine, "Ghost", ghost_quest_reward, ghost_quest_potion);
	var ghost = new Ghost(gameEngine, "Ghost", [["Set my soul free, Brave Warrior!", 
												"Go to Purple Witch and get me the Heaven Potion! Let my soul fly away from this Sinful World!",
												"Your bravery will be rewarded with the King Arthur's Stone!",
												"This Stone has a power to open things that nothing else can open!",
												"So, go bring the Potion and let me rest in heaven!"],
												["I am grateful for your help, Brave Warrior!"],
												["Bless your soul, Brave Warrior!"]], 
												ghost_sprites, [new Point(928, 30)], .1, false, [2, 2], ghost_quest, "level1");
	
	var witch_sprites = new SpriteSet(new Animation(witch_spritesheet, 1, 0, 32, 32, 0.05, 1, true, false), 
                                        new Animation(witch_spritesheet, 1, 3, 32, 32, 0.05, 1, true, false),
                                        new Animation(witch_spritesheet, 1, 1, 32, 32, 0.05, 1, true, false),
                                        new Animation(witch_spritesheet, 1, 2, 32, 32, 0.05, 1, true, false), null, null, null);

    var witch_quest_book = new SpecialItem(gameEngine, "Book of Spells", ASSET_MANAGER.getAsset("./imgs/items/book.png"), 1, function () { });
    var witch_quest_reward = ghost_quest_potion;
    var witch_quest = new RETRIEVE_ITEM_QUEST(gameEngine, "Witch", witch_quest_reward, witch_quest_book);
    var witch = new Witch(gameEngine, "Witch", [["The witch simply glares at you as you approach her and her home."],
                                                 ["Long Time, since I have seen Living Human Being!",
												"I know why you are here and I will give you what you want, only",
												"if you bring me the Holy Book of Spells hidden somewhere in the forest"],
												["Bring me the Holy Book of Spells, young man!"],
	                                              ["Ah yes, thank you! *cackle* If you come back to me another time, I may have a better reward for you than this."],
	                                              ["The witch seems to be back at her silent staring."]],

												witch_sprites, [new Point(864, 289)], .1, false, [1,2], witch_quest, "level1");
	
    var dragon1_NPC_sprites = new SpriteSet(new Animation(dragon_spritesheet, 0, 5, 55, 107, .1, 1, true, false), new Animation(dragon_spritesheet, 0, 5, 55, 107, .1, 1, true, false), new Animation(dragon_spritesheet, 0, 5, 55, 107, .1, 1, true, false), new Animation(dragon_spritesheet, 0, 5, 55, 107, .1, 1, true, false), null, null, null);

    var dragon1_NPC = new NPC(gameEngine, [["I have been waiting for you warrior. We have been waiting for you."], ["Now prepare to get fucked up."], ["Nigga."]], dragon1_NPC_sprites, [new Point(450, 120)], .1, false, [1], "dragon_cave");
    dragon1_NPC.setScale(1.5);
    // WHEN ADDING THE OTHER TWO HEROS (the mage and archer) ADD THEM TO SPOTS 1 and 2
    // the 3 heroes should only be in slots 0-2 in this array. Other code depends on it. 
    gameEngine.addEntity(warrior);
    //test items
    var heal_berry = new Potion(gameEngine, "Heal Berry", 10, 2, ASSET_MANAGER.getAsset("./imgs/items/heal_berry.png"), "health", 1);
    var amulet = new Armor(gameEngine, "Inherited Amulet", 130, ASSET_MANAGER.getAsset("./imgs/items/amulet1.png"), "accessory", new Statistics(0, 0, 0, 0, 0, 0));
    warrior.recieveItem(heal_berry);
    warrior.recieveItem(amulet);

    // Environments 
    // indoor game, map (array, floor then interior, animations, tilesheet, quads, interactables. 
    var house1 = new IndoorEnvironment(gameEngine, [[[1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2],
                        [2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3],
                        [3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4],
                        [4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1],
                        [1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2],
                        [2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3],
                        [3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4],
                        [4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1],
                        [1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2],
                        [2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3],
                        [3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4],
                        [4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1]],
                        [[28, 29, 30, 31, 32, 33, 34, 0, 0, 58, 59, 0, 0, 52, 52, 52, 52, 52],
                        [35, 36, 37, 38, 39, 40, 41, 0, 0, 60, 61, 0, 0, 23, 21, 21, 42, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 24, 22, 22, 43, 0],
                        [7, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 25, 0, 0, 44, 0],
                        [6, 9, 0, 0, 0, 0, 47, 47, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                        [5, 8, 0, 0, 0, 0, 26, 27, 0, 0, 66, 66, 66, 66, 66, 66, 0, 49],
                        [0, 0, 0, 0, 0, 17, 15, 16, 18, 0, 66, 62, 63, 62, 63, 66, 0, 50],
                        [12, 14, 0, 0, 0, 0, 48, 48, 0, 0, 66, 64, 65, 64, 65, 66, 0, 51],
                        [11, 13, 0, 0, 0, 0, 0, 0, 0, 0, 66, 62, 63, 62, 63, 66, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 66, 64, 65, 64, 65, 66, 0, 49],
                        [45, 0, 0, 53, 0, 0, 53, 0, 0, 0, 0, 66, 66, 66, 66, 66, 66, 0, 50],
                        [46, 0, 0, 54, 55, 54, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 51]]],
                        null, new Tilesheet("./imgs/roomInteriorSpritesSheet.png", 32, 22), [0], null, "house1");

    var house2 = new IndoorEnvironment([[[67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67],
                         [67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67],
                         [67, 67, 67, 67, 67, 67, 68, 67, 67, 67, 67, 67, 68, 67, 67, 67, 67, 67],
                         [67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 68, 67],
                         [67, 67, 67, 67, 67, 67, 68, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67],
                         [67, 67, 68, 67, 67, 67, 67, 67, 68, 67, 67, 67, 67, 67, 67, 67, 67, 67],
                         [67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 68, 67, 67, 67, 67],
                         [67, 67, 67, 67, 67, 67, 67, 68, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67],
                         [67, 67, 68, 67, 67, 67, 67, 67, 67, 67, 68, 67, 67, 67, 67, 67, 67, 67],
                         [67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 68, 67, 67, 67],
                         [68, 67, 67, 67, 68, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67],
                         [67, 67, 68, 67, 67, 67, 67, 67, 67, 68, 67, 67, 67, 67, 67, 67, 68, 68]],
                          [[88, 85, 70, 71, 70, 71, 70, 72, 88, 85, 73, 70, 71, 70, 71, 70, 88, 88],
                            [84, 87, 77, 78, 77, 78, 77, 79, 84, 83, 80, 77, 78, 77, 78, 77, 84, 84],
                            [87, 0, 0, 0, 0, 0, 0, 0, 87, 86, 0, 0, 0, 0, 86, 0, 87, 87],
                            [0, 0, 0, 83, 0, 0, 0, 0, 0, 0, 0, 0, 0, 85, 0, 0, 0, 0],
                            [85, 0, 0, 0, 69, 75, 0, 0, 0, 0, 86, 0, 0, 0, 83, 0, 86, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 85, 0, 0, 0, 0, 0, 0],
                            [0, 86, 0, 0, 83, 0, 85, 0, 0, 0, 0, 0, 0, 0, 0, 82, 0, 0],
                            [83, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 85, 0, 0, 81, 0, 85],
                            [0, 0, 0, 0, 0, 74, 0, 0, 83, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 76, 0, 0, 0, 0, 0, 0, 86, 0, 0, 0, 0, 0],
                            [0, 85, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 83, 0, 0, 0, 85, 0, 0, 0, 85, 0, 0, 0]]],
                            null, new Tilesheet("./imgs/roomInteriorSpritesSheet.png", 32, 22), [0], null, "house2");


    var dragonCave = new IndoorEnvironment(gameEngine,  
					  [[[0,   0,  0,  0, 0,  0,   0,  0,  0, 28, 28, 28, 33, 33, 33, 28, 28, 33, 28, 28,  0, 28, 28,  28,  28,  28, 33, 33, 28, 28],
                        [0,   0,  0,  0, 28, 28,  0,  0, 28, 28, 28, 33, 33, 33, 33, 33, 33, 33, 33, 28, 28, 28, 33, 28, 28, 28, 33, 33, 33, 33],

                        [28, 28, 28, 28, 28, 28, 28, 28, 28, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 28, 33, 33, 33, 33, 33, 33, 33, 33, 33],
                        [28, 28, 28, 28, 33, 33, 28, 28, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33],
                        [33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33],
                        [33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33],
                        [33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33],
                        [33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 35, 35, 35, 35, 35, 35, 35, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33],
                        [33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 35, 0, 0, 0, 0, 0, 0, 0, 35, 35, 33, 33, 33, 33, 33, 33, 33, 33, 33],
                        [33, 33, 33, 33, 33, 33, 33, 33, 33, 33,35, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 35, 33, 33, 33, 33, 33, 33, 33, 33],
                        [35, 35, 35, 35, 35, 35, 33, 33, 33, 33, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 35, 33, 33, 33, 0, 0, 33, 33],
                        [0, 0, 0, 0, 0, 0, 33, 33, 35,35, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 35, 35, 35, 0, 0, 35, 33],
						[0, 0, 0, 0, 0, 0, 35, 35, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0, 35]],


                        [[34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 11, 34, 34, 13, 17, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 16],
                        [34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 31, 12, 34, 34, 23, 34, 34, 34, 11, 34, 34, 34, 15, 34, 34, 22],
                        [34, 34, 34, 34, 34, 34, 34, 34, 34, 12, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 27, 34, 34, 34, 30, 21, 34, 34, 34],
                        [34, 34, 34, 34, 31, 27, 34, 34, 27, 34, 34, 34, 8, 6, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34],
                        [34, 34, 34, 34, 12, 34, 34, 31, 10, 34, 34, 34, 34, 7, 34, 34, 34, 34, 34, 34, 6, 34, 34, 34, 34, 34, 6, 34, 34, 26],
                        [34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 24, 34, 34, 34, 34, 7, 34, 34, 34, 34, 34, 6, 7, 34, 34, 32],
                        [34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 11, 30, 10, 12, 34, 34, 34, 34, 34, 34, 34, 34, 8, 34, 34, 34, 34],
                        [34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 31, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34],
                        [34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 12, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 16, 34, 34, 34, 34, 34, 34, 34],
                        [34, 34, 34, 34, 34, 34, 34, 34, 34, 1, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 22, 10, 34,14, 34, 13, 14, 34],
                        [34, 34, 34, 34, 34, 34, 34, 30, 2, 5, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 20, 34, 34, 20,15],
                        [34, 34, 34, 34, 34, 34, 12, 27, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 21],
                        [34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34]]],
                        null, new Tilesheet("./imgs/dragoncave.png", 32, 6), [0, 1, 2], [new Portal(0, 6, 0, gameEngine, ExitDragonCave)], "dragon_cave", "./imgs/ice_cave.png", ["Skeleton", "Malboro"]);

    var level1_animation1 = new EnvironmentAnimation(new Animation(ASSET_MANAGER.getAsset("./imgs/fire.png"), 0, 0, 32, 64, 0.5, 9, true, false), 
                            [[0, 3], [1, 3], [7, 3], [14, 3], [16, 3]], [0, 1, 3, 4]);

    var level1_animation2 = new EnvironmentAnimation(new Animation(ASSET_MANAGER.getAsset("./imgs/fire2.png"), 0, 0, 32, 32, 0.5, 4, true, false),
                              [[2, 1], [14, 1], [1, 2], [16, 2], [0, 11], [10, 12]], [0, 1, 3, 4]);

    var level1 = new OutdoorEnvironment(gameEngine, [[0, 66, 0, 0, 90, 91, 0, 0, 66, 0, 0, 94, 94, 0, 0, 66, 0, 94, 0, 0, 90, 91, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 62, 15, 0, 15, 0, 17, 3, 4, 62],
                [67, 68, 69, 94, 92, 93, 94, 67, 68, 69, 94, 95, 95, 94, 67, 68, 69, 95, 90, 91, 92, 93, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 18, 17, 18, 15, 16, 5, 6, 63],
                [70, 71, 72, 95, 90, 91, 95, 70, 71, 72, 95, 90, 91, 95, 70, 71, 72, 94, 92, 93, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 16, 15, 18, 17, 0, 62, 20],
                [73, 74, 75, 94, 92, 93, 94, 73, 74, 75, 94, 92, 93, 94, 73, 74, 75, 95, 0, 0, 0, 0, 0, 94, 28, 94, 28, 28, 0, 3, 4, 0, 0, 0, 18, 17, 18, 15, 16, 0, 0, 19],
                [76, 76, 78, 95, 90, 91, 95, 76, 78, 76, 95, 90, 91, 95, 76, 78, 76, 94, 0, 0, 0, 0, 0, 95, 29, 95, 29, 29, 0, 5, 6, 28, 28, 0, 0, 16, 1, 18, 0, 0, 3, 4],
                [77, 77, 79, 85, 92, 93, 85, 77, 79, 77, 87, 92, 93, 87, 77, 79, 77, 95, 0, 0, 0, 0, 94, 94, 117, 118, 119, 120, 3, 4, 28, 29, 29, 0, 0, 0, 2, 0, 0, 28, 5, 6],
                [0, 0, 80, 87, 86, 85, 87, 0, 80, 0, 86, 85, 87, 85, 0, 80, 0, 0, 0, 0, 94, 94, 95, 95, 121, 122, 123, 124, 5, 6, 29, 0, 0, 0, 28, 0, 0, 0, 28, 29, 62, 64],
                [7, 8, 7, 8, 7, 8, 7, 8, 7, 8, 7, 8, 7, 8, 7, 8, 7, 8, 7, 8, 95, 95, 94, 94, 125, 126, 127, 128, 0, 0, 0, 0, 3, 4, 29, 0, 0, 0, 29, 0, 3, 4],
                [9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 0, 94, 95, 95, 129, 130, 131, 132, 0, 0, 28, 62, 5, 6, 65, 0, 0, 0, 0, 0, 5, 6],
                [0, 66, 0, 104, 94, 0, 0, 94, 0, 0, 66, 0, 86, 87, 85, 86, 87, 85, 7, 8, 94, 95, 94, 3, 4, 0, 0, 0, 0, 62, 29, 62, 63, 3, 4, 0, 0, 3, 4, 0, 0, 0],
                [67, 68, 69, 94, 95, 0, 0, 95, 94, 67, 68, 69, 85, 86, 87, 85, 86, 87, 9, 10, 95, 94, 95, 5, 6, 0, 0, 0, 103, 37, 38, 3, 4, 5, 6, 0, 0, 5, 6, 3, 4, 0],
                [70, 71, 72, 95, 94, 0, 0, 94, 95, 70, 71, 72, 0, 90, 91, 94, 90, 91, 7, 8, 0, 95, 3, 4, 81, 82, 81, 82, 81, 82, 65, 5, 6, 0, 0, 0, 20, 3, 4, 5, 6, 103],
                [73, 74, 75, 94, 95, 0, 0, 95, 94, 73, 74, 75, 94, 92, 93, 95, 92, 93, 9, 10, 88, 89, 5, 6, 83, 84, 83, 84, 83, 84, 81, 82, 0, 0, 0, 64, 19, 5, 6, 65, 30, 30],
                [76, 78, 76, 95, 94, 0, 0, 0, 95, 76, 78, 76, 95, 94, 94, 90, 91, 94, 7, 8, 11, 12, 11, 12, 11, 12, 11, 12, 11, 12, 83, 84, 0, 0, 3, 4, 65, 32, 63, 32, 31, 31],
                [77, 79, 77, 0, 95, 0, 0, 0, 0, 77, 79, 77, 0, 95, 95, 92, 93, 95, 9, 10, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 81, 82, 0, 0, 5, 6, 63, 33, 30, 33, 65, 65],
                [0, 80, 0, 25, 26, 27, 0, 0, 0, 0, 80, 0, 90, 91, 133, 106, 107, 108, 0, 104, 104, 0, 3, 4, 0, 21, 22, 20, 11, 12, 83, 84, 0, 0, 81, 82, 81, 82, 31, 96, 97, 32],
                [0, 0, 0, 0, 0, 25, 26, 27, 0, 0, 0, 0, 92, 93, 109, 110, 111, 112, 0, 0, 0, 0, 5, 6, 0, 23, 24, 19, 13, 14, 104, 104, 0, 0, 83, 84, 83, 84, 65, 98, 99, 33],
                [39, 39, 40, 41, 0, 25, 26, 27, 36, 34, 36, 0, 0, 0, 113, 114, 115, 116, 0, 3, 4, 28, 20, 28, 3, 4, 0, 28, 11, 12, 11, 12, 11, 12, 11, 12, 11, 12, 11, 12, 96, 97],
                [46, 46, 47, 48, 0, 0, 42, 43, 44, 45, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 6, 29, 19, 29, 5, 6, 64, 29, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 98, 99],
                [53, 53, 40, 41, 36, 0, 49, 50, 51, 52, 0, 0, 0, 0, 0, 0, 0, 0, 0, 28, 28, 0, 65, 64, 62, 3, 4, 62, 64, 0, 0, 65, 37, 38, 104, 63, 32, 96, 97, 63, 32, 30],
                [36, 36, 47, 48, 94, 0, 54, 55, 56, 57, 0, 3, 4, 28, 28, 0, 28, 0, 65, 29, 29, 28, 0, 0, 0, 5, 6, 37, 38, 0, 0, 3, 4, 65, 65, 63, 33, 98, 99, 30, 33, 31],
                [90, 91, 36, 36, 95, 0, 58, 59, 60, 61, 0, 5, 6, 29, 29, 20, 29, 28, 64, 3, 4, 29, 37, 38, 0, 0, 0, 0, 3, 4, 0, 5, 6, 3, 4, 65, 30, 30, 65, 31, 65, 65],
                [92, 93, 90, 91, 94, 0, 0, 0, 0, 0, 0, 3, 4, 37, 38, 19, 64, 29, 20, 5, 6, 0, 0, 28, 28, 0, 28, 0, 5, 6, 0, 28, 28, 5, 6, 32, 31, 31, 32, 62, 30, 63],
                [0, 0, 92, 93, 95, 0, 0, 0, 0, 0, 0, 5, 6, 64, 37, 38, 62, 62, 19, 62, 103, 0, 0, 29, 29, 0, 29, 0, 0, 0, 0, 29, 29, 37, 38, 33, 63, 63, 33, 62, 31, 63]],
        [house1, dragonCave], [level1_animation1, level1_animation2],

       
	   new Tilesheet("./imgs/tiles.png", 32, 26), [0,1,2,3,4,5],

                [new Door(2, 6, 0, gameEngine), new Door(8, 6, 0, gameEngine), new Door(15, 6, [0, 1], gameEngine),
                new Door(1, 4, 3, gameEngine), new Door(10, 4, 3, gameEngine), new Chest(9, 12, 4, gameEngine, [new Armor(gameEngine, "Amulet of Strength", 130, ASSET_MANAGER.getAsset("./imgs/items/amulet1.png"), "accessory", new Statistics(0, 0, 0, 1, 1, 0)), 100], false),
                new Chest(5, 10, 2, gameEngine, [new Potion(gameEngine, "Heal Berry", 10, 2, ASSET_MANAGER.getAsset("./imgs/items/heal_berry.png"), "health", 1), 55], true),
                new Chest(18, 11, 2, gameEngine, [new Book(gameEngine, "Book of Spells", ASSET_MANAGER.getAsset("./imgs/items/book.png"))], false),
                new HealBerry(3, 9, 0, gameEngine),new HealBerry(9, 4, 4, gameEngine), new HealBerry(8, 4, 4, gameEngine), new HealBerry(7, 5, 5, gameEngine), new HealBerry(8, 5, 5, gameEngine),
                new HealBerry(11, 8, 5, gameEngine), new Log(12, 10, 4, gameEngine), new Portal(16, 6, 5, gameEngine, EnterDragonCave)], ["Skeleton", "Malboro"], "level1", "./imgs/woods.png");

    gameEngine.addEnvironment(level1.name, level1);
    //gameEngine.addAuxillaryEntity(mal);
    //gameEngine.addAuxillaryEntity(skeleton);
    gameEngine.addEntity(girl_npc);
    gameEngine.addEntity(storekeeper);
	gameEngine.addEntity(ghost);
	gameEngine.addEntity(witch);
	gameEngine.addEntity(dragon1_NPC);
    gameEngine.init(context);
    gameEngine.esc_menu.initHero(warrior);
    gameEngine.start();
});
