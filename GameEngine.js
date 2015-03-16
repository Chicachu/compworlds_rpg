window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (/* function */ callback, /* DOMElement */ element) {
                window.setTimeout(callback, 1000 / 60);
            };
})();

Animation = function (spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse) {
    this.spriteSheet = spriteSheet;
    this.startX = startX;
    this.startY = startY;
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
    this.frameDuration = frameDuration;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.reverse = reverse;
    this.looped = false;
    this.scaleBy = 1;
}

Animation.prototype.drawFrame = function (tick, context, x, y, scaleBy) {
    this.elapsedTime += tick;
    var scaleBy = scaleBy || 1;
    this.scaleBy = scaleBy;
    if (this.loop) {
        if (this.isDone()) {
            this.elapsedTime = 0;
            this.looped = true;
        }
    } else if (this.isDone()) {
        return;
    }
    var index = 5;
    var that = this;
    if (this.reverse) {
        index = that.frames - that.currentFrame() - 1;
    } else {
        index = that.currentFrame();
    }

    if (index === 0) {
        index = this.startX;
    }


    var locX = x;
    var locY = y;
    context.drawImage(this.spriteSheet,
                      index * this.frameWidth, this.startY * this.frameHeight,
                      this.frameWidth, this.frameHeight,
                      locX, locY,
                      this.frameWidth * scaleBy, this.frameHeight * scaleBy);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

GameEngine = function () {
    this.entities = [];
    this.context = null;
    this.width = null;
    this.height = null;
    this.timer = null;
    this.key = null;
    this.space = null;
    this.esc = null;
    this.key_i = null;
    this.curr_background = null;
    this.is_battle = false;
    this.menu = null;
    this.timerId = null;
    this.timerId2 = null;
    this.environment = ["level1", "level2","level3"];
    this.current_environment = "level1";
    this.canControl = true;
    this.animation_queue = [];
    this.event = null;
    this.auxillary_sprites = [];
    this.fight_queue = [];
    this.fiends = [];
    this.next = false; // used to detect space when advancing dialogue with NPCs.
    this.sound_manager = null;
    this.stage = null;
    this.loot_dispenser = null;
    this.quadrants = [[0, 0, 18, 12], [11, 0, 29, 12], [23, 0, 41, 12], [0, 11, 18, 23], [11, 11, 29, 23], [23, 11, 41, 23]];
    this.game_over = false;
    this.heroes = [];
    this.do_not_interrupt = false;
    this.is_boss_battle = false;
}

GameEngine.prototype.init = function (context) {
    this.context = context;
    this.width = this.context.canvas.width;
    this.height = this.context.canvas.height;
    this.timer = new Timer();
    this.startInput();
    this.menu = new BattleMenu(document.getElementById("battle_menu"), this);
    //this.menu.init();
    this.context.canvas.focus();
    this.esc_menu = new GeneralMenu(this);
    this.sound_manager = new SoundManager(this);
    // part0 = beginning until dragon is dead
    // part1 = after dragon is dead and until mountain level is complete. 
    this.stage = ["part0", "part1", "part2", "part3"]; 
    
    this.current_stage = this.stage[0];
    this.loot_dispenser = new LootDispenser(this);
    this.action_listener = null;
}

GameEngine.prototype.addEnvironment = function (name, environment_object) {
    this.environment[name] = environment_object;
}

GameEngine.prototype.startInput = function () {
    var that = this;
    if (this.action_listener) {
        this.context.canvas.removeEventListener(this.action_listener);
    }
    this.context.canvas.addEventListener("keyup", function (e) {
        if (e.which === 13 && that.game_over) {
            that.restartGame();
            e.stopImmediatePropagation();
            
        }
        e.preventDefault();
    });
    this.context.canvas.addEventListener('keydown', function startinput(e) {
        that.action_listener = startinput;
        if (that.canControl) {
            if (String.fromCharCode(e.which) === ' ') {
                that.space = true;
            } else if (e.which === 37
                        || e.which === 38
                        || e.which === 39
                        || e.which === 40) {

                that.key = e.which;
            } else if (e.which === 27) {
                that.esc_menu.showMenu(true);
                e.stopImmediatePropagation();
            } else if (e.which === 73) {
                //that.key_i = true;
                //window.setTimeout(that.entities[0].inventory.showInventory.bind(that.entities[0].inventory), 0);
                //that.entities[0].inventory.showInventory();
                that.entities[0].update(true); 
                e.stopImmediatePropagation();
            }
        }
        e.preventDefault();
        
    }, false);

    this.context.canvas.addEventListener('keyup', function (e) {
        that.key = 0;
        that.space = 0;
        that.esc = 0;
        e.preventDefault();
    }, false);

    var text_box = document.getElementById("dialogue_box");

    text_box.addEventListener("keydown", function (e) {
        if (String.fromCharCode(e.which) === ' ' && text_box.style.visibility === "visible") {
            that.next = true;
        }
        if (e.which == 9) {
            e.preventDefault();
        }
    }, false);

    text_box.addEventListener("keyup", function (e) {
        if (String.fromCharCode(e.which) === ' ' && text_box.style.visibility === "visible") {
            that.next = false;
        }
    }, false);

    this.context.canvas.addEventListener('keyup', function (e) {
        if (e.which === 80) {
            that.sound_manager.toggleSound();
            e.stopImmediatePropagation();
        }
        e.preventDefault();
    });
}

GameEngine.prototype.setWindowEvent = function (game) {
    if (game) {
        window.addEventListener("focus", function (e) {

        });
    }
}

GameEngine.prototype.setBackground = function (img) {
    this.curr_background = ASSET_MANAGER.getAsset(img);
}

GameEngine.prototype.start = function () {
    var that = this;
    (gameLoop = function () {
        that.loop();
        requestAnimationFrame(gameLoop, that.context.canvas);
    })();
}

GameEngine.prototype.addEntity = function (entity) {
    this.entities.push(entity);
}
GameEngine.prototype.removeEntity = function(entity){
	var index =  this.entities.indexOf(entity);
	
	if (index > -1) {
    this.entities.splice(index, 1);
 }
}

GameEngine.prototype.removeEntityFromAux = function (entity) {
    var index = this.auxillary_sprites.indexOf(entity);

    if (index > -1) {
        this.entities.splice(index, 1);
    }
}

GameEngine.prototype.removeEntityByName = function(entity)
{
    for(var i = 0; i < this.entities.length; i++)
    {
        if(this.entities[i].name === entity)
        {
            this.entities.splice(i, 1);
        }
    }

    for(var i = 0; i < this.auxillary_sprites.length; i++)
    {
        if (this.auxillary_sprites[i].name === entity) {
            this.auxillary_sprites.splice(i, 1);
        }
    }
}
GameEngine.prototype.clearEntities = function (save_entities) {
    if (save_entities) {
        this.auxillary_sprites = this.entities.splice(0, this.entities.length);
    }
    else {
        this.entities = [];
    }
}

GameEngine.prototype.reLoadEntities = function () {
    this.entities = this.auxillary_sprites;
    //var len = this.auxillary_sprites.length;
    //for (var i = 0; i < len; i++) {
    //    this.entities.push(this.auxillary_sprites.pop());
    //}
}
GameEngine.prototype.addAuxillaryEntity = function (entity) {
    this.auxillary_sprites.push(entity);
}

GameEngine.prototype.draw = function (drawCallBack) {
    this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
    this.context.save();
    if (this.curr_background && this.is_battle) {
        this.context.drawImage(this.curr_background, 0, 0);
    } else {
        this.environment[this.current_environment].draw();
    }
    var hero_drawn = false;
    if (this.animation_queue.length >= 1) {
        this.queueActions();
    }
    for (var i = 1; i < this.entities.length; i++) {
        if (this.entities[i].map_name === this.current_environment && !this.is_battle
            && includes(this.entities[i].quad, this.environment[this.current_environment].curr_quadrant)) {
            if (Math.abs(this.entities[0].x - (this.entities[i].x - this.entities[i].x_offset)) < 80 && !hero_drawn) {
                if (this.entities[i].y < (this.entities[0].y + this.entities[i].y_offset)) {
                    this.entities[i].draw(this.context);
                    this.entities[0].draw(this.context);
                } else {
                    this.entities[0].draw(this.context);
                    this.entities[i].draw(this.context);
                }
                var hero_drawn = true;
            } else {
                    this.entities[i].draw(this.context);                    
            }
        } else if (this.is_battle && !this.entities[i].quad) {
            this.entities[i].draw(this.context);
        }
    }
    if (!hero_drawn && this.entities[0]) {
        this.entities[0].draw(this.context);
    }
    if (drawCallBack) {
        drawCallBack(this);
    }
    this.context.restore();
}

GameEngine.prototype.queueActions = function () {
    if (this) {
        //Logic to calculate when to time the next animation event
        var event = this.event;
        //if event is null and there is an animation in the queue, set animation to the first item in the queue
        if (!event && this.animation_queue.length > 0) {
            event = this.animation_queue[0];
            if (event.entity) {
                event.entity.setAnimation(event.animation);
            }
        }
        if (event && event.entity === null) {
            if (event.wait && !event.hanging) {
                var that = this;
                var that_event = event;
                event.hanging = true;
                event.hang_timer = setTimeout(function () {
                    that_event.executeCallback();
                    if (that.animation_queue.length >= 0) {
                        that_event = that.animation_queue.shift();
                    }
                    clearInterval(that_event.hang_timer);
                }, that_event.wait);
            }
            else if (!event.hanging) {
                event.executeCallback();
                if (this.animation_queue.length >= 0) {
                    event = this.animation_queue.shift();
                }
            }
        }
        else if (event) {
            //if loop has been made, dequeue off the queue and set it to event

            //Sets the events entitiy's animation
            if (!event.hanging && event.wait) {
                var that = this;
                var that_event = event;
                event.hanging = true;
                event.hang_timer = setTimeout(function () {
                    that_event.hanging = false;
                    that_event.executeCallback();
                    clearInterval(that_event.hang_timer);
                    if (that.animation_queue.length >= 0) {
                        that_event = that.animation_queue.shift();
                        if (that_event.entity) {
                            that_event.entity.setAnimation(that_event.animation);
                            that_event.entity.curr_anim.looped = false;
                        }
                    }
                }, event.wait);
            }
            else if (!event.wait) {
                if (event.entity.curr_anim.looped) {
                    event.executeCallback();
                    if (this.animation_queue.length >= 0) {
                        event = this.animation_queue.shift();
                        if (event.entity) {
                            event.entity.setAnimation(event.animation);
                        }
                    }
                    event.entity.curr_anim.looped = false;
                }
            }
        }
    }
}
GameEngine.prototype.update = function () {
    for (var i = 0; i < this.entities.length; i++) {
        this.entities[i].update();
    }
}

GameEngine.prototype.loop = function () {
    this.clockTick = this.timer.tick();
    this.update();
    this.draw();
}

/**
Takes a game, callback function, and an array of arguments for the callback
Fades out the screen and then invokes the callback function and fadeIn
*/
GameEngine.prototype.fadeOut = function (game, args, callback) {
    var that = game;
    game.do_not_interrupt = true;
    game.canControl = false;
    that.timerId = setInterval(function () {
        that.context.globalAlpha -= .05;
        if (that.context.globalAlpha < .05) {
            that.context.globalAlpha = 0;
            clearInterval(that.timerId);
            that.fadeIn(that);
            callback(args);
        }
    }, 50);
}
/**
Only called by fadeOut, fades the screen back in
Takes a game as a parameter
*/
GameEngine.prototype.fadeIn = function (game) {
    var that = game;

    that.timerId = setInterval(function () {

        that.context.globalAlpha += .05;
        if (that.context.globalAlpha > .95) {
            that.context.globalAlpha = 1;
            clearInterval(that.timerId);
            that.canControl = true;
            that.do_not_interrupt = false;
        }
    }, 50);

}
/*
Takes the main player as a parameter. Sets up the battle by setting is_battle to true,
setting the battle background, saving coordinates, and also generating a list or random fiends for the hero
*/
GameEngine.prototype.setBattle = function (args) {
    var game = args.game;
    var battle_type = args.battle_type;
    var player = game.entities[0];
    var heroes = game.heroes;
    game.sound_manager.playSong("battle");
    game.is_battle = true;
    game.setBackground(game.environment[game.current_environment].getBattleBackground());
    player.save_x = player.x;
    player.save_y = player.y;
    player.save_direction = player.direction;

    game.clearEntities(true);
    player.x = 325;
    player.y = 200;
    
    for (var i = 0; i < heroes.length; i++)
    {
        game.addEntity(heroes[i]);
        heroes[i].direction = Direction.LEFT;
        heroes[i].changeMoveAnimation();
        heroes[i].changeLocation();
        if (heroes[i].is_dead)
        {
            heroes[i].stop_move_animation = heroes[i].animations.death;
        }
        game.animation_queue.push(new Event(heroes[i], heroes[i].stop_move_animation, 0));
    }
    if (heroes.length === 1) {
        heroes[0].y = game.height / 2;
    }
    else if (heroes.length === 2) {
        heroes[0].y = (game.height / 2) + 40;
        heroes[0].x = heroes[0].x;
        heroes[1].y = (game.height / 2) - 40;
        heroes[1].x = heroes[0].x - 20;
    }

    else if (heroes.length === 3) {
        heroes[0].y = (game.height / 2) - 60;
        heroes[0].x = heroes[0].x;
        heroes[1].y = (game.height / 2);
        heroes[1].x = heroes[0].x + 20;
        heroes[2].y = (game.height / 2) + 60;
        heroes[2].x = heroes[1].x + 20;
    }

    if (battle_type === "boss")
    {
        game.setBossBattle(game);
    }
    else if (battle_type === "normal" || !battle_type)
    {
        game.setNormalBattle(game);
    }


    window.setTimeout(game.esc_menu.showMenu(false), 500);
    window.setTimeout(game.menu.init.bind(game.menu, game), 10);
    window.setTimeout(game.menu.showMenu.bind(game.menu, true, game), 500);
}

GameEngine.prototype.setNormalBattle = function(game)
{

    game.fiends = game.environment[game.current_environment].generateFiend(game, game.fiends).splice(0);
    if (game.fiends.length === 1) {
        game.fiends[0].y = game.height / 2;
    }
    else if (game.fiends.length === 2) {
        game.fiends[0].y = (game.height / 2) - 40;
        game.fiends[0].x = game.fiends[0].x + 10;
        game.fiends[1].y = (game.height / 2) + 40;
        game.fiends[1].x = game.fiends[0].x - 20;
    }

    else if (game.fiends.length === 3) {
        game.fiends[0].y = (game.height / 2) - 60;
        game.fiends[0].x = game.fiends[0].x + 30;
        game.fiends[1].y = (game.height / 2);
        game.fiends[1].x = game.fiends[0].x - 20;
        game.fiends[2].y = (game.height / 2) + 60;
        game.fiends[2].x = game.fiends[1].x - 20;
    }
    for (var i = 0; i < game.fiends.length; i++) {
        game.addEntity(game.fiends[i]);
    }
    game.decideFighters();
}

GameEngine.prototype.setBossBattle = function(game)
{
    game.entities[0].y = 230;
    if (game.current_environment === "dragon_cave") {
        game.fiends.push(new Dragon1(game, new Statistics(150, 40, 60, 5, 10, 3)));
        game.fiends[0].y = (game.height / 3) - 140;
        game.fiends[0].x = game.fiends[0].x - 30
    }
    else if (game.current_environment === "level2")
    {
        game.fiends.push(new Siren(game, new Statistics(225, 50, 50, 0, 0, 0)));
        game.fiends[0].y = (game.height / 3);
        game.fiends[0].x = game.fiends[0].x - 30
    }
    game.is_boss_battle = true;
    game.fiends[0].init();
    game.addEntity(game.fiends[0]);
    game.decideFighters();
}
/*
    Puts ending conditions for a battle including resetting is_battle to false,
    putting the player back to original position, 
    and for now resets the players health.
*/

GameEngine.prototype.endBattle = function (game)
{
    if (this.kill_quest_complete && this.kill_quest_complete.complete)
    {

        game.alertHero("You've completed the quest");
        this.kill_quest_complete = false; 
    }
    game.is_battle = false;
    game.is_boss_battle = false;
    window.setTimeout(game.menu.showMenu.bind(game.menu, false, game), 0);
    window.setTimeout(game.esc_menu.showMenu(false), 5000);
    game.context.canvas.focus();
    game.entities[0].x = game.entities[0].save_x;
    game.entities[0].y = game.entities[0].save_y;
    game.entities[0].direction = game.entities[0].save_direction;
    game.clearEntities(false);
    game.reLoadEntities();
    game.fiends = [];
    game.fight_queue = [];
    game.animation_queue = [];
    //game.sound_manager.playSong("world1");
    if (game.current_environment === "level1" || game.current_environment === "dragon_cave") {
        game.sound_manager.playSong("world1");
    } else if (game.current_environment === "level2" || game.current_environment === "level3") {
        game.sound_manager.playSong("world2");
    } 
    game.loot_dispenser.increment();
    setTimeout(function () {
        if (game.loot_dispenser.string.length > 0) {
            game.alertHero(game.loot_dispenser.toString());
            game.loot_dispenser.dispenseLoot(game.entities[0]);
            game.sound_manager.playSound("coin");
            for (var i = 0; i < game.heroes.length; i++)
            {
                game.heroes[i].levelUp();
            }
        }
        else
        {
            game.alertHero("You got absolutely nothing!");
        }
    }, 1000);
    
}

GameEngine.prototype.gameOver = function (args) {
    var game = args.game;
    var background = args.background;
    game.game_over = true;
    game.is_boss_battle = false;
    game.setBackground(background);
    game.context.canvas.focus();
    game.canControl = false;
    game.menu.showMenu(false, game);
    game.auxillary_sprites.push(game.entities[0]);
    game.clearEntities(false);
    game.sound_manager.pauseBackground();
    window.setTimeout(game.esc_menu.showMenu(false), 5000);
}
/**
    checks if battle is over and invokes fadeOut by passing endBattle() to end the game and
    reset the hero to the world map
*/
GameEngine.prototype.fiendBattleOver = function (game) {
    var net_health_1 = 0;
    for (var i = 0 ; i < game.fiends.length; i++) {
        if (game.fiends[i]) {
            net_health_1 += game.fiends[i].stats.health;
        }
    }
    if (net_health_1 <= 0) {
        return true;
    }
    else {
        return false;
    }

}

GameEngine.prototype.heroBattleOver = function (game)
{
    var net_health_1 = 0;
    for (var i = 0 ; i < game.heroes.length; i++) {
        if (game.heroes[i]) {
            net_health_1 += game.heroes[i].stats.health;
        }
    }
    if (net_health_1 <= 0) {
        return true;
    }
    else {
        return false;
    }
}

GameEngine.prototype.decideFighters = function () {
    //var total_weight = 0;
    //var dice_roll = 0;
    //for(var i = 0; i < this.entities.length; i++)
    //{
    //    total_weight += this.entities[i];
    //}

    //for(var i = 0; i < this.entities.length; i++)
    //{
    //    this.entities[i].turn_chance = this.entities[i].turn_weight / total_weight;
    //}

    //dice_roll = Math.random();
    var fighter = 0;
    for (var i = 0; i < 100; i++) {
        fighter = i % this.entities.length;
        if (!this.entities[fighter].is_dead) {
            this.fight_queue.push(this.entities[fighter]);
        }
    }
    this.fight_queue[0].is_turn = true;
}

GameEngine.prototype.removeFighters = function (player) {
    for (var i = 0; i < this.fight_queue.length; i++) {
        if (this.fight_queue[i].id === player.id) {
            this.fight_queue.splice(i, 1);
        }
    }
    for (var i = 0; i < this.fiends.length; i++) {
        if (this.fiends[i] && this.fiends[i].id === player.id) {
            this.fiends[i].is_targeted = false;
            this.fiends.splice(i, 1);
        }
    }
}

GameEngine.prototype.setNextFighter = function (game) {
    game.fight_queue.shift();
    game.fight_queue[0].is_turn = true;
}

GameEngine.prototype.selectTarget = function () {

}

GameEngine.prototype.restartGame = function()
{
    this.reLoadEntities();
    this.entities[0].x = 15;
    this.entities[0].y = 215;
    this.environment[this.current_environment].curr_quadrant = 0;
    for (var i = 0; i < this.heroes.length; i++)
    {
        this.heroes[i].stats.health = this.heroes[i].stats.total_health;
        this.heroes[i].is_dead = false;
    }
    this.fiends = [];
    this.fight_queue = [];
    this.animation_queue = [];
    this.sound_manager.playSong("world1");
    this.is_battle = false;
    this.sound_manager.playBackground();
}

LootDispenser = function (game) {
    this.encounters = 0;
    this.game = game;
    this.accumulated_loot = [];
    this.acc_xp = 0;
    this.string = [];
    this.acc_gold = 0;
}

LootDispenser.prototype.toString = function()
{
    var str = "";
    for (var s in this.string)
    {
        str += this.string[s];
    }
    return str;
}

LootDispenser.prototype.dispenseLoot = function (hero) {
    
    if (this.encounters % 6 === 0) {
        window.setTimeout(hero.recieveItem.bind(hero, new SpecialItem(this.game, "Key", ASSET_MANAGER.getAsset("./imgs/items/key.png"), 1, function () { }, "You can open chest with this!")) , 0);
    }
    for(var i = 0; i < this.accumulated_loot.length; i ++)
    {
        window.setTimeout(hero.recieveItem.bind(hero, this.accumulated_loot[i]), 0);
    }

    var total_xp_weight = 0;
    for (var i = 0; i < this.game.heroes.length; i++) {
        total_xp_weight += this.game.heroes[i].xp_weight;
    }

    for (var i = 0; i < this.game.heroes.length; i++) {
        var xp_percentage = this.game.heroes[i].xp_weight / total_xp_weight;
        this.game.heroes[i].stats.xp += this.acc_xp * xp_percentage;
        this.game.heroes[i].xp_weight = 0;
    }

    this.accumulated_loot = [];
    this.string = [];
    this.acc_xp = 0;
    this.acc_gold = 0;
}

LootDispenser.prototype.increment = function () {
    this.encounters++;
}

LootDispenser.prototype.add = function(item)
{
    this.accumulated_loot.push(this.generateItem(item));
}

LootDispenser.prototype.generateItem = function(item)
{
    var item_string = item.string;
    this.string.length++;
    switch(item_string)
    {
        case "gold":
            var rand_gold = Math.floor(Math.random() * 11);
            this.acc_gold += rand_gold;
            this.string["gold"] = (" + " + this.acc_gold.toString() + " gold");
            return rand_gold;
            break;
        case "amulet of thick skin":
            if(!this.string["amulet of thick skin"])
            {
                this.string["amulet of thick skin"] = (" + Amulet of Thick Skin" + " x " + "1");
            }
            else
            {
                var amu_string = this.string["amulet of thick skin"];
                var amu_amount = (parseInt(amu_string.substr(amu_string.length - 1)) + 1);
                this.string["amulet of thick skin"] = (" + Amulet of Thick Skin" + " x " + amu_amount.toString());
            }
            return (new Armor(this.game, "Amulet of Thick Skin", 20, ASSET_MANAGER.getAsset("./imgs/items/amulet1.png"), "armor", new Statistics(0, 0, 2, 0, 0, 0), "Increase defense by 2"));
            break;
        case "heal berry":
            if (!this.string["heal berry"]) {
                this.string["heal berry"] = (" + Heal Berry" + " x " + "1");
            }
            else {
                var berry_string = this.string["heal berry"];
                var berry_amount = (parseInt(berry_string.substr(berry_string.length - 1)) + 1);
                this.string["amulet of thick skin"] = (" + Amulet of Thick Skin" + " x " + berry_amount.toString());
            }
            return (new Potion(this.game, "Heal Berry", 10, 1, ASSET_MANAGER.getAsset("./imgs/items/heal_berry.png"), "health", 1, "Heals your HP"));
            break;
        default:
            break;
    }
}

Timer = function () {
    this.gameTime = 0;
    this.maxStep = 0.5;
    this.lastTimeStep = 0;
}

Timer.prototype.tick = function () {
    var wallCurrent = Date.now();
    var wallDelta = (wallCurrent - this.lastTimeStep) / 1000;
    this.lastTimeStep = wallCurrent;

    var gameDelta = Math.min(wallDelta, this.maxStep);
    this.gameTime += gameDelta;
    return gameDelta;
}

var Direction = {
    UP: { value: "up", code: 38 },
    LEFT: { value: "left", code: 37 },
    DOWN: { value: "down", code: 40 },
    RIGHT: { value: "right", code: 39 }
}

/**
    Object that is stored in the queue animation. Takes an entity and one of the entities animations as a parameter
*/
Event = function (entity, animation, wait, callback, args) {
    this.entity = entity;
    this.animation = animation;
    this.wait = wait;
    this.hang_timer = null;
    this.hanging = false;
    this.callback = callback;
    this.args = args;
}

Event.prototype.executeCallback = function () {
    if (this.callback) {
        this.callback(this.args);
    }
}

/* ENTITY - Super class to the heroes, npcs, and enemies. */
Entity = function (game, x, y, spriteSheet, animations, stats) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.save_x = x;
    this.save_y = y;
    this.y_offset = 0;
    this.x_offset = 0;
    this.center_x = this.x / 2;
    this.center_y = this.y / 2;
    this.direction = Direction.DOWN;
    this.save_direction = this.direction;
    this.moving = false;
    this.spriteSheet = spriteSheet;
    this.stats = stats;
    this.curr_anim = null;
    this.is_turn = false;
    this.is_targeted = false;
    this.level = 1;
    this.is_dead = false;
    this.scale_factor = 1;
    this.kill_quest_complete = false;
    this.id = Math.random() * Math.random();
    if (animations) {
        this.animations = animations;
        this.curr_anim = this.animations.down;
        this.stop_move_animation = this.stopAnimation(this.animations.right);
    }
}


/* Changes the x and y coordinates of the entity depending on which direction they are travelling */
Entity.prototype.changeLocation = function () {
    if (this.game.key !== 0 && this.game.key !== null && !this.game.is_battle) {
        this.moving = true;
        this.changeCoordinates(.18, .18, .18, .18);
    }
    else {
        this.moving = false;
        this.stop_move_animation = this.stopAnimation(this.curr_anim);
        this.curr_anim = this.stop_move_animation;
    }
}

Entity.prototype.changeCoordinates = function (down, up, left, right) {
    switch (this.direction) {
        case Direction.DOWN:
            this.y += down;
            break;
        case Direction.UP:
            this.y -= up;
            break;
        case Direction.LEFT:
            this.x -= left;
            break;
        case Direction.RIGHT:
            this.x += right;
            break;
    }
}

/* Returns the last frame of the last animation used, this is used to show the character stopped but still in the last position of the last
    animation. */
Entity.prototype.stopAnimation = function (animation) {
    return new Animation(this.spriteSheet, animation.currentFrame(), animation.startY, animation.frameWidth, animation.frameHeight, animation.frameDuration, 1, true, false);
}

Entity.prototype.drawSelector = function (context, color) {
    context.beginPath();
    if (this.name === "dragon1") {
        context.moveTo(this.x + this.curr_anim.frameWidth, this.y + 63);
        context.lineTo(this.x + this.curr_anim.frameWidth - 10, this.y + 53);
        context.lineTo(this.x + this.curr_anim.frameWidth + 10, this.y + 53);
        context.lineTo(this.x + this.curr_anim.frameWidth, this.y + 63);
    }
    else
    {
        context.moveTo(this.x + this.curr_anim.frameWidth, this.y - 8);
        context.lineTo(this.x + this.curr_anim.frameWidth - 10, this.y - 18);
        context.lineTo(this.x + this.curr_anim.frameWidth + 10, this.y - 18);
        context.lineTo(this.x + this.curr_anim.frameWidth, this.y - 8);
    }
    context.fillStyle = color;
    context.fill();
    context.closePath();

}
Entity.prototype.drawHealthBar = function (context) {
    if (this.stats.health < 0) {
        green = 0;
    }
    else {
        var green = this.stats.health / this.stats.total_health;
    }
    context.beginPath();
    if (this.name === "dragon1") {

        context.rect(this.x + this.curr_anim.frameWidth / 3 + 15, this.y + 67, this.curr_anim.frameWidth, 5);
    }
    else {

        context.rect(this.x + this.curr_anim.frameWidth / 3 + 15, this.y - 7, this.curr_anim.frameWidth, 5);
    }
    context.fillStyle = 'red';
    context.fill();
    context.closePath();
    context.beginPath();
    if (this.name === "dragon1") {

        context.rect(this.x + this.curr_anim.frameWidth / 3 + 15, this.y + 67, this.curr_anim.frameWidth * green, 5);
    }
    else {

        context.rect(this.x + this.curr_anim.frameWidth / 3 + 15, this.y - 7, this.curr_anim.frameWidth * green, 5);
    }

    context.fillStyle = 'green';
    context.fill();
    context.closePath();
}

Entity.prototype.calculatePhysicalDamage = function(player, foe)
{   //enemydamage?
    //Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
    var max_dmg = foe.stats.attack + 2;
    var min_dmg = foe.stats.attack - 2;
    var base_damage = (Math.floor(Math.random() * (max_dmg - min_dmg + 1)) + min_dmg) - Math.ceil(player.stats.defense/10);  //original calc: foe.stats.attack - player.stats.defense;
}
Entity.prototype.doDamage = function (player, foes, game, is_multi_attack) {
    //herodamage?
    var max_atk = player.stats.attack + 5;
    var min_atk = player.stats.attack - 2;
    var damage = (Math.floor(Math.random() * (max_atk - min_atk + 1)) + min_atk) - Math.ceil(foes.stats.defense / 10);
    foes.stats.health = foes.stats.health - damage; //original calc: foes.stats.health - ((player.stats.attack - foes.stats.defense) * (Math.random() * 10));
    game.animation_queue.push(new Event(foes, foes.animations.hit));
    player.xp_weight += damage;
    if (foes.stats.health <= 0) {
        foes.stats.health = 0;
        foes.is_dead = true;

        var rand_offset = Math.floor(Math.random() * 5); // this will get a number between 1 and 99;
        rand_offset *= Math.floor(Math.random() * 2) == 1 ? 1 : -1
        game.loot_dispenser.acc_xp += foes.xp_base + rand_offset;
        // check to see if foe is one for a kill quest
        this.kill_quest_complete = this.game.entities[0].checkKillQuest(foes);
        foes.drop();

        game.removeFighters(foes);
        if (is_multi_attack) {
            game.animation_queue.push(new Event(foes, foes.animations.death, 0));
        }
        else {
            game.animation_queue.push(new Event(foes, foes.animations.death, 1000));
            if (game.fiendBattleOver(game)) {
                game.canControl = false;
                if(foes.name === "dragon1")
                {
                    setTimeout(function () { game.fadeOut(game, game, game.endBattle); }, 5000);
                    this.game.current_stage = this.game.stage[1];
                    this.game.changeDragonCave(); 
                    this.game.removeEntityByName("Dragon");

                    setTimeout(function () {
                        var siren_spritesheet = ASSET_MANAGER.getAsset("./imgs/water_elemental.png");
                        var siren_NPC_sprites = new SpriteSet(new Animation(siren_spritesheet, 10, 5, 256, 256, .1, 1, true, false), new Animation(siren_spritesheet, 10, 5, 256, 256, .1, 1, true, false), new Animation(siren_spritesheet, 10, 5, 256, 256, .1, 1, true, false), new Animation(siren_spritesheet, 10, 5, 256, 256, .1, 1, true, false), null, null, null);

                        var siren_NPC = new Boss(game, [["Whaddup nigga.", "think youre hard bitch ass nigga?", "ima fuck you up nigga."]],
                            siren_NPC_sprites, [new Point(450, 120)], .1, false, [2], "level2", "Siren");
                        siren_NPC.setScale(.3);
                    }, 10000);
                    
                }
                else {
                    setTimeout(function () { game.fadeOut(game, game, game.endBattle); }, 5000);
                }
            }
            else if(game.heroBattleOver(game))
            {
                game.canControl = false;
                setTimeout(function () { game.fadeOut(game, { game: game, background: "./imgs/game_over.png" }, game.gameOver); }, 5000);
            }
        }
    }
    else {
        if (is_multi_attack) {
            game.animation_queue.push(new Event(foes, foes.stop_move_animation, 200));
        }
        else {
            game.animation_queue.push(new Event(foes, foes.stop_move_animation, 1000));
        }

    }
    if (!is_multi_attack && !game.fiendBattleOver(game) && !game.heroBattleOver(game)) {
        game.animation_queue.push(new Event(null, null, 500, game.setNextFighter, game));
    }
}

GameEngine.prototype.changeDragonCave = function () {
    this.environment["dragon_cave"].map[1][4][29] = 34;
    this.environment["dragon_cave"].map[1][5][29] = 34;
    this.environment["dragon_cave"].map[1][5][28] = 34;
    this.environment["dragon_cave"].map[1][6][28] = 34;
    this.environment["dragon_cave"].map[1][7][28] = 34;
    this.environment["dragon_cave"].map[1][7][27] = 34;
    this.environment["dragon_cave"].map[1][8][29] = 34;
    this.environment["dragon_cave"].map[1][7][27] = 34;
    this.environment["dragon_cave"].map[1][8][28] = 34;

    //window.setTimeout(game.alertHero("The crystals blocking the secret treasure room have been destroyed!"), 5000);
}

Entity.prototype.draw = function (context) {
    // code for NPCs and Enemies. 
}

Entity.prototype.update = function () {
    // code for NPCs and Enemies.
}

Entity.prototype.drop = function()
{

}
Entity.prototype.reset = function () {

}
//Sets the current animation
Entity.prototype.setAnimation = function (anim) {
    this.curr_anim = anim;
}

// attack and defense used to determine if hero hits or gets hit
// strength is used for warrior attacks
// dexterity for rogue attacks
// intelligence for mage attacks
Statistics = function (health, attack, defense, strength, dex, intel) {
    this.health = health;
    this.total_health = health;
    this.attack = attack;
    this.total_attack = attack;
    this.defense = defense;
    this.total_defense = defense;
    this.strength = strength;
    this.dexterity = dex;
    this.intelligence = intel;
    this.xp = 0;
}

/* HERO and subclasses */
Hero = function (game, x, y, spriteSheet, animations, stats, turn_weight) {
    Entity.call(this, game, x, y, spriteSheet, animations, stats);
    this.width = 43;
    this.height = 64;
    this.sight = 35; // this is how far the hero can interact. interactables (items or npcs) must be within this range (in pixels) for the space bar to
    // pick up on any interaction. 
    this.fleeing = false;
    this.next_level_up = 100;
    
    this.draw_level_up = false;
    this.equipped = {
        armor: false,
        accessory: false,
        offhand: false,
        mainhand: false
    }
    this.xp_weight = 0;
}

Hero.prototype = new Entity();
Hero.prototype.constructor = Hero;

// returns reference to the npc or item closest to the hero.
Hero.prototype.checkForUserInteraction = function () {
    var min_distance = Math.sqrt(Math.pow(this.sight, 2) + Math.pow(this.sight, 2));
    var min_index = null;
    var array = 0;
    for (var i = 1; i < this.game.entities.length; i++) {
        var ent_x_difference = Math.abs(this.game.entities[i].x - this.x);
        var ent_y_difference = Math.abs(this.game.entities[i].y - this.y);
        var ent_distance = Math.sqrt(Math.pow(ent_x_difference, 2) + Math.pow(ent_y_difference, 2));
        if (ent_distance < min_distance && includes(this.game.entities[i].quad, this.game.environment[this.game.current_environment].curr_quadrant)
            && this.game.entities[i].map_name === this.game.environment[this.game.current_environment].name) {
            min_distance = ent_distance;
            min_index = i;
        }
    }
    for (var i = 0; i < this.game.environment[this.game.current_environment].interactables.length; i++) {
        var ent_x_difference = Math.abs((this.game.environment[this.game.current_environment].interactables[i].x) - (this.x + 5));
        var ent_y_difference = Math.abs((this.game.environment[this.game.current_environment].interactables[i].y) - (this.y + 45));
        var ent_distance = Math.sqrt(Math.pow(ent_x_difference, 2) + Math.pow(ent_y_difference, 2));
        if (this.game.environment[this.game.current_environment].interactables[i].portal && Interactable.prototype.startInteraction.call(this.game.environment[this.game.current_environment].interactables[i])
            && ent_distance < Math.sqrt(Math.pow(this.sight, 2) + Math.pow(this.sight, 2))) {
            min_distance = ent_distance;
            min_index = i;
            array = 1;
            break;
        } else if (ent_distance < min_distance && Interactable.prototype.startInteraction.call(this.game.environment[this.game.current_environment].interactables[i])) {
            min_distance = ent_distance;
            min_index = i;
            array = 1;
        }
    }
    if (array === 0) {
        return { ent: this.game.entities[min_index], reposition: true };
    } else {
        return { ent: this.game.environment[this.game.current_environment].interactables[min_index] }
    }
}
/* this.health = health;
this.total_health = health;
this.attack = attack;
this.total_attack = attack;
this.defense = defense;
this.total_defense = defense;
this.strength = strength;
this.dexterity = dex;
this.intelligence = intel;
*/
Hero.prototype.updateStats = function () {
    var keys = Object.keys(this.equipped);
    for (var i = 0; i < keys.length; i++) {
        var armor_piece = this.equipped[keys[i]];
        if (armor_piece) {
            this.stats.health += armor_piece.stats.health;
            this.stats.total_health += armor_piece.stats.total_health;
            this.stats.attack += armor_piece.stats.attack;
            this.stats.defense += armor_piece.stats.defense;
            this.stats.strength += armor_piece.stats.strength;
            this.stats.dexterity += armor_piece.stats.dexterity;
            this.stats.intelligence += armor_piece.stats.intelligence; 
        }
    }
}

/* Tells the entity what direction they should face depending on what key was pressed. */
Hero.prototype.changeDirection = function () {
    if (!this.game.is_battle) {
        if (this.game.space) {
            // code for selecting something with the space bar. I don't think this will be necessary for the prototype.
        }
        else if (this.game.key === Direction.LEFT.code) {
            this.direction = Direction.LEFT;
        } else if (this.game.key === Direction.UP.code) {
            this.direction = Direction.UP;
        } else if (this.game.key === Direction.RIGHT.code) {
            this.direction = Direction.RIGHT;
        } else if (this.game.key === Direction.DOWN.code) {
            this.direction = Direction.DOWN;
        }
    }
}

/* Tells the Entity which animation to use for the direction its moving in */
Hero.prototype.changeMoveAnimation = function () {
    switch (this.direction) {
        case Direction.DOWN:
            this.curr_anim = this.animations.down;
            break;
        case Direction.UP:
            this.curr_anim = this.animations.up;
            break;
        case Direction.LEFT:
            this.curr_anim = this.animations.left;
            break;
        case Direction.RIGHT:
            this.curr_anim = this.animations.right;
            break;
    }
}

Hero.prototype.drawLevelUp = function()
{
    this.game.context.drawImage(ASSET_MANAGER.getAsset("./imgs/level_up_icon.png"), this.x + 15, this.y - 30);
}

Hero.prototype.draw = function (context) {
    //if the game is not in battle, draw regular move animations
    if (!this.game.is_battle) {
        this.curr_anim.drawFrame(this.game.clockTick, context, this.x, this.y);
        if (this.draw_level_up) {
            this.drawLevelUp(this.game.context);
        }
    }
    else {
        this.drawHealthBar(context);
        if (this.is_turn) {
            this.drawSelector(context, 'green');
        }
        else if (this.is_targeted) {
            this.drawSelector(context, 'yellow');
        }
        
        if (this.fleeing) {
            this.direction = Direction.RIGHT;
            this.curr_anim = this.animations.right;
            if (context.canvas.width - this.curr_anim.frameWidth >= this.x) {
                this.changeCoordinates(0, 0, 0, .3);
            }
            else {
                this.fleeing = false;
                var that = this;
                if (this.game.is_battle && !this.game.do_not_interrupt) {
                    this.game.fadeOut(this.game, this.game, this.game.endBattle);
                }
            }
        }
        if (this.game.fiends.length > 0 && this.game.fiends[0].name === "dragon1") {

            this.curr_anim.drawFrame(this.game.clockTick, context, this.x, this.y);
        }
        else {
            this.curr_anim.drawFrame(this.game.clockTick, context, this.x, this.y, 1.5);
        }
    }
}

Hero.prototype.flee = function (flee) {
    this.fleeing = flee;
}
Hero.prototype.checkSurroundings = function () {
    var distance_traveled = Math.sqrt(this.x * this.x + this.y * this.y) - Math.sqrt(this.save_x * this.save_x + this.save_y * this.save_y);


    if (Math.abs(distance_traveled) > 125) {
        return Math.ceil(Math.random() * (4000 - 0) - 0) >= 100;
    }
}

Hero.prototype.update = function () {

    if (!this.game.is_battle) {
            
    this.changeDirection();
    this.changeMoveAnimation();
    this.changeLocation();
    //if ((this.game.current_environment === "level1" && this.game.environment[this.game.current_environment].curr_quadrant != 0 && this.game.environment[this.game.current_environment].curr_quadrant != 3) ||
        //    this.game.current_environment === "dragon_cave") {
    var quad = this.game.environment[this.game.current_environment].curr_quadrant;
    var hos_quad = this.game.environment[this.game.current_environment].hostile_quads;
    if(hos_quad.indexOf(quad) > -1)
        {
        this.preBattle();
    }
    this.checkBoundaries();

        if (this.game.space) {
            var interactable = this.checkForUserInteraction();
            if (interactable.ent) {
                if (interactable.reposition) {
                    this.reposition(interactable);
                }
                interactable.ent.startInteraction();
                this.game.space = false;
                this.game.key = 0;
            }
        }
    }
}

Hero.prototype.levelUp = function()
{
    if(this.stats.xp >= this.next_level_up)
    {
        var xp_diff = this.stats.xp - this.next_level_up;
        this.stats.xp = xp_diff;
        this.level++;
        this.next_level_up = 2 * (this.level * this.level) + 100;
        this.stats.attack = this.stats.attack + (.3 * (this.level * this.level) );
        this.stats.defense = this.stats.attack + (.3 * (this.level * this.level) );
        this.stats.total_health = this.stats.total_health + ( 2 * (this.level * this.level) );
        this.drawLevelUp();
        this.game.alertHero("Level up! Atk - " + this.stats.attack.toString() + " " + "Def - " + this.stats.defense.toString() + " " + "HP - " + this.stats.total_health);
        this.levelUp();
        this.draw_level_up = true;
    }
    else
    {
        return 0;
    }
}
Hero.prototype.reposition = function (other) {
    if (this.x < other.x && this.direction !== Direction.RIGHT) {
        this.direction = Direction.RIGHT;
    } else if (this.x > other.x && this.direction !== Direction.LEFT) {
        this.direction = Direction.LEFT;
    }
}

Hero.prototype.preBattle = function () {
    if (this.moving && this.checkSurroundings()) {
        this.game.canControl = false;
        this.game.key = 0;
        this.game.space = 0;
        // lock user input controls here.
        this.game.fadeOut(this.game, { game: this.game, battle_type: "normal" }, this.game.setBattle);
    }
}

Hero.prototype.changeCoordinates = function (down, up, left, right) {
    if (this.canMove(this.direction)) {
        switch (this.direction) {
            case Direction.DOWN:
                if (!this.boundaryDown()) {
                    this.y += down;
                }
                break;
            case Direction.UP:
                if (!this.boundaryUp()) {
                    this.y -= up;
                }
                break;
            case Direction.LEFT:
                if (!this.boundaryLeft()) {
                    this.x -= left;
                }
                break;
            case Direction.RIGHT:
                if (!this.boundaryRight()) {
                    this.x += right;
                }
                break;
        }
    }
}

// used for map collision detection
Hero.prototype.canMove = function (direction) {
    // default is for Direction.DOWN.
    var index_low = { x: this.x + 18, y: this.y + 62 };
    var index_high = { x: this.x + 40, y: this.y + 62 };

    // change if not default.
    switch (direction) {
        case Direction.UP:
            index_low.y = this.y + 45;
            index_high.y = this.y + 45;
            break;
        case Direction.DOWN:
            index_low.y = this.y + 67;
            index_high.y = this.y + 67;
            break;
        case Direction.LEFT:
            index_low.y = this.y + 50;
            index_high.x = this.x + 15;
            index_low.x = this.x + 15;
            break;
        case Direction.RIGHT:
            index_low.y = this.y + 50;
            index_low.x = this.x + 49;
            index_high.x = this.x + 49;
    }

    // change x and/or y according to quadrant.
    if (this.game.environment[this.game.current_environment].curr_quadrant !== 0) {
        this.changeBound(index_low);
        this.changeBound(index_high);
    }

    var x1 = Math.floor(index_low.x / 32);
    var x2 = Math.floor(index_high.x / 32);
    var y1 = Math.floor(index_low.y / 32);
    var y2 = Math.floor(index_high.y / 32);
    if (this.game.is_battle) {
        return true;
    }
    else {
        if (this.game.environment[this.game.current_environment].map.length === 2) {
            return this.isPassable(this.getTile(x1, y1, 0), index_low) && this.isPassable(this.getTile(x2, y2, 0), index_high)

            && this.isPassable(this.getTile(x1, y1, 1), index_low) && this.isPassable(this.getTile(x2, y2, 1), index_high);
        } else {
            return this.isPassable(this.getTile(x1, y1), index_low) && this.isPassable(this.getTile(x2, y2), index_high);
        }
    }
}

// changes x and/or y coordinates based on which quadrant of the map the character is in. Used for map collision detection
Hero.prototype.changeBound = function (index_object) {
    if (this.game.environment[this.game.current_environment].curr_quadrant !== 0) {
        if (this.game.environment[this.game.current_environment].curr_quadrant >= 3) {
            index_object.y += 11 * 32;
        }
        if (this.game.environment[this.game.current_environment].curr_quadrant === 1 || this.game.environment[this.game.current_environment].curr_quadrant === 4) {
            index_object.x += 11 * 32;
        } else if (this.game.environment[this.game.current_environment].curr_quadrant === 2 || this.game.environment[this.game.current_environment].curr_quadrant === 5) {
            index_object.x += 23 * 32;
        }
    }
}

GameEngine.prototype.changeXYForQuad = function (point, quad) {
    switch (quad) {
        case 1:
            point.x += 11;
            break;
        case 2:
            point.x += 23;
            break;
        case 3:
            point.y += 11;
            break;
        case 4:
            point.x += 11;
            point.y += 11;
            break;
        case 5:
            point.x += 23;
            point.y += 11;
            break;
    }
    return point;
}


// Boundary detection (for map transition)
Hero.prototype.boundaryRight = function () {
    return this.x + this.width > this.game.context.canvas.width;
}

Hero.prototype.boundaryLeft = function () {
    if (this.game.current_environment === "church") {
        return this.x + 15 < 0;
    } else {
        return this.x + 20 < 0;
    }
}

Hero.prototype.boundaryUp = function () {
    return this.y + 12 < 0;
}

Hero.prototype.boundaryDown = function () {
    return this.y + this.height > this.game.context.canvas.height;
}

Hero.prototype.checkBoundaries = function () {
    var quadrant = this.game.environment[this.game.current_environment].curr_quadrant;
    if (this.boundaryRight()) {
        if (quadrant !== 2 && quadrant !== 5) {
            this.game.environment[this.game.current_environment].setQuadrant(this.game.environment[this.game.current_environment].curr_quadrant += 1);
            if (quadrant === 1 || quadrant === 4) {
                this.x -= 12 * 32;
            } else {
                this.x -= 11 * 32;
            }
        }
    } else if (this.boundaryLeft()) {
        if (quadrant !== 0 && quadrant !== 3) {
            this.game.environment[this.game.current_environment].setQuadrant(this.game.environment[this.game.current_environment].curr_quadrant -= 1);
            if (quadrant === 2 || quadrant === 5) {
                this.x += 12 * 32;
            } else {
                this.x += 11 * 32;
            }
        }
    } else if (this.boundaryUp()) {
        if (quadrant !== 0 && quadrant !== 1 && quadrant !== 2) {
            this.game.environment[this.game.current_environment].setQuadrant(this.game.environment[this.game.current_environment].curr_quadrant -= 3);
            this.y += 11 * 32;
        }
    } else if (this.boundaryDown() && this.game.current_environment !== "dragon_cave" && this.game.current_environment !== "house1" && this.game.current_environment !== "house2"&& this.game.current_environment !== "church") {
        if (quadrant !== 3 && quadrant !== 4 && quadrant !== 5) {
            this.game.environment[this.game.current_environment].setQuadrant(this.game.environment[this.game.current_environment].curr_quadrant += 3);
            this.y -= 11 * 32;
        }
    }
}

// returns the number associated with the tile that the hero is standing on. used for collision purposes.
Hero.prototype.getTile = function (x, y, num) {
    if (this.game.environment[this.game.current_environment].map.length === 2) {
        if (y < 13) {
            return this.game.environment[this.game.current_environment].map[num][y][x];
        }

    } else {
        if (y < this.game.environment[this.game.current_environment].map.length) {
            return this.game.environment[this.game.current_environment].map[y][x];
        } else {
            console.log(y);
            return this.game.environment[this.game.current_environment].map[y - 1][x];
        }
    }
}

Hero.prototype.isPassable = function (tile, index) {
    if (this.game.current_environment === "level1" ) {
        if (tile === 0 || (tile >= 7 && tile <= 14) || tile === 80) {
            return true;
        } else if (tile === 66 || tile === 105) {
            if (index.y < 304) {
                return true;
            }
        }
    } else if (this.game.current_environment === "dragon_cave") {
        if (tile === 33 || tile === 34 || (tile >= 1 && tile <= 9)) {
            return true;
        }
    } else if (this.game.current_environment === "level2") {
        if (tile === 142 || tile === 143 || tile === 164 || tile === 165 || tile === 0 || tile === 87 || tile === 5 || tile === 350 || tile === 351 || tile === 373) {
            return true; 
        }
    } else if (this.game.current_environment === "church") {
        if (tile === 0 || (tile >= 8 && tile <= 14) || tile === 28 || tile === 29 || tile === 48 || tile === 49 || tile === 30) {
            return true; 
        }
    } else {
        return true;
    }
}

Archer = function(game, stats)
{
    this.game = game;
    this.spriteSheet = ASSET_MANAGER.getAsset("./imgs/archer.png");
    this.animations = {
        down: new Animation(this.spriteSheet, 0, 10, 64, 64, 0.05, 9, true, false),
        up: new Animation(this.spriteSheet, 0, 8, 64, 64, 0.05, 9, true, false),
        left: new Animation(this.spriteSheet, 0, 9, 64, 64, 0.05, 9, true, false),
        right: new Animation(this.spriteSheet, 0, 11, 64, 64, 0.05, 9, true, false),
        destroy: new Animation(this.spriteSheet, 0, 17, 64, 64, 0.05, 12, true, false),
        hit: new Animation(this.spriteSheet, 0, 20, 64, 64, 0.08, 5, true, false),
        special: new Animation(this.spriteSheet, 0, 17, 64, 64, 0.05, 12, true, false),
        death: new Animation(this.spriteSheet, 0, 21, 64, 64, 0.5, 1, true, false)
    };
    this.x = 10;
    this.y = 215;

    Hero.call(this, this.game, this.x, this.y, this.spriteSheet, this.animations, stats);
}

Archer.prototype = new Hero();
Archer.prototype.constructor = Archer;

Archer.prototype.draw = function (context) {
    Hero.prototype.draw.call(this, context);
}

Archer.prototype.update = function () {
    Hero.prototype.update.call(this);
}

Archer.prototype.setAction = function (action, target) {
    var that = this;
    switch (action) {
        case "Single":
            this.game.animation_queue.push(new Event(this, this.animations.destroy));
            this.game.animation_queue.push(new Event(this, this.stop_move_animation));
            that.doDamage(that, target[0], that.game, false);
            break;
        case "Sweep":
            this.game.animation_queue.push(new Event(this, this.animations.destroy));
            this.game.animation_queue.push(new Event(this, this.stop_move_animation));
            var last_index = 0;
            var len = target.length;
            for (var i = 0; i < len; i++) {
                if (target.length < len) {
                    len = target.length;
                    i--;
                }
                if (target[i]) {
                    if (i === target.length - 1 || !target[target.length - 1]) {
                        that.doDamage(that, target[i], that.game, false);
                    }
                    else {
                        that.doDamage(that, target[i], that.game, true);
                    }
                }
                else {
                    //this.game.setNextFighter(this.game);
                }
            }
            break;
        default:
            break;
    }
    this.is_turn = false;
}

Mage = function (game, stats) {
    this.game = game;
    this.spriteSheet = ASSET_MANAGER.getAsset("./imgs/mage.png");
    this.animations = {
        down: new Animation(this.spriteSheet, 0, 10, 64, 64, 0.05, 9, true, false),
        up: new Animation(this.spriteSheet, 0, 8, 64, 64, 0.05, 9, true, false),
        left: new Animation(this.spriteSheet, 0, 9, 64, 64, 0.05, 9, true, false),
        right: new Animation(this.spriteSheet, 0, 11, 64, 64, 0.05, 9, true, false),
        destroy: new Animation(this.spriteSheet, 0, 3, 64, 64, 0.05, 12, true, false),
        hit: new Animation(this.spriteSheet, 0, 20, 64, 64, 0.08, 5, true, false),
        special: new Animation(this.spriteSheet, 0, 17, 64, 64, 0.05, 12, true, false),
        death: new Animation(this.spriteSheet, 0, 21, 64, 64, 0.5, 1, true, false)
    };
    this.x = 10;
    this.y = 215;

    Hero.call(this, this.game, this.x, this.y, this.spriteSheet, this.animations, stats);
}

Mage.prototype = new Hero();
Mage.prototype.constructor = Mage;

Mage.prototype.draw = function (context) {
    Hero.prototype.draw.call(this, context);
}

Mage.prototype.update = function () {
    Hero.prototype.update.call(this);
}

Mage.prototype.setAction = function (action, target) {
    var that = this;
    switch (action) {
        case "Single":
            this.game.animation_queue.push(new Event(this, this.animations.destroy));
            this.game.animation_queue.push(new Event(this, this.stop_move_animation));
            that.doDamage(that, target[0], that.game, false);
            break;
        case "Sweep":
            this.game.animation_queue.push(new Event(this, this.animations.destroy));
            this.game.animation_queue.push(new Event(this, this.stop_move_animation));
            var last_index = 0;
            var len = target.length;
            for (var i = 0; i < len; i++) {
                if (target.length < len) {
                    len = target.length;
                    i--;
                }
                if (target[i]) {
                    if (i === target.length - 1 || !target[target.length - 1]) {
                        that.doDamage(that, target[i], that.game, false);
                    }
                    else {
                        that.doDamage(that, target[i], that.game, true);
                    }
                }
                else {
                    //this.game.setNextFighter(this.game);
                }
            }
            break;
        default:
            break;
    }
    this.is_turn = false;
}

Warrior = function (game, stats) {
    this.game = game;
    this.spriteSheet = ASSET_MANAGER.getAsset("./imgs/Hero-Warrior.png");
    this.animations = {
        down: new Animation(this.spriteSheet, 0, 10, 64, 64, 0.05, 9, true, false),
        up: new Animation(this.spriteSheet, 0, 8, 64, 64, 0.05, 9, true, false),
        left: new Animation(this.spriteSheet, 0, 9, 64, 64, 0.05, 9, true, false),
        right: new Animation(this.spriteSheet, 0, 11, 64, 64, 0.05, 9, true, false),
        destroy: new Animation(this.spriteSheet, 0, 17, 64, 64, 0.05, 12, true, false),
        hit: new Animation(this.spriteSheet, 0, 20, 64, 64, 0.08, 5, true, false),
        special: new Animation(this.spriteSheet, 0, 17, 64, 64, 0.05, 12, true, false),
        death: new Animation(this.spriteSheet, 0, 21, 64, 64, 0.5, 1, true, false)
    };


    this.x = 320;
    this.y = 208;

    this.quests = [];
    this.abilities = ["Slash", "Sweep"];

    this.inventory = new Inventory(this.game, 100, 20);
    Hero.call(this, this.game, this.x, this.y, this.spriteSheet, this.animations, stats);
}

Warrior.prototype = new Hero();
Warrior.prototype.constructor = Warrior;

Warrior.prototype.draw = function (context) {
    Hero.prototype.draw.call(this, context);
}

Warrior.prototype.update = function (called) {
    Hero.prototype.update.call(this);
    var that = this;
    if (called) {
        window.setTimeout(that.inventory.showInventory(that.inventory), 0);
    }
}


Warrior.prototype.addQuest = function (quest) {
    this.quests.push(quest);
    var that = this.game;
    window.setTimeout(that.alertHero("You have started a new quest!"), 5000);
}

Warrior.prototype.checkKillQuest = function (enemy) {
    var complete = false; 
    for (var i = 0; i < this.quests.length; i++) {
        if (this.quests[i].type === "kill" && this.quests[i].enemy_to_kill === enemy.name) {
            this.quests[i].enemies_killed++;
            if (this.quests[i].enemies_killed >= this.quests[i].number_enemies && !this.quests[i].complete) {
                this.quests[i].complete = true;
                complete = this.quest[i]; 
            }
        }
    }
    return complete; 
}

Warrior.prototype.checkItemQuest = function (item) {
    for (var i = 0; i < this.quests.length; i++) {
        if (this.quests[i].type === "item" && this.quests[i].item === item) {
            this.quests[i].item_found = true;
            this.quests[i].complete = true;
        }
    }
}

Warrior.prototype.setAction = function (action, target) {
    var that = this;
    switch (action) {
        case "Single":
            this.game.animation_queue.push(new Event(this, this.animations.destroy));
            this.game.animation_queue.push(new Event(this, this.stop_move_animation));
            that.doDamage(that, target[0], that.game, false);
            break;
        case "Sweep":
            this.game.animation_queue.push(new Event(this, this.animations.destroy));
            this.game.animation_queue.push(new Event(this, this.stop_move_animation));
            var last_index = 0;
            var len = target.length;
            for (var i = 0; i < len; i++) {
                if (target.length < len) {
                    len = target.length;
                    i--;
                }
                if (target[i]) {
                    if (i === target.length - 1 || !target[target.length - 1]) {
                        that.doDamage(that, target[i], that.game, false);
                    }
                    else {
                        that.doDamage(that, target[i], that.game, true);
                    }
                }
                else {
                    //this.game.setNextFighter(this.game);
                }
            }
            break;
        default:
            break;
    }
    this.is_turn = false;
}

/* ENEMY and subclasses */
Enemy = function (game, stats, anims, spriteSheet, name, loop_while_standing, loot_table) {
    this.x = 40;
    this.y = 150;
    this.loop_while_standing = loop_while_standing;
    Entity.call(this, game, this.x, this.y, spriteSheet, anims, stats);
    this.loot_table = loot_table;
    this.game = game;
    this.name = name;
}

Enemy.prototype = new Entity();
Enemy.prototype.constructor = Enemy;

Enemy.prototype.init = function () {
    if (!this.loop_while_standing) {
        this.stop_move_animation = this.stopAnimation(this.animations.right);
    }
    else {
        this.stop_move_animation = this.animations.right;
    }
    this.direction = Direction.RIGHT;
    this.curr_anim = this.stop_move_animation;
}
Enemy.prototype.draw = function (context) {
    this.drawHealthBar(context);
    if (this.is_targeted) {
        this.drawSelector(context, 'yellow');

    }
    //if (this.name === "dragon1") {

            
    //}

    //else
    //{
        this.curr_anim.drawFrame(this.game.clockTick, context, this.x, this.y, 1.5);
    //}
}

Enemy.prototype.update = function () {
    if (this.game.fight_queue[0].id === this.id && this.is_turn) {
        var target = Math.floor(Math.random() * (this.game.heroes.length));
        var place_holder = target;
        while (this.game.heroes[target].is_dead)
        {
            target++;
            if (target >= this.game.heroes.length)
            {
                target = 0;
            }

            if(target === place_holder)
            {
                break;
            }
        }
        this.setAction("Single", this.game.heroes[target]);
        this.is_turn = false;
    }
}

Enemy.prototype.hit = function () {

}

Enemy.prototype.drop = function()
{
    if(this.loot_table)
    {
        var result = 0;
        var total = 0;
        var rand = Math.floor(Math.random() * (100));
        for(result = 0; result < this.loot_table.length; result++)
        {
            total += this.loot_table[result].weight;
            if(total >= rand)
            {
                break;
            }
        }
        this.game.loot_dispenser.add(this.loot_table[result]);
    }
}

Enemy.prototype.setAction = function (action, target) {
    switch (action) {
        case "Single":
            this.game.animation_queue.push(new Event(this, this.animations.destroy));
            this.game.animation_queue.push(new Event(this, this.stop_move_animation));
            this.doDamage(this, target, this.game, false);
            break;
        default:
            break;
    }
}

Siren = function (game, stats, loop_while_standing) {
    this.game = game;
    this.spriteSheet = ASSET_MANAGER.getAsset("./imgs/water_elemental.png");
    this.xp_base = 100;
    this.animations =
        {
            down: null,
            up: null,
            left: null,
            right: new Animation(this.spriteSheet, 7, 1, 256, 256, .1, 4, true, false),
            destroy: new Animation(this.spriteSheet, 5, 1, 256, 256, .1, 6, true, false),
            hit: new Animation(this.spriteSheet, 3, 5, 256, 256, .1, 6, true, false),
            death: new Animation(this.spriteSheet, 5, 5, 256, 256, .1, 1, true, false)
        };
    this.loot_table =
        [
            ({ string: "gold", weight: 100 })
        ];
    Enemy.call(this, this.game, stats, this.animations, this.spriteSheet, "Siren", false, this.loot_table);
    this.scale_factor = .7;
}

Siren.prototype = new Enemy();
Siren.prototype.constructor = Siren;

Siren.prototype.draw = function(context)
{
    this.drawHealthBar(context);
    if (this.is_targeted) {
        this.drawSelector(context, 'yellow');
    }
    this.curr_anim.drawFrame(this.game.clockTick, context, this.x, this.y, this.scale_factor);
}

Siren.prototype.drawHealthBar = function(context)
{
    if (this.stats.health < 0) {
        green = 0;
    }
    else {
        var green = this.stats.health / this.stats.total_health;
    }
    context.beginPath();
    context.rect(this.x + this.curr_anim.frameWidth / 3 - 30, this.y / this.scale_factor - 60, this.curr_anim.frameWidth * this.scale_factor - 40, 5);
    context.fillStyle = 'red';
    context.fill();
    context.closePath();
    context.beginPath();
    context.rect((this.x + this.curr_anim.frameWidth / 3) - 30, this.y / this.scale_factor - 60, (this.curr_anim.frameWidth * green) * this.scale_factor - 40, 5);
    context.fillStyle = 'green';
    context.fill();
    context.closePath();
}

Siren.prototype.drawSelector = function (context, color) {
    context.beginPath();
    context.moveTo((this.x + this.curr_anim.frameWidth) * this.scale_factor - 50, this.y / this.scale_factor - 70);
    context.lineTo(((this.x + this.curr_anim.frameWidth) - 10) * this.scale_factor - 50, this.y / this.scale_factor - 80);
    context.lineTo(((this.x + this.curr_anim.frameWidth) + 10) * this.scale_factor - 50, this.y / this.scale_factor - 80);
    context.lineTo((this.x + this.curr_anim.frameWidth) * this.scale_factor - 50, this.y / this.scale_factor - 70);
    context.fillStyle = color;
    context.fill();
    context.closePath();
}
WolfRider = function(game, stats, loop_while_standing)
{
    this.game = game;
    this.spriteSheet = ASSET_MANAGER.getAsset("./imgs/wolf_rider.png");
    this.xp_base = 25;
    this.animations = {
        down: null,
        up: null,
        left: null,
        right: new Animation(this.spriteSheet, 0, 0, 138.75, 128.15, .1, 1, true, false),
        destroy: new Animation(this.spriteSheet, 0, 3, 138.75, 128.15, .1, 6, true, false),
        hit: new Animation(this.spriteSheet, 0, 7, 138.75, 128.15, .07, 6, true, false),
        death: new Animation(this.spriteSheet, 5, 7, 138.75, 128.15, .1, 1, true, false)
    }
    this.loot_table =
        [
            ({ string: "gold", weight: 50 }),
            ({ string: "heal berry", weight: 50 })
        ];
    Enemy.call(this, this.game, stats, this.animations, this.spriteSheet, "WolfRider", false, this.loot_table);
}

WolfRider.prototype = new Enemy();
WolfRider.prototype.constructor = WolfRider;

DireWolf = function(game, stats, loop_while_standing)
{
    this.game = game;
    this.spriteSheet = ASSET_MANAGER.getAsset("./imgs/wolf1.png");
    this.xp_base = 15;
    this.animations = {
        down: null,
        up: null,
        left: null,
        right: new Animation(this.spriteSheet, 0, 5, 103, 104, 0.07, 6, true, false),
        destroy: new Animation(this.spriteSheet, 0, 1, 117, 104, 0.08, 5, true, false),
        hit: new Animation(this.spriteSheet, 0, 6, 104, 104, 0.08, 7, true, false),
        death: new Animation(this.spriteSheet, 6, 6, 104, 104, 0.1, 1, true, false)
    };
    this.loot_table =
        [
            ({ string: "gold", weight: 80 }),
            ({ string: "heal berry", weight: 20 })
        ];
    Enemy.call(this, this.game, stats, this.animations, this.spriteSheet, "DireWolf", false, this.loot_table);
}

DireWolf.prototype = new Enemy();
DireWolf.prototype.constructor = DireWolf;

Skeleton = function (game, stats, loop_while_standing) {
    this.game = game;
    this.spriteSheet = ASSET_MANAGER.getAsset("./imgs/skeleton.png");
    this.xp_base = 10;
    this.animations = {
        down: new Animation(this.spriteSheet, 0, 10, 64, 64, 0.05, 9, true, false),
        up: new Animation(this.spriteSheet, 0, 8, 64, 64, 0.05, 9, true, false),
        left: new Animation(this.spriteSheet, 0, 9, 64, 64, 0.05, 9, true, false),
        right: new Animation(this.spriteSheet, 0, 11, 64, 64, 0.05, 9, true, false),
        destroy: new Animation(this.spriteSheet, 0, 3, 64, 64, 0.1, 7, true, false),
        hit: new Animation(this.spriteSheet, 0, 20, 64, 64, 0.08, 5, true, false),
        death: new Animation(this.spriteSheet, 0, 21, 64, 64, 0.5, 1, true, false)
    };
    this.loot_table =
        [
            ({ string: "gold", weight: 80 }),
            ({ string: "heal berry", weight: 20 })
        ];
    Enemy.call(this, this.game, stats, this.animations, this.spriteSheet, "Skeleton", false, this.loot_table);
}

Skeleton.prototype = new Enemy();
Skeleton.prototype.constructor = Skeleton;



Malboro = function(game, stats, loop_while_standing)
{
    this.game = game;
    this.spriteSheet = ASSET_MANAGER.getAsset("./imgs/malboro.png");
    this.xp_base = 15;
    this.animations = {
        down: null,
        up: null,
        left: null,
        right: new Animation(this.spriteSheet, 0, 0, 82, 91, 0.05, 3, true, false),
        destroy: new Animation(this.spriteSheet, 0, 1, 82, 91, 0.1, 7, true, false),
        hit: new Animation(this.spriteSheet, 0, 2, 82, 91, 0.1, 3, true, false),
        death: new Animation(this.spriteSheet, 0, 3, 82, 91, 0.1, 1, true, false)
    };
    this.loot_table = [
        ({ string: "gold", weight: 0 }),
        ({ string: "heal berry", weight: 0 }),
        ({ string: "amulet of thick skin", weight: 100 })
    ];
    Enemy.call(this, this.game, stats, this.animations, this.spriteSheet, "Malboro", false, this.loot_table);
}

Malboro.prototype = new Enemy();
Malboro.prototype.constructor = Malboro;

Ogre = function (game, stats, loop_while_standing) {
    this.game = game;
    this.spriteSheet = ASSET_MANAGER.getAsset("./imgs/ogre.png");
    this.xp_base = 20;
    this.animations = {
        down: null,
        up: null,
        left: null,
        right: new Animation(this.spriteSheet, 0, 0, 100, 100, 0.07, 19, true, false),
        destroy: new Animation(this.spriteSheet, 0, 0, 100, 100, 0.071, 19, true, false),
        hit: new Animation(this.spriteSheet, 0, 1, 100, 100, 0.15, 5, true, false),
        death: new Animation(this.spriteSheet, 0, 2, 100, 100, 0.1, 1, true, false)
    };
    this.loot_table = [
        ({ string: "gold", weight: 0 }),
        ({ string: "heal berry", weight: 0 }),
        ({ string: "amulet of thick skin", weight: 100 })
    ];
    Enemy.call(this, this.game, stats, this.animations, this.spriteSheet, "ogre", false, this.loot_table);
}

Ogre.prototype = new Enemy();
Ogre.prototype.constructor = Ogre;

Dragon1 = function(game, stats, loop_while_standing)
{
    this.game = game;
    this.spriteSheet = ASSET_MANAGER.getAsset("./imgs/dragon_1.png");
    this.loop_while_standing = loop_while_standing;

    this.animations = {
        down: null,
        up: null,
        left: null,
        right: new Animation(this.spriteSheet, 0, 0, 104.5, 107, .1, 8, true, false),
        destroy: new Animation(this.spriteSheet, 0, 1, 210, 107, .13, 12, true, false),
        hit: new Animation(this.spriteSheet, 0, 2, 90.16, 107, .1, 18, true, false),
        death: new Animation(this.spriteSheet, 0, 4, 64.3, 107, .1, 1, true, false),
        rest: new Animation(this.spriteSheet, 0, 3, 64.3, 107, .13, 7, true, false)
    };

    this.loot_table = [
        ({ string: "gold", weight: 100 }),
        ({ string: "heal berry", weight: 0 })
    ];

    Enemy.call(this, this.game, stats, this.animations, this.spriteSheet, "dragon1", true);
}

Dragon1.prototype = new Enemy();
Dragon1.prototype.constructor = Dragon1;

Dragon1.prototype.draw = function (context) {
    this.drawHealthBar(context);
    if (this.is_targeted) {
        this.drawSelector(context, 'yellow');
    }
    this.curr_anim.drawFrame(this.game.clockTick, context, this.x, this.y, 3);
}

Dragon1.prototype.drawHealthBar = function(context)
{
    if (this.stats.health < 0) {
        green = 0;
    }
    else {
        var green = this.stats.health / this.stats.total_health;
    }
    context.beginPath();
    context.rect(this.x + this.curr_anim.frameWidth / 3 + 15, this.y + 67, this.curr_anim.frameWidth, 5);
    context.fillStyle = 'red';
    context.fill();
    context.closePath();
    context.beginPath();
    context.rect(this.x + this.curr_anim.frameWidth / 3 + 15, this.y + 67, this.curr_anim.frameWidth * green, 5);
    context.fillStyle = 'green';
    context.fill();
    context.closePath();
}
/* NPC 
game : the game engine
dialogue : array of strings which will be used as the NPC's dialogue
anims : a SpriteSet object with the characters full set of animations
path : an array of Points which will determine the path that the NPC will take. pass in one point for the NPC to stand still
pause : whether the NPC will rest for 1 second once it reaches one of its points*/
NPC = function (game, dialogue, anims, path, speed, pause, quad, map_name, scale, yoffset) {
    if (game && dialogue && anims && path) {
        this.game = game;
        this.scale = (scale || 1);
        this.map_name = map_name; 
        this.animations = anims;
        this.spriteSheet = this.animations.right.spriteSheet;

        //next variables for the npc's path
        this.path = path;
        this.part = 0;
        this.speed = speed;
        this.pause = pause;
        this.next_point = null;
        this.pause_timer = null;
        this.x = this.path[0].getX();
        this.y = this.path[0].getY();
        this.path.push(this.path.shift());

        Entity.call(this, game, this.x, this.y, this.spriteSheet, this.animations);

        // next few variables used for NPC interaction and dialogue. 
        this.interacting = false;
        this.dialogue = dialogue;
        this.dialogue_index = 0;
        this.setNextCoords();
        this.quad = quad;

        if (yoffset) {
            this.y_offset = yoffset; 
        }
    }
}


NPC.prototype = new Entity();
NPC.prototype.constructor = NPC;

NPC.prototype.setNextCoords = function () {
    this.next_point = this.path.shift();
    this.path.push(this.next_point);
}
NPC.prototype.draw = function (context) {
    // only draw if NPC is in the current quadrant on the map
    var found = false;
    for (var i = 0; i < this.quad.length; i++) {
        if (this.game.environment[this.game.current_environment].curr_quadrant === this.quad[i]) {
            found = true;
        }
    }
    if (found) {
        this.curr_anim.drawFrame(this.game.clockTick, context, this.x, this.y, this.scale);
    }
}

NPC.prototype.setScale = function(scale)
{
    this.scale = scale;
}
NPC.prototype.update = function () {
    // only update if NPC is in the current quadrant on the map
    var found = false;
    for (var i = 0; i < this.quad.length; i++) {
        if (this.game.environment[this.game.current_environment].curr_quadrant === this.quad[i]) {
            found = true;
        }
    }

    if (found) {
        if (!this.interacting) {
            if (this.next_point.getX() > this.x) {
                this.curr_anim = this.animations.right;
                this.direction = Direction.RIGHT;
                if (this.next_point.getX() - this.x < this.speed) {
                    this.x = this.next_point.getX();
                }
                else {
                    this.changeCoordinates(0, 0, 0, this.speed);
                }
            }
            else if (this.next_point.getX() < this.x) {
                this.curr_anim = this.animations.left;
                this.direction = Direction.LEFT;
                if (this.x - this.next_point.getX() < this.speed) {
                    this.x = this.next_point.getX();
                }
                else {
                    this.changeCoordinates(0, 0, this.speed, 0);
                }
            }
            else if (this.next_point.getY() > this.y) {
                this.curr_anim = this.animations.down;
                this.direction = Direction.DOWN;
                if (this.next_point.getY() - this.y < this.speed) {
                    this.y = this.next_point.getY();
                }
                else {
                    this.changeCoordinates(this.speed, 0, 0, 0);
                }
            }
            else if (this.next_point.getY() < this.y) {
                this.curr_anim = this.animations.up;
                this.direction = Direction.UP;
                //if (this.y - this.next_point.getY() < this.speed) {
                    this.changeCoordinates(0, this.speed, 0, 0);
                //}
            }
            else {
                if (this.pause) {
                    var that = this;
                    this.curr_anim = this.stopAnimation(this.curr_anim);
                    setTimeout(function () {
                        that.setNextCoords();
                        that.hanging = false;
                    }, 1000);
                }
                else {
                    this.setNextCoords();
                }

            }
        }
        else {
            this.curr_anim = this.stopAnimation(this.curr_anim);
            this.updateDialogue();
        }
    }
}

GameEngine.prototype.alertHero = function (dialogue) {
    var text_box = document.getElementById("dialogue_box");
    var text = document.createElement('p');
    text.innerHTML = dialogue;
    text_box.innerHTML = text.outerHTML;
    text_box.style.visibility = "visible";
    text_box.style.display = "block";
    this.context.canvas.tabIndex = 0;
    text_box.tabIndex = 1;
    var that = this;
    text_box.addEventListener("keydown", function _func(e) {
        if (String.fromCharCode(e.which) === ' ') {
            this.style.visibility = "hidden";
            this.style.display = "none";
            this.tabIndex = 0;
            that.context.canvas.tabIndex = 1;
            that.context.canvas.focus();
            that.canControl = true;
            that.next = false;
            text_box.removeEventListener("keydown", _func);
            if(that.entities[0].draw_level_up)
            {
                that.entities[0].draw_level_up = false;
            }
        }
        e.preventDefault();
    }, false);
    text_box.focus();
    this.interacting = true;
    this.canControl = false;
}

NPC.prototype.updateDialogue = function () {
    if (this.game) {
        if (this.game.next === true) {
            var text_box = document.getElementById("dialogue_box");
            var text = document.createElement('p');
            if (this.dialogue_index < this.dialogue[this.part].length - 1) {
                this.dialogue_index++;
                text.innerHTML = this.dialogue[this.part][this.dialogue_index];
                text_box.innerHTML = text.outerHTML;
            } else {

                if (this.game.current_environment === "dragon_cave") {
                    var mage_hero = new Mage(this.game, new Statistics(200, 160, 25, 1, 1, 5));
                    this.game.heroes.push(mage_hero);
                    this.x = 3098204981238;
                    this.y = 384923784928374;
                } else if (this.part === 0) {
                    this.part++;
                }
                this.dialogue_index = 0;
                text_box.style.visibility = "hidden";
                text_box.style.display = "none";
                text_box.tabIndex = 2;
                this.game.context.canvas.tabIndex = 1;
                this.game.context.canvas.focus();
                this.game.canControl = true;
                this.interacting = false;
                if (this.game.current_environment === "dragon_cave") {
                    this.game.alertHero("Acele has joined your party!");
                }
            }
            this.game.next = false;
        }
    }
}


// loops through dialogue for the given NPC.
NPC.prototype.startInteraction = function () {
    // only update if NPC is in the current quadrant on the map
    var found = false;
    for (var i = 0; i < this.quad.length; i++) {
        if (this.game.environment[this.game.current_environment].curr_quadrant === this.quad[i]) {
            found = true;
        }
    }
    if (found) {
        this.reposition();
        var text_box = document.getElementById("dialogue_box");

        var text = document.createElement('p'); 
        text.innerHTML = this.dialogue[this.part][this.dialogue_index];
        text_box.innerHTML = text.outerHTML;
        text_box.style.visibility = "visible";
        text_box.style.display = "block";   
        this.game.context.canvas.tabIndex = 0;
        text_box.tabIndex = 1;
        text_box.focus();
        this.interacting = true;
        this.game.canControl = false;

        // test to see if item menu works after receiving in game play
        //var amulet = new Armor(this.game, "Inherited Amulet", 130, ASSET_MANAGER.getAsset("./imgs/items/amulet1.png"), "accessory", new Statistics(0, 0, 0, 0, 0, 0));
        //this.game.entities[0].recieveItem(amulet);
 
    }
}

NPC.prototype.reposition = function () {
    if (this.x > this.game.entities[0].x && this.direction !== Direction.LEFT) {
        this.direction = Direction.LEFT;
        this.curr_anim = this.animations.left;
    } else if (this.x < this.game.entities[0].x && this.direction !== Direction.RIGHT) {
        this.direction = Direction.RIGHT;
        this.curr_anim = this.animations.right;
    }
}

Boss = function (game, dialogue, anims, path, speed, pause, quad, map_name, name)
{
    this.spriteSheet = anims.right.spriteSheet;
    this.name = name;
    NPC.call(this, game, dialogue, anims, path, speed, pause, quad, map_name)
}

Boss.prototype = new NPC();
Boss.prototype.constructor = Boss;

Boss.prototype.updateDialogue = function () {
    if (this.game) {
        if (this.game.next === true) {
            var text_box = document.getElementById("dialogue_box");
            var text = document.createElement('p');
            if (this.dialogue_index < this.dialogue[this.part].length - 1) {
                this.dialogue_index++;
                text.innerHTML = this.dialogue[this.part][this.dialogue_index];
                text_box.innerHTML = text.outerHTML;
            } else {
                this.dialogue_index = 0;
                text_box.style.visibility = "hidden";
                text_box.style.display = "none";
                text_box.tabIndex = 2;
                this.game.context.canvas.tabIndex = 1;
                this.game.context.canvas.focus();
                //this.game.canControl = true;
                this.interacting = false;
                this.game.fadeOut(this.game, { game: this.game, battle_type: "boss" }, this.game.setBattle);
            }
            this.game.next = false;
        }
    }
}

SirenNPC = function (game, dialogue, anims, path, speed, pause, quad, map_name) {
    this.spriteSheet = anims.right.spriteSheet;
    this.name = "SirenNPC";
    NPC.call(this, game, dialogue, anims, path, speed, pause, quad, map_name)
}

SirenNPC.prototype = new NPC();
SirenNPC.prototype.constructor = SirenNPC;

SirenNPC.prototype.updateDialogue = function () {
    if (this.game) {
        if (this.game.next === true) {
            var text_box = document.getElementById("dialogue_box");
            var text = document.createElement('p');
            if (this.dialogue_index < this.dialogue[this.part].length - 1) {
                this.dialogue_index++;
                text.innerHTML = this.dialogue[this.part][this.dialogue_index];
                text_box.innerHTML = text.outerHTML;
            } else {
                this.dialogue_index = 0;
                text_box.style.visibility = "hidden";
                text_box.style.display = "none";
                text_box.tabIndex = 2;
                this.game.context.canvas.tabIndex = 1;
                this.game.context.canvas.focus();
                //this.game.canControl = true;
                this.interacting = false;
                this.game.fadeOut(this.game, { game: this.game, battle_type: "boss" }, this.game.setBattle);
            }
            this.game.next = false;
        }
    }
}
/*NPC_QUEST object
This is an NPC with a quest object
game: game engine
name: name of the NPC_QUEST
dialog: message or task foor hero
anims: a SpriteSet object with the characters full set of animations
path: an array of Points which will determine the path that the NPC will take. pass in one point for the NPC to stand still
speed: speed of the movement
quest: what kind of quest it has
pause: whether the NPC will rest for 1 second once it reaches one of its points
*/


NPC_QUEST = function(game, name, dialog, anims, path, speed, pause, quad, quest, map_name, scale, functions, yOffset) {
    this.name = name;
    this.quest = quest; 
    NPC.call(this, game, dialog, anims, path, speed, pause, quad, map_name, scale);
    if (functions) {
        this.start_interaction = functions[0];
        this.update_dialog = functions[1];
    }

    this.firstQuadx = this.x;
    this.firstQuady = this.y;
    if (yOffset) {
        this.y_offset = yOffset;
    }
}

NPC_QUEST.prototype = new NPC();
NPC_QUEST.prototype.constructor = NPC_QUEST;

NPC_QUEST.prototype.startInteraction = function () {
    this.start_interaction();
}

NPC_QUEST.prototype.showDialog = function () {
    this.reposition();
    var text_box = document.getElementById("dialogue_box");

    var text = document.createElement('p');
    text.innerHTML = this.dialogue[this.part][this.dialogue_index];
    text_box.innerHTML = text.outerHTML;
    text_box.style.visibility = "visible";
    text_box.style.display = "block";
    this.game.context.canvas.tabIndex = 0;
    text_box.tabIndex = 1;
    text_box.focus();
    this.interacting = true;
    this.game.canControl = false;
}

NPC_QUEST.prototype.update = function () {
    if (!this.interacting) {
        NPC.prototype.update.call(this);
        this.firstQuadx = this.x;
        this.firstQuady = this.y;
    } else {
        this.curr_anim = this.stopAnimation(this.curr_anim);
        this.updateDialogue();
    }
}

NPC_QUEST.prototype.updateDialogue = function () {
    this.update_dialog();
}

NPC_QUEST.prototype.draw = function (context) {
    this.changeCoordsForQuad(this.game.environment[this.game.current_environment].curr_quadrant);
    this.curr_anim.drawFrame(this.game.clockTick, context, this.x, this.y, this.scale);

}

NPC_QUEST.prototype.changeCoordsForQuad = function (quad) {
    this.x = this.firstQuadx;
    this.y = this.firstQuady;
    // change x value 
    if (quad - this.quad[0] === 1) {
        if (quad === 2 || quad === 5) {
            this.x -= 12 * 32;
        } else if (quad === 1 || quad === 4) {
            this.x -= 11 * 32;
        }
    } else if (quad - this.quad[0] === -1) {
        if (quad === 2 || quad === 5) {
            this.x += 12 * 32;
        } else if (quad === 1 || quad === 4) {
            this.x += 11 * 32;
        }
    }
    // change y value 
    if (Math.abs(quad - this.quad[0]) === 3) {
        if (quad - this.quad[0] < 0) {
            this.y += 11 * 32;
        } else if (quad - this.quad[0] > 0) {
            this.y -= 11 * 32;
        }
    }

}
/* QUEST OBJECT abstract class
 Parameters: giverName (who gave the quest), 
             reward (what the reward is for finishing that quest)
			 game (the game engine)			 
*/

QUEST = function (game, giverName, reward) {
    this.game = game;
    this.giverName = giverName;
    this.reward = reward;
    if (this.complete) { // if the quest has been complete
        this.game.alertHero("Your mission is complete, dear young hero!");
    }
    this.complete = false;
}

/*RETRIEVE_ITEM_QUEST
game: game engine
giverName: name of 
reward: what is the reward for finishing this quest 
item: the item to retrieve or find
item_found: if the item has been retrieved
 */
RETRIEVE_ITEM_QUEST = function (game, giverName, reward, item) {
    this.item = item;
    this.item_found = false;
    this.type = "item";
    QUEST.call(this, game, giverName, reward);
}

RETRIEVE_ITEM_QUEST.prototype = new QUEST();
RETRIEVE_ITEM_QUEST.prototype.constructor = RETRIEVE_ITEM_QUEST;

/*KILL_QUEST 
enemy_to_kill : whom our hero has to kill
enemies_killed: number of killed enemies
number_enemies: how many enemies our hero should kill
*/
KILL_QUEST = function (game, giverName, reward, enemy_to_kill, number_enemies) {
    this.enemy_to_kill = enemy_to_kill;
    this.number_enemies = number_enemies;
    this.enemies_killed = 0;
    this.type = "kill";
    QUEST.call(this, game, giverName, reward);
}

KILL_QUEST.prototype = new QUEST();
KILL_QUEST.prototype.constructor = KILL_QUEST;

Point = function (x, y) {
    this.x = x;
    this.y = y;
}

Point.prototype.getX = function () {
    return this.x;
}

Point.prototype.getY = function () {
    return this.y;
}

/*
An object that is passed in when creating a new enemy/NPC/Hero that has a full map of its animations.
If a certain animation does not exist, pass in null.
*/
SpriteSet = function (down, up, left, right, destroy, hit, death) {
    this.down = down;
    this.up = up;
    this.left = left;
    this.right = right;
    this.destroy = destroy;
    this.hit = hit;
    this.death = death;
}


/* BACKGROUND : sheetWidth being how many tiles wide the sheet is. */
Tilesheet = function (tileSheetPathName, tileSize, sheetWidth) {
    if (tileSheetPathName) {
        this.sheet = ASSET_MANAGER.getAsset(tileSheetPathName);
    }
    this.tileSize = tileSize;
    this.sheetWidth = sheetWidth;
}

Environment = function (game, map, animations, tilesheet, quads, interactables, name, battle_background, fiends, start_quad, hostile_quads) {
    this.game = game;
    // "Map" will be a double array of integer values. 
    this.map = map;
    this.animations = animations;
    this.tileSheet = tilesheet;
    this.quads = quads;
    this.name = name;
    this.curr_quadrant = start_quad;
    this.fiends = fiends;
    this.battle_background = battle_background;
    this.interactables = interactables;
    this.hostile_quads = hostile_quads;
    //Environment.initInteractables.call(this, this.interactables);
}

Environment.prototype.getBattleBackground = function()
{
    return this.battle_background;
}
EnvironmentAnimation = function (animation, coords, quads, stage) {
    this.animation = animation;
    this.coords = coords;
    this.quads = quads;
    this.stage = stage; 
}

OutdoorEnvironment = function (game, map, indoor_maps, animations, tilesheet, quads, interactables, fiends, name, battle_background, start_quad, hostile_quads) {
    this.indoor_maps = indoor_maps;
    this.fiends = fiends;
    Environment.call(this, game, map, animations, tilesheet, quads, interactables, name, battle_background, fiends, start_quad, hostile_quads);
    this.addIndoorEnvironments();
}

OutdoorEnvironment.prototype = new Environment();
OutdoorEnvironment.prototype.constructor = OutdoorEnvironment;

OutdoorEnvironment.prototype.addIndoorEnvironments = function () {
    for (var i = 0; i < this.indoor_maps.length; i++) {
        this.game.addEnvironment(this.indoor_maps[i].name, this.indoor_maps[i]);
    }
}

IndoorEnvironment = function (game, map, animations, tilesheet, quads, interactables, name, battle_background, fiends, start_quad, hostile_quads) {
    this.fiends = fiends;
    Environment.call(this, game, map, animations, tilesheet, quads, interactables, name, battle_background, fiends, start_quad, hostile_quads);
}


IndoorEnvironment.prototype = new Environment();
IndoorEnvironment.prototype.constructor = IndoorEnvironment;

Environment.prototype.initInteractables = function (interactables) {
    for (var i = 0; i < interactables.length; i++) {
        this.interactables.push(interactables[i]);
    }
}

Interactable = function (x, y, quad, game) {
    this.x = x * 32;
    this.y = y * 32;
    this.quad = quad;
    this.game = game;
}

Interactable.prototype.startInteraction = function () {
    var found = false;
    if (this.quad.length > 1) {
        for (var i = 0; i < this.quad.length; i++) {
            if (this.game.environment[this.game.current_environment].curr_quadrant === this.quad[i]) {
                found = true;
            }
        }
    } else {
        return this.game.environment[this.game.current_environment].curr_quadrant === this.quad;
    }

    return found;
}

// requires an ax to chop apart, usuaully to get to a chest or to a secret area. 
Log = function (x, y, quad, game) {
    Interactable.call(this, x, y, quad, game);
    this.broken = false; 
}

Log.prototype = new Interactable();
Log.prototype.constructor = Log;

Log.prototype.startInteraction = function () {
    if (!this.broken) {
        if (Interactable.prototype.startInteraction.call(this)) {
            if (this.game.entities[0].inventory.hasItem("Ax", 1)) {
                this.game.alertHero("You use your ax to break the log!");
                var loc_point = this.game.changeXYForQuad(new Point(this.x / 32, this.y / 32), this.quad);
                var ax = this.game.entities[0].inventory.getItem("Ax");
                ax.doAction();
                this.game.environment[this.game.current_environment].map[loc_point.y][loc_point.x] = 0;
                this.game.environment[this.game.current_environment].map[loc_point.y][loc_point.x + 1] = 0;
                this.broken = true; 
            } else {
                this.game.alertHero("This log requires an ax to break.");
            }
        }
    }
}

// PORTAL FUNCTIONS 
EnterDragonCave = function () {
    if (this.game.entities[0].inventory.hasItem("King Arthur's Rock")) {
        this.game.current_environment = "dragon_cave";
        this.game.entities[0].sight = 30;
        this.game.environment[this.game.current_environment].setQuadrant(0);
        this.game.entities[0].x = 32;

        this.game.entities[0].y = 200;
   } else {
     this.game.alertHero("There -must- be some way into this mountain. Perhaps through some hidden cave.");
    }
}

EnterDragonCaveFromLevel2 = function () {
    this.game.current_environment = "dragon_cave";
    this.game.entities[0].x = 560;
    this.game.entities[0].y = 192;
    this.game.environment[this.game.current_environment].setQuadrant(2);
}

ExitDragonCave = function () {
    this.game.current_environment = "level1";
    this.game.environment[this.game.current_environment].setQuadrant(5);
    this.game.entities[0].x = 512;

    this.game.entities[0].y = 192;
}

EnterHouse1 = function () {
    this.game.current_environment = "house1";
    this.game.environment[this.game.current_environment].setQuadrant(0);
    this.game.entities[0].x = 256;
    this.game.sound_manager.playSound("door_open");
    this.game.entities[0].y = 352;
}

ExitHouse1 = function () {
    this.game.current_environment = "level1";
    this.game.environment[this.game.current_environment].setQuadrant(0);
    this.game.entities[0].x = 256;
    this.game.sound_manager.playSound("door_open");

    this.game.entities[0].y = 192;
}

EnterChurch = function () {
    this.game.current_environment = "church";
    this.game.environment[this.game.current_environment].setQuadrant(0);
    this.game.entities[0].x = 448;
    this.game.sound_manager.playSound("door_open");
    this.game.entities[0].y = 352;
    this.game.entities[0].sight = 80; 
}

ExitChurch = function () {
    this.game.current_environment = "level2";
    this.game.environment[this.game.current_environment].setQuadrant(0);
    this.game.entities[0].x = 525;
    this.game.sound_manager.playSound("door_open");
    this.game.entities[0].y = 300;
    this.game.entities[0].sight = 35;
}

EnterHouse2 = function () {
    this.game.current_environment = "house2";
    this.game.environment[this.game.current_environment].setQuadrant(0);
    this.game.entities[0].x = 256;
    this.game.entities[0].y = 352;
    this.game.sound_manager.playSound("door_open");
}

ExitHouse2 = function () {
    this.game.current_environment = "level1";
    this.game.environment[this.game.current_environment].setQuadrant(0);
    this.game.entities[0].x = 64;

    this.game.sound_manager.playSound("door_open");
    this.game.entities[0].y = 192;
}

EnterLevel2 = function () {
    this.game.current_environment = "level2";
    this.game.environment[this.game.current_environment].setQuadrant(3);
    this.game.entities[0].x = 320;
    this.game.entities[0].y = 208;
}

// used to change maps or to initiate special battles. 
Portal = function (x, y, quad, game, func, stage) {
    this.func = func;
    this.stage = stage; 
    Interactable.call(this, x, y, quad, game);
    this.portal = true; 
}

Portal.prototype = new Interactable();
Portal.prototype.constructor = Portal;

Portal.prototype.startInteraction = function () {
    if (!this.stage) {
        this.func();
    } else if (this.game.current_stage === this.game.stage[this.stage]) {
        this.func();
    } 
}

Door = function (x, y, quad, game) {
    this.is_closed = true;
    this.locked = true;
    Interactable.call(this, x, y, quad, game);
}

Door.prototype = new Interactable();
Door.prototype.constructor = Door;

Door.prototype.startInteraction = function () {
    if (Interactable.prototype.startInteraction.call(this)) {
        var y = this.y / 32;
        var x = this.x / 32;
        var loc_point = this.game.changeXYForQuad(new Point(x, y), this.quad);
        if (this.current_stage !== this.game.stage[0]) {
            this.locked = false;
        }

        if (this.locked) {
            if (this.current_stage === this.game.stage[0]) {
                this.game.alertHero("This door is locked. Try coming back after the village isn't burning down.");
            }
        } else {
            if (this.is_closed) {
                // close door
                this.game.environment[this.game.current_environment].map[loc_point.y][loc_point.x] = 105;
                this.game.environment[this.game.current_environment].map[loc_point.y - 1][loc_point.x] = 102;
                this.game.environment[this.game.current_environment].map[loc_point.y - 2][loc_point.x] = 101;
            } else {
                // open door
                this.game.environment[this.game.current_environment].map[loc_point.y][loc_point.x] = 80;
                this.game.environment[this.game.current_environment].map[loc_point.y - 1][loc_point.x] = 79;
                this.game.environment[this.game.current_environment].map[loc_point.y - 2][loc_point.x] = 78;
            }
            this.is_closed = !this.is_closed;
        }
    }
}

Chest = function (x, y, quad, game, loot, locked) {
    this.closed = true;
    this.loot = loot;
    this.locked = locked;
    Interactable.call(this, x, y, quad, game);
}

Chest.prototype = new Interactable();
Chest.prototype.constructor = Chest;

Chest.prototype.startInteraction = function () {
    if (Interactable.prototype.startInteraction.call(this)) {
        var y = this.y / 32;
        var x = this.x / 32;

        var loc_point = this.game.changeXYForQuad(new Point(x, y), this.quad);
        if (this.loot[0].name === "Book of Spells") {
            if (this.game.entities[0].hasQuest("Witch")) {
                this.lootChest();
            } else {
                this.game.alertHero("This chest is magically sealed.");
            }
        } else {
            if (this.closed) {
                if (!this.locked) {
                    this.lootChest();
                } else if (this.locked && this.game.entities[0].inventory.hasItem("Key", 1)) {
                    var key_to_remove = this.game.entities[0].inventory.hasItem("Key", 1); 
                    var key = this.game.entities[0].inventory.removeItem(key_to_remove, 1);
                    // open chest
                    // give loot
                    this.lootChest()
                } else {
                    this.game.alertHero("This chest is locked and requires a key to open. Perhaps there are some around.");
                }
            } else {
                this.game.alertHero("You've already taken the contents of this chest. You greedy bastard.");
            }

        }
        if (!this.closed) {
            if (this.game.environment[this.game.current_environment] === "dragon_cave") {
                this.game.environment[this.game.current_environment].map[loc_point.y][loc_point.x] = 29;
            } else if (this.game.environment[this.game.current_environment] === "level1") {
                this.game.environment[this.game.current_environment].map[loc_point.y][loc_point.x] = 100;
            } else if (this.game.environment[this.game.current_environment] === "level2") {
                this.game.environment[this.game.current_environment].map[loc_point.y][loc_point.x] = 2;
            }
        }
    }
}

Warrior.prototype.hasQuest = function (giver_name) {
    var found = false;
    for (var i = 0; i < this.quests.length; i++) {
        if (this.quests[i].giverName === giver_name) {
            found = true;
        }
    }
    return found;
}

Chest.prototype.lootChest = function () {
    var loot_items = "";
    for (var i = 0; i < this.loot.length; i++) {
        this.game.entities[0].inventory.addItem(this.loot[i]);
        var loot = (this.loot[i].name || this.loot[i] + " gold");
        if (this.loot[i].qty > 1) {
            loot += " x" + this.loot[i].qty;
        }
        if (i === this.loot.length - 1) {
            loot_items += "and " + loot;
        } else {
            loot_items += loot + ", ";
        }
        if (this.loot.length === 1) {
            loot_items = loot;
        }
    }
    this.game.alertHero("You recieved " + loot_items + ".");
    this.closed = false;
}

HealBerry = function (x, y, quad, game) {
    this.picked = false;
    this.berry = new Potion(this.game, "Heal Berry", 10, 1, ASSET_MANAGER.getAsset("./imgs/items/heal_berry.png"), "health", 1, "Heals your HP");

    Interactable.call(this, x, y, quad, game);
}

HealBerry.prototype = new Interactable();
HealBerry.prototype.constructor = HealBerry;

HealBerry.prototype.startInteraction = function () {
    if (Interactable.prototype.startInteraction.call(this)) {
        var x = this.x / 32;
        var y = this.y / 32;
        var loc_point = this.game.changeXYForQuad(new Point(x, y), this.game.environment[this.game.current_environment].curr_quadrant);

        if (!this.picked) {
            this.game.entities[0].recieveItem(this.berry);
            this.picked = true;
            this.game.environment[this.game.current_environment].map[loc_point.y][loc_point.x] = 134;
        } else {
            this.game.alertHero("You've already picked the berries off of this plant.");
        }
    }
}

/*Generates an array of random length between 1 and 2 with fiends that belong to that environment*/

Environment.prototype.generateFiend = function (game) {
    var number_of_fiends = Math.floor(Math.random() * (4 - 1)) + 1;
    var fiend_array = [];
    for (var i = 0; i < number_of_fiends; i++) {
        var fiend_number = Math.floor(Math.random() * (this.fiends.length - 0) + 0);
        var fiend = this.initNewFiend(this.fiends[fiend_number]);
        fiend.init();
        fiend_array.push(fiend);

    }
    return fiend_array;
}

//enemystat
Environment.prototype.initNewFiend = function (fiend) {
    switch (fiend) {
        case "Skeleton":
            return (new Skeleton(this.game, new Statistics(30, 10, 15), false));
            break;
        case "Malboro":
            return (new Malboro(this.game, new Statistics(40, 15, 5), false));
            break;
        case "Ogre":
            return (new Ogre(this.game, new Statistics(50, 15, 15), false));
            break;
        case "Dire Wolf":
            return (new DireWolf(this.game, new Statistics(60, 15, 5), true));
            break;
        case "Wolf Rider":
            return (new WolfRider(this.game, new Statistics(70, 20, 15), true));
            break;
        default:
            return null;
    }
}

// used to check if the curr_quad exists in an objects quad array. 
includes = function (array, index) {
    for (var i = 0; i < array.length; i++) {
        if (array[i] === index) {
            return true;
        }
    }
    return false;
}

/* Loops over double array called Map, then draws the image of the tile associated with the integer in the map array. */
Environment.prototype.draw = function (scaleBy) {
    this.context = this.game.context;
    var scaleBy = (scaleBy || 1);

   this.drawTiles.call(this, scaleBy);
    if (this.animations) {
        this.drawEnvironmentAnimations();
    }
}

Environment.prototype.changeXY = function (point, quad) {
    switch (quad) {
        case 1:
            point.x -= 11;
            break;
        case 2:
            point.x -= 12;
            break;
        case 3:
            point.y -= 11;
            break;
        case 4:
            point.y -= 11;
            point.x -= 11;
            break;
        case 5:
            point.y -= 11;
            point.x -= 12;
            break;
    }
    return point;
}

Environment.prototype.drawTiles = function (scaleBy) {
    //draw tiles
    for (var i = this.game.quadrants[this.curr_quadrant][1]; i <= this.game.quadrants[this.curr_quadrant][3]; i++) { // length of each column
        for (var j = this.game.quadrants[this.curr_quadrant][0]; j <= this.game.quadrants[this.curr_quadrant][2]; j++) { // length of each row
            if (this.map[i]) {
                var tile_index = this.map[i][j];

                var x_start_clip = tile_index % this.tileSheet.sheetWidth * this.tileSheet.tileSize;
                var y_start_clip = Math.floor(tile_index / this.tileSheet.sheetWidth) * this.tileSheet.tileSize;
                var amount_clip = this.tileSheet.tileSize;
                var x_coord = (this.tileSheet.tileSize * j) - (this.game.quadrants[this.curr_quadrant][0] * this.tileSheet.tileSize);
                var y_coord = (this.tileSheet.tileSize * i) - (this.game.quadrants[this.curr_quadrant][1] * this.tileSheet.tileSize);
                var draw_size = this.tileSheet.tileSize * scaleBy;

                this.context.drawImage(this.tileSheet.sheet,
                                  x_start_clip, y_start_clip, // where to start clipping
                                  amount_clip, amount_clip,  // how much to clip
                                  x_coord, y_coord, // coordinates to start drawing to 
                                  draw_size, draw_size); // how big to draw. 
            }
        }
    }
}

/* TODO: FIX THIS */
IndoorEnvironment.prototype.drawTiles = function (scaleBy) {
    for (var k = 0; k < this.map.length; k++) {
        for (var i = this.game.quadrants[this.curr_quadrant][1]; i <= this.game.quadrants[this.curr_quadrant][3]; i++) { // length of each column
            for (var j = this.game.quadrants[this.curr_quadrant][0]; j <= this.game.quadrants[this.curr_quadrant][2]; j++) { // length of each row
                
                var tile_index = this.map[k][i][j];

                var x_start_clip = tile_index % this.tileSheet.sheetWidth * this.tileSheet.tileSize;
                var y_start_clip = Math.floor(tile_index / this.tileSheet.sheetWidth) * this.tileSheet.tileSize;
                var amount_clip = this.tileSheet.tileSize;
                var x_coord = (this.tileSheet.tileSize * j) - (this.game.quadrants[this.curr_quadrant][0] * this.tileSheet.tileSize);
                var y_coord = (this.tileSheet.tileSize * i) - (this.game.quadrants[this.curr_quadrant][1] * this.tileSheet.tileSize);
                var draw_size = this.tileSheet.tileSize * scaleBy;

                this.context.drawImage(this.tileSheet.sheet,
                                    x_start_clip, y_start_clip, // where to start clipping
                                    amount_clip, amount_clip,  // how much to clip
                                    x_coord, y_coord, // coordinates to start drawing to 
                                    draw_size, draw_size); // how big to draw. 
           }           
        }
    }
}

Environment.prototype.drawEnvironmentAnimations = function () {
    var loc_point = null;
    for (var i = 0; i < this.animations.length; i++) {
        // only draw if the animation belongs in the current quad
        if (includes(this.animations[i].quads, this.curr_quadrant) && this.game.current_stage === this.game.stage[this.animations[i].stage]) {
            for (var j = 0; j < this.animations[i].coords.length; j++) {
                var coord = this.animations[i].coords[j];
                var coord_point = new Point(coord[0], coord[1]);
                if (this.curr_quadrant !== 0) {
                    // if not in the 0 quad, change x and y to fit new quad. 
                    coord_point = this.changeXY(coord_point, this.curr_quadrant);
                }
                this.animations[i].animation.drawFrame(this.game.clockTick, this.game.context, coord_point.x * 32, coord_point.y * 32, 1.3);
            }
        }
    }
}

Environment.prototype.update = function () {

}

Environment.prototype.setQuadrant = function (number) {
    this.curr_quadrant = number;
}


BattleMenu = function (menu_element, game) {
    this.game = game;
    this.menu = menu_element;
    this.attack_menu = document.getElementById("attack_sub");

    // battlemenu main controls
    this.attack = document.getElementById("attack");
    this.use_item = document.getElementById("use_item");
    this.flee = document.getElementById("flee");

    // attack menu controls
    this.single_attack = document.getElementById("single_attack");
    this.aoe_attack = document.getElementById("aoe_attack");
    this.back = document.getElementById("back");

    this.use_item_list = new UseItemMenu(this.game, this);

    this.target_queue = [];
}

UseItemMenu = function (game, parent) {
    this.game = game;
    this.parent = parent;
    this.menu = document.getElementById("useitem_menu");
    this.list = this.menu.children[0];
    
    this.open = false;
    if (this.game) {
        this.items = this.game.entities[0].inventory.items;
    }
    this.list_items = [];
}

UseItemMenu.prototype.showMenu = function (game) {
    if (!this.open) {
        this.game.context.canvas.tabIndex = 0;
        this.menu.tabIndex = 1;
        this.menu.style.display = "block";
        this.menu.style.visibility = "visible";


        this.parent.menu.tabIndex = 0;
        this.parent.attack.tabIndex = 0;
        this.parent.use_item.tabIndex = 0;
        this.parent.flee.tabIndex = 0;
        this.updateItems(game);
        this.changeFocus(0);
        this.open = true;
    } else {
        this.menu.style.display = "none";
        this.menu.style.visibility = "hidden";
        this.menu.tabIndex = 0;
        this.parent.menu.tabIndex = 1;
        this.parent.attack.tabIndex = 1;
        this.parent.use_item.tabIndex = 1;
        this.parent.flee.tabIndex = 1;
        this.parent.attack.focus();
        this.game.context.canvas.tabIndex = 1;
        this.open = false;
    }
}

UseItemMenu.prototype.hasUsuableItems = function () {
    for (var i = 0; i < this.game.entities[0].inventory.items.length; i++) {
        if (this.game.entities[0].inventory.items[i].usable) {
            return true;
        }
    }
    return false;
}

UseItemMenu.prototype.changeFocus = function (index) {
    if (this.list_items[index]) {
        var li_item2 = this.list_items[index].html;
        li_item2.focus();
    }
}

UseItemMenu.prototype.updateItems = function (game) {
    this.list_items = [];
    this.list.innerHTML = "";
    for (var i = 0; i < this.items.length; i++) {
        if (this.items[i].usable) {
            var new_li = document.createElement('li');
            var p = document.createElement('p');
            p.innerHTML = this.items[i].name;
            new_li.innerHTML = this.items[i].img.outerHTML;
            new_li.innerHTML += p.outerHTML;
            new_li.tabIndex = 1;
            var li = new List_item(this.game, this.items[i], i);
            this.list.innerHTML += new_li.outerHTML;
            this.list_items.push(li);
        }
    }
    for (var i = 0; i < this.list_items.length; i++) {
        this.list_items[i].html = this.menu.children[0].children[i];
        this.list_items[i].input(game);
    }
}

List_item = function (game, item, index) {
    this.game = game;
    this.item = item;
    this.html = null;
    this.index = index;
}

List_item.prototype.input = function (game) {
    this.game = game; 
    var that = this;
    this.html.addEventListener("keydown", function (e) {
        if (e.which === 40) {
            // select next item down
            if (that.index < that.parent.list_items.length - 1) {
                window.setTimeout(that.game.menu.use_item_list.changeFocus(that.index + 1));
            }
        } else if (e.which === 38) {
            // select next item up 
            if (that.index > 1) {
                window.setTimeout(that.game.menu.use_item_list.changeFocus(that.index - 1));
            }
        } else if (String.fromCharCode(e.which) === ' ') {
            // use item
            that.game.menu.use_item_list.updateItems(that.game);
            that.item.doAction(that.game);
            //window.setTimeout(that.item.doAction(), 0);
            window.setTimeout(that.game.menu.use_item_list.showMenu(), 0);
            if(that.game.is_battle)
            {
                that.is_selecting = false;
                that.game.entities[0].is_turn = false;
                that.game.setNextFighter(that.game);
            }

        } else if (e.which === 27) {
            window.setTimeout(that.game.menu.use_item_list.showMenu(), 0);
        }
        //e.stopImmediatePropagation();
        e.preventDefault();
    }, false);
}

BattleMenu.prototype.init = function (game) {
    this.game = game;
    var that = this;

    this.attack.addEventListener("keydown", function (e) {
        that.game.sound_manager.playSound("select");
        if (that.game.canControl && (that.game.heroes[0].is_turn || (that.game.heroes[1] && that.game.heroes[1].is_turn) || (that.game.heroes[2] && that.game.heroes[2].is_turn))) {
            if (e.which === 40) {
                window.setTimeout(that.use_item.focus(), 0);
            } else if (String.fromCharCode(e.which) === ' ') {
                // opens attack sub_menu
                that.changeTabIndex("main", false);

                that.changeTabIndex("attack", true);

                window.setTimeout(that.single_attack.focus(), 0);
            }
        }
        e.preventDefault();
    });

    //this.use_item.addEventListener("blur", function (e) {
    //    window.setTimeout(that.use_item_list.changeFocus(0), 0);
    //    e.preventDefault();
    //    e.stopImmediatePropagation();
    //}, false); 
    this.use_item.addEventListener("keydown", function (e) {
        that.game.sound_manager.playSound("select");
        this.pressed = false;
        if (e.which === 40) {
            window.setTimeout(that.flee.focus(), 0);
        } else if (e.which === 38) {
            window.setTimeout(that.attack.focus(), 0);
        } else if (String.fromCharCode(e.which) === ' ') {
            if (that.use_item_list.hasUsuableItems()) {
                that.use_item_list.showMenu(that.game);
            }
        }
        e.preventDefault();
        e.stopImmediatePropagation();
    }, false);
    this.use_item.addEventListener("keyup", function (e) {
        this.pressed = false;
    }, false);
    this.flee.addEventListener("keydown", function (e) {
        that.game.sound_manager.playSound("select");
        if (((that.game.heroes[0] && that.game.heroes[0].is_turn) || (that.game.heroes[1] && that.game.heroes[1].is_turn) || (that.game.heroes[2] && that.game.heroes[2].is_turn))) {
            if (e.which === 38) {
                window.setTimeout(that.use_item.focus(), 0);
            } else if (String.fromCharCode(e.which) === ' ') {
                if (!that.game.is_boss_battle) {
                    that.game.fight_queue[0].is_turn = false;
                    var total_dexterity = 0;
                    for (var i = 0; i < that.game.heroes.length; i++)
                    {
                        total_dexterity += that.game.heroes.length
                    }
                    for (var i = 0; i < that.game.heroes.length; i++) {
                        that.game.heroes[i].flee(true);
                    }
                }
                // characters flee
            }
        }
        e.preventDefault();
    });

    // ATTACK MENU CONTROLS 
    this.single_attack.addEventListener("keydown", function (e) {
        that.game.sound_manager.playSound("select");
        if (e.which === 40) {
            if (that.is_selecting) {
                if (that.game.fiends[that.next_target]) {
                    
                    that.game.fiends[that.next_target].is_targeted = false;
                    that.next_target += 1;
                    if (that.next_target > that.game.fiends.length - 1) {
                        that.next_target = that.game.fiends.length - 1;
                    }
                    that.game.fiends[that.next_target].is_targeted = true;
                }
            }
            else {
                window.setTimeout(that.aoe_attack.focus(), 0);
            }
        }
        else if (e.which === 38) {
            if (that.is_selecting) {
                if (that.game.fiends[that.next_target]) {
                    that.game.fiends[that.next_target].is_targeted = false;
                    that.next_target -= 1;
                    if (that.next_target < 0) {
                        that.next_target = 0;
                    }
                    that.game.fiends[that.next_target].is_targeted = true;
                }
            }
        } else if (e.which === 27) {
            if (that.is_selecting) {
                that.is_selecting = false;
                for (var i = 0; i < that.game.fiends.length; i++) {
                    if (that.game.fiends[i]) {
                        that.game.fiends[i].is_targeted = false;
                    }
                }
                window.setTimeout(that.single_attack.focus(), 0);
            }
        }
        else if (String.fromCharCode(e.which) === ' ') {
            // stuff to make character do a single attack 

            if (that.is_selecting) {
                if (that.game.heroes[0].is_turn || that.game.heroes[1].is_turn || that.game.heroes[2].is_turn) {
                    if (that.game.fight_queue[0]) {
                        that.game.fight_queue[0].setAction("Single", [that.game.fiends[that.next_target]]);
                        if (that.game.fiends[that.next_target]) {
                            that.game.fiends[that.next_target].is_targeted = false;
                        }
                        that.is_selecting = false;
                        that.game.fight_queue[0].is_turn = false;
                        that.changeTabIndex("attack", false);
                        that.changeTabIndex("main", true);
                        window.setTimeout(that.attack.focus(), 0);
                    }
                }
            }
            else {
                that.next_target = 0;
                for (var i = 0; i < that.game.fiends.length; i++) {
                    if (that.game.fiends[i] && !that.game.fiends[i].is_dead) {
                        that.game.fiends[i].is_targeted = true;
                        that.next_target = i;
                        break;
                    }
                }
                that.is_selecting = true;
            }

        }
        e.stopImmediatePropagation();
        e.preventDefault();
    });

    this.aoe_attack.addEventListener("keydown", function (e) {
        that.game.sound_manager.playSound("select");
        if (e.which === 40) {
            if (!that.is_selecting) {
                window.setTimeout(that.back.focus(), 0);
            }
        } else if (e.which === 38) {
            if (!that.is_selecting) {
                window.setTimeout(that.single_attack.focus(), 0);
            }
        } else if (e.which === 27) {
            if (that.is_selecting) {
                that.is_selecting = false;
                for (var i = 0; i < that.game.fiends.length; i++) {
                    if (that.game.fiends[i]) {
                        that.game.fiends[i].is_targeted = false;
                    }
                }
                window.setTimeout(that.aoe_attack.focus(), 0);
            }
        }
        else if (String.fromCharCode(e.which) === ' ') {
            if (that.is_selecting) {
                if (that.game.heroes[0].is_turn || that.game.heroes[1].is_turn || that.game.heroes[2].is_turn) {
                    if (that.game.fight_queue[0]) {
                        that.game.fight_queue[0].setAction("Sweep", that.game.fiends);
                        for (var i = 0; i < that.game.fiends.length; i++) {
                            if (that.game.fiends[i]) {
                                that.game.fiends[i].is_targeted = false;
                            }
                        }
                        that.is_selecting = false;
                        that.game.fight_queue[0].is_turn = false;
                        that.changeTabIndex("attack", false);
                        that.changeTabIndex("main", true);
                        window.setTimeout(that.attack.focus(), 0);
                    }
                }
            }
            else {
                for (var i = 0; i < that.game.fiends.length; i++) {
                    if (that.game.fiends[i] && !that.game.fiends[i].is_dead) {
                        that.game.fiends[i].is_targeted = true;
                    }
                }
                that.is_selecting = true;
            }
        }
        e.stopImmediatePropagation();
        e.preventDefault();
    });

    this.back.addEventListener("keydown", function (e) {
        that.game.sound_manager.playSound("select");
        if (e.which === 38) {
            window.setTimeout(that.aoe_attack.focus(), 0);
        } else if (String.fromCharCode(e.which) === ' ') {
            that.changeTabIndex("attack", false);
            that.changeTabIndex("main", true);
            window.setTimeout(that.attack.focus(), 0);
        }
        e.preventDefault();
    });
}


BattleMenu.prototype.changeTabIndex = function (option, bool) {
    var that = this;
    switch (option) {
        case "main":
            if (bool) {
                that.menu.style.visibility = "visible";
                that.menu.style.display = "block";
                that.menu.tabIndex = 1;
                that.attack.tabIndex = 1;
                that.use_item.tabIndex = 1;
                that.flee.tabIndex = 1;
            } else {
                that.menu.style.visibility = "hidden";
                that.menu.style.display = "none";
                that.menu.tabIndex = 0;
                that.attack.tabIndex = 0;
                that.use_item.tabIndex = 0;
                that.flee.tabIndex = 0;
            }
            break;
        case "attack":
            if (bool) {
                that.attack_menu.style.visibility = "visible";
                that.attack_menu.style.display = "block";
                that.attack_menu.tabIndex = 1;
                that.single_attack.tabIndex = 1;
                that.aoe_attack.tabIndex = 1;
                that.back.tabIndex = 1;
            } else {
                that.attack_menu.style.visibility = "hidden";
                that.attack_menu.style.display = "none";
                that.attack_menu.tabIndex = 0;
                that.single_attack.tabIndex = 0;
                that.aoe_attack.tabIndex = 0;
                that.back.tabIndex = 0;
            }
            break;
        case "item":
            break;
        default:;
    }
}

BattleMenu.prototype.showMenu = function (flag, game) {
    this.game = game;
    if (flag) {
        this.game.context.canvas.tabIndex = 0;
        this.changeTabIndex("main", true);
        this.attack.focus();
    } else {
        this.game.context.canvas.tabIndex = 2;
        this.changeTabIndex("main", false);
        this.game.context.canvas.focus();
    }
}

// menu accessed by pressing "esc" 
GeneralMenu = function (game) {
    this.game = game;
    this.hero = null;
    this.menu = document.getElementById("esc_menu");
    this.inventory = document.getElementById("inventory");
    this.save = document.getElementById("save_game");
    this.load = document.getElementById("load_game");
    this.return = document.getElementById("return");
    this.init();
}

GeneralMenu.prototype.initHero = function (hero) {
    this.hero = hero;
}

GeneralMenu.prototype.init = function () {
    var that = this;
    this.inventory.addEventListener("keydown", function (e) {
        if (e.which === 40) {
            window.setTimeout(that.save.focus(), 0);
        } else if (String.fromCharCode(e.which) === ' ') {
            that.showMenu(false);
            window.setTimeout(that.hero.inventory.showInventory.call(that.hero.inventory), 0);
        }
        e.stopImmediatePropagation();
        e.preventDefault();
    });
    this.save.addEventListener("keydown", function (e) {
        if (e.which === 40) {
            window.setTimeout(that.load.focus(), 0);
        } else if (e.which === 38) {
            window.setTimeout(that.inventory.focus(), 0);
        } else if (String.fromCharCode(e.which) === ' ') {
            // opens save interface
        }
        e.preventDefault();
    });
    this.load.addEventListener("keydown", function (e) {
        if (e.which === 40) {
            window.setTimeout(that.return.focus(), 0);
        } else if (e.which === 38) {
            window.setTimeout(that.save.focus(), 0);
        } else if (String.fromCharCode(e.which) === ' ') {
            // opens load interface
        }
        e.preventDefault();
    });
    this.return.addEventListener("keydown", function (e) {
        if (e.which === 38) {
            window.setTimeout(that.load.focus(), 0);
        } else if (String.fromCharCode(e.which) === ' ') {
            that.showMenu(false);
        }
        e.preventDefault();
    });
}

GeneralMenu.prototype.showMenu = function (flag) {
    if (flag) {
        this.game.context.canvas.tabIndex = 0;
        this.menu.style.visibility = "visible";
        this.menu.style.display = "block";
        this.menu.tabIndex = 1;
        this.save.tabIndex = 1;
        this.load.tabIndex = 1;
        this.inventory.tabIndex = 1;
        this.return.tabIndex = 1;
        this.inventory.focus();
    } else {
        this.menu.style.visibility = "hidden";
        this.menu.style.display = "none";
        this.menu.tabIndex = 0;
        this.save.tabIndex = 0;
        this.load.tabIndex = 0;
        this.inventory.tabIndex = 0;
        this.return.tabIndex = 0;
        this.game.context.canvas.tabIndex = 1;
        this.game.context.canvas.focus();
    }
}

/*
GHOST NPC_QUEST
*/

Ghost = function(game, name, dialog, anims, path, speed, pause, quad, quest, map_name){
	this.part = 0; 
	NPC_QUEST.call(this, game, name, dialog, anims, path, speed, pause, quad, quest, map_name);
	this.curr_anim = this.animations.down;
	this.y_offset = 15;
	}
	
Ghost.prototype = new NPC_QUEST();
Ghost.prototype.constructor = Ghost;

Ghost.prototype.startInteraction = function () {
    if (this.game.current_stage === this.game.stage[0]) {
        // if before dragon is dead, have Ghost give hero a quest. 
        this.showDialog();
    } else {
        //nothing
    }
}

Ghost.prototype.showDialog = function () {
    if (this.part === 1 && this.quest.complete) {
        this.part++;
    }
    this.reposition();
    var text_box = document.getElementById("dialogue_box");

    var text = document.createElement('p');
    text.innerHTML = this.dialogue[this.part][this.dialogue_index];
    text_box.innerHTML = text.outerHTML;
    text_box.style.visibility = "visible";
    text_box.style.display = "block";
    this.game.context.canvas.tabIndex = 0;
    text_box.tabIndex = 1;
    text_box.focus();
    this.interacting = true;
    this.game.canControl = false;
}

Ghost.prototype.update = function () {
    if (!this.interacting) {
        this.curr_anim = this.animations.down;
        this.direction = Direction.DOWN;
    } else {
        this.curr_anim = this.stopAnimation(this.curr_anim);
        this.updateDialogue();
    }
}

Ghost.prototype.updateDialogue = function () {
    if (this.game) {
        if (this.game.next === true) {
            var text_box = document.getElementById("dialogue_box");
            var text = document.createElement('p');
            if (this.dialogue_index < this.dialogue[this.part].length - 1) {
                this.dialogue_index++;
                text.innerHTML = this.dialogue[this.part][this.dialogue_index];
                text_box.innerHTML = text.outerHTML;
            } else {
                this.dialogue_index = 0;
                text_box.style.visibility = "hidden";
                text_box.style.display = "none";
                text_box.tabIndex = 2;
                this.game.context.canvas.tabIndex = 1;
                this.game.context.canvas.focus();
                this.game.canControl = true;
                this.interacting = false;
                if (this.part === 0) {
                    this.part++;

					console.log("quest added, part=0");
                    this.game.entities[0].addQuest(this.quest);
                }
                if (this.part===1 &&this.game.entities[0].inventory.hasItem("Potion")) {
					 
                    this.game.entities[0].inventory.removeItem("Potion", 1);
                    this.game.entities[0].inventory.addItem(this.quest.reward);
                    this.part++; 
					console.log("reward added"+ this.part);
                }
				
				if(this.part ===2){
				console.log("removing entity"+ this.part);
					this.game.removeEntity(this);
				}
            }
            this.game.next = false;
        }
    }
}

Ghost.prototype.draw = function (context) {
    if (this.game.environment[this.game.current_environment].curr_quadrant === 2) {
        this.x = 320;
        this.curr_anim.drawFrame(this.game.clockTick, context, this.x, this.y, 1.2);
    }
}




/*StoreKeeper NPC_QUEST with KILL_QUEST
*/
Storekeeper = function (game, name, dialog, items, max_coin, anims, path, speed, pause, quad, quest, map_name, scale, functions) {

    this.part = 0; 
    this.inventory = new StorekeeperInventory(game, max_coin, 19, items);
    NPC_QUEST.call(this, game, name, dialog, anims, path, speed, pause, quad, quest, map_name, scale);
    this.curr_anim = this.animations.down;
    this.y_offset = 25;
    this.firstQuadx = this.x;
    this.firstQuady = this.y;
    this.start_interaction = functions[0];
    this.update_dialog = functions[1];
}

Storekeeper.prototype = new NPC_QUEST();
Storekeeper.prototype.constructor = Storekeeper;

Storekeeper.prototype.startInteraction = function () {
    this.start_interaction(); 
}

Storekeeper.prototype.showDialog = function () {
    this.reposition();
    var text_box = document.getElementById("dialogue_box");

    var text = document.createElement('p');
    text.innerHTML = this.dialogue[this.part][this.dialogue_index];
    text_box.innerHTML = text.outerHTML;
    text_box.style.visibility = "visible";
    text_box.style.display = "block";
    this.game.context.canvas.tabIndex = 0;
    text_box.tabIndex = 1;
    text_box.focus();
    this.interacting = true;
    this.game.canControl = false;
}

Storekeeper.prototype.update = function () {
    if (!this.interacting) {
        this.curr_anim = this.animations.down;
        this.direction = Direction.DOWN;
    } else {
        this.curr_anim = this.stopAnimation(this.curr_anim);
        this.updateDialogue();
    }
}

Storekeeper.prototype.updateDialogue = function () {
    this.update_dialog();
}

Storekeeper.prototype.draw = function (context) {
    this.changeCoordsForQuad(this.game.environment[this.game.current_environment].curr_quadrant);
    this.curr_anim.drawFrame(this.game.clockTick, context, this.x, this.y, this.scale);
    
}

Storekeeper.prototype.changeCoordsForQuad = function (quad) {
    this.x = this.firstQuadx;
    this.y = this.firstQuady; 
    // change x value 
    if (quad - this.quad[0] === 1) {
        if (quad === 2 || quad === 5) {
            this.x -= 12 * 32; 
        } else if (quad === 1 || quad === 4) {
            this.x -= 11 * 32; 
        }
    } else if (quad - this.quad[0] === -1) {
        if (quad === 2 || quad === 5) {
            this.x += 12 * 32;
        } else if (quad === 1 || quad === 4) {
            this.x += 11 * 32;
        }
    }
    // change y value 
    if (Math.abs(quad - this.quad[0]) === 3) {
        if (quad - this.quad[0] < 0) {
            this.y += 11 * 32; 
        } else if (quad - this.quad[0] > 0) {
            this.y -= 11 * 32; 
        }
    }
    
}

/*WITCH NPC_QUEST with KILL_QUEST
*/
Witch = function (game, name, dialog, anims, path, speed, pause, quad, quest, map_name) {

    this.part = 0; 
    NPC_QUEST.call(this, game, name, dialog, anims, path, speed, pause, quad, quest, map_name);
    this.curr_anim = this.animations.down;
    this.y_offset = 25;
    this.x_offset = 5;
}

Witch.prototype = new NPC_QUEST();
Witch.prototype.constructor = Witch;

Witch.prototype.startInteraction = function () {
        // if before dragon is dead, have Witch give hero a quest. 
        this.showDialog();
    
}

Witch.prototype.showDialog = function () {
    if (this.part === 1 && this.quest.complete) {
        this.part++;
    }
    this.reposition();
    var text_box = document.getElementById("dialogue_box");

    var text = document.createElement('p');
    if (this.part === 0 && this.game.entities[0].hasQuest("Ghost")) {
        this.part++;
    }
    text.innerHTML = this.dialogue[this.part][this.dialogue_index];
    
    text_box.innerHTML = text.outerHTML;
    text_box.style.visibility = "visible";
    text_box.style.display = "block";
    this.game.context.canvas.tabIndex = 0;
    text_box.tabIndex = 1;
    text_box.focus();
    this.interacting = true;
    this.game.canControl = false;
}

Witch.prototype.update = function () {
    if (!this.interacting) {
        this.curr_anim = this.animations.down;
        this.direction = Direction.DOWN;
    } else {
        this.curr_anim = this.stopAnimation(this.curr_anim);
        this.updateDialogue();
    }
}

Witch.prototype.updateDialogue = function () {
    if (this.game) {
        if (this.game.next === true) {
            var text_box = document.getElementById("dialogue_box");
            var text = document.createElement('p');

            if (this.dialogue_index < this.dialogue[this.part].length - 1) {
                this.dialogue_index++;
                text.innerHTML = this.dialogue[this.part][this.dialogue_index];
                text_box.innerHTML = text.outerHTML;
            } else {
                this.dialogue_index = 0;
                text_box.style.visibility = "hidden";
                text_box.style.display = "none";
                text_box.tabIndex = 2;
                this.game.context.canvas.tabIndex = 1;
                this.game.context.canvas.focus();
                this.game.canControl = true;
                this.interacting = false;
                if (this.part === 1) {
                    this.part++;
                    this.game.entities[0].addQuest(this.quest);
                }
                if (this.part === 2 && this.game.entities[0].inventory.hasItem("Book of Spells")) {
                    this.game.entities[0].inventory.removeItem("Book of Spells", 1); 
                     this.game.entities[0].inventory.addItem(this.quest.reward);
                     this.part++; 
                     this.showDialog();
                 } else if (this.part === 3) {
                    this.part++;    
                }
            }
            this.game.next = false;
        }
    }
}

Witch.prototype.draw = function (context) {
    if (this.game.environment[this.game.current_environment].curr_quadrant === 1) {
        this.x = 458;
        this.curr_anim.drawFrame(this.game.clockTick, context, this.x, this.y, 1.2);
    } else if (this.game.environment[this.game.current_environment].curr_quadrant === 2) {
        this.x = 64;
        this.curr_anim.drawFrame(this.game.clockTick, context, this.x, this.y, 1.2);
    }
}

Item = function (game, name, price, qty, img, description) {
    this.game = game;
    this.name = name;
    this.price = price;
    this.qty = qty;
    this.img = img;
    this.isStackable = true;
    this.html = null;
    this.usable = false;
    if (description) {
        this.description = description;
    } else {
        this.description = "No Description";
    }
}

Item.prototype.increaseQty = function (amount) {
    this.qty += amount;
}

Item.prototype.decreaseQty = function (amount) {
    if (this.qty >= amount) {
        this.qty -= amount;
    }
}

Item.prototype.setActionText = function () {

}

Item.prototype.doAction = function () {

}

UsableItem = function (game, name, price, qty, img, description) {
    Item.call(this, game, name, price, qty, img, description);
    this.usable = true;
    this.isEquipped = false;
}

UsableItem.prototype = new Item();
UsableItem.prototype.constructor = UsableItem;


// Special items are not equipable, stackable, or usable in the normal sense, and they do not have a sale price.
// special items have a number of uses and when they run out, the item will remove itself from the hero's inventory
// actionFunction is the "doAction" function for special item, pass in whatever you need the item to do. 
SpecialItem = function (game, name, img, uses, actionFunction, description) {
    UsableItem.call(this, game, name, 0, 1, img, description);
    this.isStackable = false;
    this.isEquipped = false;
    this.uses = uses;
    this.actionFunction = actionFunction;
    this.usable = false;
    this.qty = 0; 
}

SpecialItem.prototype = new UsableItem();
SpecialItem.prototype.constructor = SpecialItem;

SpecialItem.prototype.doAction = function () {
    this.actionFunction();
    this.uses--;
    this.update();
}

SpecialItem.prototype.update = function () {
    if (this.uses === 0) {
        this.game.entities[0].inventory.removeItem(this.name, 1);
    }
}

// potion will be mostly potions but a heal berry does the same thing so it's also a Potion. 
// types are: mana, health, str, dex, int, stam - exactly as typed here so other code works. 

// level is 1, 2, or 3

Potion = function (game, name, price, qty, img, type, level, description) {
    this.potion_type = type;
    this.level = level;
    UsableItem.call(this, game, name, price, qty, img, description);
    this.potion_type = type;
    this.level = level;
}

Potion.prototype = new UsableItem();
Potion.prototype.constructor = Potion;

Potion.prototype.doAction = function (game, target) {
    var this_target
    if (target)
    {
        this_target = target;
    }
    else {
        this_target = this.game.entities[0];
    }
    switch (this.potion_type) {
        case "health":
            var max_heal = this.target.stats.total_health - this_target.stats.health;
            if (max_heal > this.level * 75) {
                this_target.stats.health += this.level * 75;
            }
            else {
                this_target.stats.health += max_heal;
            }
            break;
        case "stam":

            break;
        case "mana":

            break;
        case "str":
            this_target.strength += this.level * 1;
            break;
        case "dex":
            this_target.dexterity += this.level * 1;
            break;
        case "int":
            this_target.intelligence += this.level * 1;
            break;
    }
    this.game.entities[0].inventory.removeItem(this.name, 1);
}

HTML_Item = function (element, game) {
    this.game = game;
    this.element = element;
    this.item = null;
    this.menu = document.getElementById("item_menu");
    this.action = document.createElement("a");
    this.action.setAttribute("id", "action");
    this.destroy = document.createElement("a");
    this.destroy.setAttribute("id", "destroy");
    this.destroy.innerHTML = "Destroy";
    this.return = document.createElement("a");
    this.return.setAttribute("id", "return2");
    this.return.innerHTML = "Return";


    this.itemmenu = document.getElementById("storeitem_menu");
    this.og_children = this.menu.children[0].children;
}

HTML_Item.prototype.showItemDescription = function () {
    if (!this.open) {
        HTML_StoreItem.setItemDescription.call(this);
        this.itemmenu.style.visibility = "visible";
        this.itemmenu.style.display = "block";
    }
}

HTML_Item.prototype.showItemMenu = function (flag, inventory, index) {
    this.index = index;
    if (flag && this.item) {
        inventory.interface.tabIndex = 0;
        this.menu.style.visibility = "visible";
        this.menu.style.display = "block";
        this.original_location = this.itemmenu.style.top;
        this.itemmenu.style.top = "-593px";
        this.menu.tabIndex = 1;
        this.setActionText();
        this.insertATags();
        if (!this.item.uses) {
            this.action = document.getElementById("action");
            this.destroy = document.getElementById("destroy");
        }
        this.return = document.getElementById("return2");
        if (!this.item.uses) {
            this.destroy.tabIndex = 1;
            this.action.tabIndex = 1;
        }
        this.return.tabIndex = 1;
        this.actionInput();
        if (!this.item.uses) {
            this.action.focus();
        } else {
            this.return.focus();
        }
    } else {
        this.menu.style.visibility = "hidden";
        this.menu.style.display = "none";
        this.menu.tabIndex = 0;
        this.action.tabIndex = 0;
        this.destroy.tabIndex = 0;
        this.return.tabIndex = 0;
        this.itemmenu.style.top = this.original_location;
    }
}

HTML_Item.prototype.insertATags = function () {
    var li_nodes = this.og_children;
    if (!this.item.uses && li_nodes[0] && li_nodes[1]) {
        li_nodes[0].innerHTML = this.action.outerHTML;
        li_nodes[1].innerHTML = this.destroy.outerHTML
        li_nodes[2].innerHTML = this.return.outerHTML;
    } else if (!this.item.uses) {
        var li_node1 = document.createElement("li");
        var li_node2 = document.createElement("li");
        var li_node3 = document.createElement("li");
        li_node1.innerHTML = this.action.outerHTML;
        li_node2.innerHTML = this.destroy.outerHTML;
        li_node3.innerHTML = this.return.outerHTML;
        this.menu.children[0].innerHTML = li_node1.outerHTML;
        this.menu.children[0].innerHTML += li_node2.outerHTML;
        this.menu.children[0].innerHTML += li_node3.outerHTML;
    }
    else {
        var li_node = document.createElement("li");
        li_node.innerHTML = this.return.outerHTML;
        this.menu.children[0].innerHTML = li_node.outerHTML;
    }
}

HTML_Item.prototype.setActionText = function () {
    if (this.item.type) {
        if (this.item.isEquipped) {
            this.action.innerHTML = "Unequip";
        } else {
            this.action.innerHTML = "Equip";
        }
    } else if (this.item.usable) {
        this.action.innerHTML = "Use Item";
    }
    //if (this.item.uses) {
    //    this.destroy.innerHTML = "";
    //}
}

Book = function (game, name, img) {
    Item.call(this, game, name, 0, 1, img);
}
Book.prototype = new Item();
Book.prototype.constructor = Book;




Armor = function (game, name, price, img, type, stats, description) {
    this.isEquipped = false;
    this.type = type;
    this.slot = document.getElementById("equip_" + type);
    this.background_img = this.slot.style.backgroundImage;
    Item.call(this, game, name, price, 1, img, description);
    this.isStackable = false;
    this.stats = stats;
    this.qty = 1; 
}

Armor.prototype = new Item();
Armor.prototype.constructor = Armor;

Armor.prototype.doAction = function () {
    this.unequipOldArmor();
    // equip new item
    if (this.isEquipped) {
        this.slot.style.backgroundImage = this.background_img;
        this.slot.innerHTML = "";
        this.game.entities[0].equipped[this.type] = false;
        this.isEquipped = false;
    } else {
        this.slot.style.backgroundImage = "none";
        this.slot.innerHTML = this.img.outerHTML;
        this.game.entities[0].equipped[this.type] = this;
        this.isEquipped = true;
    }
    this.game.entities[0].updateStats();
}

Armor.prototype.unequipOldArmor = function (bool) {
    if (bool) {
        this.isEquipped = false;
        this.slot.style.backgroundImage = this.background_img;
        this.slot.innerHTML = "";
        this.game.entities[0].equipped[this.type] = false;
    } else {
        // check if item is already equipped
        if (this.game.entities[0].equipped[this.type] &&
            this.game.entities[0].equipped[this.type] !== this) {
            var old_item = this.game.entities[0].equipped[this.type];
            old_item.isEquipped = false;
        }
    }
}

Armor.prototype.setActionText = function () {
    if (this.item.isEquipped) {
        this.action.innerHTML = "Unequip";
    } else {
        this.action.innerHTML = "Equip";
    }
}

Warrior.prototype.recieveItem = function (item) {
    var that = this; 
    //this.inventory.addItem(item);
    window.setTimeout(that.inventory.addItem.bind(that.inventory, item), 0);
}

Warrior.prototype.removeItem = function (item, qty) {
    return this.inventory.removeItem(item, qty);
}   

Inventory = function (game, coin, max_items) {
    this.game = game;
    this.coin = coin;
    this.html_coin = document.getElementById("coin");
    this.max_items = max_items;
    this.interface = document.getElementById("inventory_sack");
    this.html_items = [];
    this.items = [];
    this.stacking_limit = 50;
    this.initHtmlItems();
    this.selectInput();
    this.open = false;
    this.hero_name = document.getElementById("hero_name");
    this.current_name_index = 0; 
    this.names = [{ name: "Theon", found: true }, { name: "Acele", found: true }, { name: "Efari", found: false }];
    this.itemmenu = document.getElementById("storeitem_menu");
    this.itemName = document.getElementById("item_name");
    this.itemDescription = document.getElementById("item_description");
}

Inventory.prototype.initHtmlItems = function () {
    var html_elements = document.getElementById("items").getElementsByTagName('DIV');
    for (var i = 0; i < html_elements.length; i++) {
        var new_object = new HTML_Item(html_elements[i], this.game);
        this.html_items.push(new_object);
    }
}   

// used if you need to interact with an item in the inventory without removing it or increasing it's qty.
Inventory.prototype.getItem = function (item_name) {
    for (var i = 0; i < this.items.length; i++) {
        if (this.items[i].name === item_name) {
            return this.items[i];
        }
    }
}

Inventory.prototype.deductCoin = function (amount) {
    if (this.coin >= amount) {
        this.coin -= amount;
        return true;
    } else {
        return false;
    }
}

Inventory.prototype.addCoin = function (amount) {
    this.coin += amount;
}

Inventory.prototype.hasItem = function (item_name) {
    var found = false;
    for (var i = 0; i < this.items.length; i++) {
        if (this.items[i].name === item_name) {
            found = this.items[i];
        }
    }
    return found;
}

Inventory.prototype.showInventory = function (flag) {
    if (!this.open) {
        //this.draw();
        this.game.context.canvas.tabIndex = 0;
        this.interface.tabIndex = 2;
        this.interface.style.visibility = "visible";
        this.interface.style.display = "block";
        this.itemmenu.style.visibility = "visible";
        this.itemmenu.style.display = "block";
        this.changeFocus(0);
        this.open = true;
    } else {    
        this.open = false;
        this.interface.style.visibility = "hidden";
        this.interface.style.display = "none";
        this.itemmenu.style.visibility = "hidden";
        this.itemmenu.style.display = "none";
        this.interface.tabIndex = 0;
        this.game.context.canvas.tabIndex = 1;
        this.game.context.canvas.focus();
    }
}

HTML_Item.prototype.updateShowItemMenu = function () {
    var that = this;
    this.element.addEventListener("keydown", function (e) {
        if (String.fromCharCode(e.which) === ' ') {
            window.setTimeout(that.showItemMenu(true, that.game.entities[0].inventory), 0);
        }
        e.preventDefault();
        e.stopImmediatePropagation();
    }, false);
}

Inventory.prototype.draw = function (ctx) {
    for (var i = 0; i < this.html_items.length; i++) {
        // get img of each item
        if (this.items[i]) {
            var img = this.items[i].img;
            this.html_items[i].element.innerHTML = img.outerHTML;
            if (this.items[i].qty && this.items[i].qty > 1) {
                var qty = document.createElement('p');
                qty.innerHTML = this.items[i].qty
                this.html_items[i].element.innerHTML += qty.outerHTML;
            }
            // set items html spot
            this.items[i].html = this.html_items[i];
            this.html_items[i].item = this.items[i];
            var that = this;
            //window.setTimeout(that.html_items[i].actionInput.bind(that.html_items[i]), 0);
            //window.setTimeout(that.html_items[i].updateShowItemMenu.bind(that.html_items[i]), 0);
            //this.html_items[i].actionInput.bind(this.html_items[i]);
            //this.html_items[i].updateShowItemMenu.bind(this.html_items[i]);
            //this.html_items[i].actionInput();
            //this.html_items[i].updateShowItemMenu.call(this.html_items[i]);
        } else {
            this.html_items[i].item = null;
            this.html_items[i].element.innerHTML = "";
        }
    }
    // draw coin amount
    this.html_coin.innerHTML = this.coin;
    //this.selectInput();
    var that = this;
    window.setTimeout(that.game.startInput.bind(that.game),0);
}

Inventory.prototype.addItem = function (item) {
    var found = false;
    if (this.items && item.isStackable) {
        for (var i = 0; i < this.items.length; i++) {
            if (this.items[i].name === item.name) {
                if ((this.items[i].qty + item.qty) <= this.stacking_limit) {
                    this.items[i].qty += item.qty;
                    found = true;
                }
            }
        }
    }
    if (!found) {
        if (this.items.length < this.max_items && typeof (item) == "object") {
            this.items.push(item);
        } else if (typeof (item) == "number") {
            // add coin
            this.addCoin(item);
        } else {
            // wont fit in inventory
        }
    } 
    //this.draw.bind(this);
    //var that = this;
    //window.setTimeout(that.draw.bind(that), 0);
    this.draw();
    //this.draw.call(this);
}

// will return false if item can't be removed either because it doesn't exist in inventory or there aren't enough of the item to remove (qty too low) 
// otherwise it will return the item 
Inventory.prototype.removeItem = function (item, qty) {
    var item = false;
    for (var i = 0; i < this.items.length; i++) {
        if (this.items[i] === item) {
            if (this.items[i].qty > qty) {
                //split stack
                item = this.splitStack(item_name, qty)
            } else if (this.items[i].qty === qty) {
                item = this.items[i];
                if (item.type) {
                    item.unequipOldArmor(true);
                }
                this.items.splice(i, 1);
            } else {
                // can't remove item. 
            }
        }
    }
    //this.draw.bind(this);
    //var that = this;
    //window.setTimeout(that.draw.bind(that), 0);
    this.draw();
    //this.draw.call(this);
    return item;
}

// returns new item object of the qty requested while keeping the remaining in the inventory
// use only when the qty of the item in the inventory is greater than the stack being requested. 
Inventory.prototype.splitStack = function (item_name, qty) {
    var new_stack = null;
    for (var i = 0; i < this.items.length; i++) {
        if (this.items[i].name === item_name) {
            new_stack = new Item(item_name, this.items[i].price, qty, this.items[i].img, this.items[i].stackable);
            this.items[i].qty -= qty;
        }
    };
    return new_stack;
}

Inventory.prototype.selectInput = function () {
    var that = this;
    for (var i = 0; i < this.html_items.length; i++) {
        var item = that.html_items[i].element;
        var html = that.html_items[i];
        item.index = i;
        item.pressed = false;
        item.addEventListener("keydown", function ItemMenu(e) {
            var new_index = null;
            var index = this.index;
            if (!this.pressed) {
                this.actionListener = ItemMenu;
                if (e.which === 37) { // left 
                    // if at the beginning of a row, send focus to the end of row. 
                    if ((index % 5) < 1) {
                        new_index = index + 4;
                        that.changeFocus(new_index);
                    } else {
                        new_index = index - 1;
                        that.changeFocus(new_index);
                    }
                } else if (e.which === 38) { // up
                    // if in top row, send focus to bottom row. 
                    if (Math.floor(index / 5) === 0) {
                        new_index = that.html_items.length - 5 + index;
                        that.changeFocus(new_index);
                    } else {
                        new_index = index - 5;
                        that.changeFocus(new_index);
                    }
                } else if (e.which === 39) { // right
                    // if at the end of a row, send focus to the beginning of row. 
                    if (((index + 1) % 5) === 0) {
                        new_index = index - 4;
                        that.changeFocus(new_index);
                    } else {
                        new_index = index + 1;
                        that.changeFocus(new_index);
                    }
                } else if (e.which === 40) { // down
                    // if in bottom row, send focus to top row
                    if (Math.floor((index / 5)) === 3) {
                        new_index = index % 5;
                        that.changeFocus(new_index);
                    } else {
                        new_index = index + 5;
                        that.changeFocus(new_index);
                    }
                } else if (String.fromCharCode(e.which) === ' ') {
                    // bring up menu to let user choose what to do with item
                    // item could be usable or equipable
                    if (that.html_items[index]) {
                        that.html_items[index].showItemMenu(true, that);
                    }
                } else if (e.which === 27 || e.which === 73) {
                    window.setTimeout(that.showInventory.bind(that), 0);
                } else if (e.which === 13) {
                    that.changeHero(); 
                }
                this.pressed = true;
            }
            e.stopImmediatePropagation();
            e.preventDefault();
        });

        item.addEventListener("keyup", function () {
            this.pressed = false;
        });
    }
}

Inventory.prototype.changeHero = function () {
    if (this.names[this.current_name_index+1].found) {
        this.current_name_index++; 
    } else if (this.names[this.current_name_index].found) {
        this.current_name_index = 0; 
    }
    this.hero_name.innerHTML = this.names[this.current_name_index].name;
    var armor_slot = document.getElementById("equip_armor");
    var accessory_slot = document.getElementById("equip_accessory");
    var mainhand_slot = document.getElementById("equip_mainhand");
    var offhand_slot = document.getElementById("equip_offhand");

    // change equip slots
 
    if (this.game.heroes[this.current_name_index].equipped.armor) {
         armor_slot.innerHTML = ""; 
         armor_slot.style.backgroundImage = this.game.heroes[this.current_name_index].equipped.armor.img;
    } else {
        armor_slot.innerHTML = ASSET_MANAGER.getAsset("./imgs/equipment/armor.png").outerHTML;
    }
    if (this.game.heroes[this.current_name_index].equipped.accessory) {
        accessory_slot.innerHTML = "";
        accessory_slot.style.backgroundImage = this.game.heroes[this.current_name_index].equipped.accessory.img;
    } else {
        accessory_slot.innerHTML = ASSET_MANAGER.getAsset("./imgs/equipment/accessory.png").outerHTML;
    }
    if (this.game.heroes[this.current_name_index].equipped.mainhand) {
        mainhand_slot.innerHTML = ""; 
        mainhand_slot.style.backgroundImage = this.game.heroes[this.current_name_index].equipped.mainhand.img;
    } else {
        mainhand_slot.innerHTML = ASSET_MANAGER.getAsset("./imgs/equipment/mainhand.png").outerHTML;
    }
    if (this.game.heroes[this.current_name_index].equipped.offhand) {
        offhand_slot.innerHTML = "";
        offhand_slot.style.backgroundImage = this.game.heroes[this.current_name_index].equipped.offhand.img;
    } else {
        offhand_slot.innerHTML = ASSET_MANAGER.getAsset("./imgs/equipment/offhand.png").outerHTML;
    }
     
}

HTML_Item.prototype.actionInput = function () {
    var that = this;
    var pressed = false;
    if (!this.item.uses) {
        this.action.addEventListener("keydown", function (e) {
            if (!this.pressed) {
                if (e.which === 40) {
                    window.setTimeout(that.destroy.focus(), 0);
                } else if (e.which === 32) {
                    that.item.doAction.call(that.item);
                    that.showItemMenu(false);
                    window.setTimeout(that.element.focus(), 0);
                }
            }
            this.pressed = true;
            e.preventDefault();
        }, false);
        this.destroy.addEventListener("keydown", function (e) {
            if (!this.pressed) {
                if (e.which === 40) {
                    window.setTimeout(that.return.focus(), 0);
                } else if (e.which === 38) {
                    window.setTimeout(that.action.focus(), 0);
                } else if (e.which === 32) {
                    that.showItemMenu(false);
                    window.setTimeout(that.element.focus(), 0);
                    that.item.game.entities[0].inventory.removeItem(that.item, that.item.qty);
                }
            }
            this.pressed = true;
            e.preventDefault();
        }, false);
    }
    this.return.addEventListener("keydown", function (e) {
        if (!this.pressed) {
            if (e.which === 38) {
                window.setTimeout(that.destroy.focus(), 0);
            } else if (e.which === 32) {
                that.showItemMenu(false);
                window.setTimeout(that.element.focus(), 0);
            }
        }
        this.pressed = true;
        e.preventDefault();
    }, false);
    if (!this.item.uses) {
        this.action.addEventListener("keyup", function (e) {
            this.pressed = false;
        }, false);
        this.destroy.addEventListener("keyup", function (e) {
            this.pressed = false;
        }, false);
    }
    this.return.addEventListener("keyup", function (e) {
        this.pressed = false;
    }, false);

}

Inventory.prototype.changeFocus = function (index) {
    var element = this.html_items[index].element;
    window.setTimeout(element.focus(), 0);
    this.setItemDescription(index);
}

Inventory.prototype.setItemDescription = function (index) {
    if (this.html_items[index].item) {
        this.itemName.innerHTML = this.html_items[index].item.name + "<br><hr>";
        this.itemDescription.innerHTML = this.html_items[index].item.description + "<br>";
        if (this.html_items[index].item.type) {
            if (this.html_items[index].item.stats.health !== 0) {
                this.itemDescription.innerHTML += "<br>Health: ";
                this.itemDescription.innerHTML += this.html_items[index].item.stats.health;
            }

            if (this.html_items[index].item.stats.attack !== 0) {
                this.itemDescription.innerHTML += "<br>Attack: ";
                this.itemDescription.innerHTML += this.html_items[index].item.stats.attack;
            }

            if (this.html_items[index].item.stats.defense !== 0) {
                this.itemDescription.innerHTML += "<br>Defense: ";
                this.itemDescription.innerHTML += this.html_items[index].item.stats.defense;
            }

            if (this.html_items[index].item.stats.strength !== 0) {
                this.itemDescription.innerHTML += "<br>STR: ";
                this.itemDescription.innerHTML += this.html_items[index].item.stats.strength;
            }

            if (this.html_items[index].item.stats.dexterity !== 0) {
                this.itemDescription.innerHTML += "<br>DEX: ";
                this.itemDescription.innerHTML += this.html_items[index].item.stats.dexterity;
            }

            if (this.html_items[index].item.stats.intelligence !== 0) {
                this.itemDescription.innerHTML += "<br>INT: ";
                this.itemDescription.innerHTML += this.html_items[index].item.stats.intelligence;
            }
        }
    }
}

StorekeeperInventory = function (game, coin, maxItems, items) {
    this.game = game;
    this.coin = coin;
    this.sell_mode = true; 
    this.html_hero_coin = document.getElementById("hero_coin");
    this.html_storekeeper_coin = document.getElementById("keeper_coin");
    this.quantity = document.getElementById("quantity");
    this.item_price = document.getElementById("item_price");
    this.total_price = document.getElementById("total_price");
    this.mode = document.getElementById("mode");
    this.max_items = maxItems;
    this.interface = document.getElementById("store");
    this.html_items = [];
    this.buy_html_items = [];
    this.items = items;
    this.sale_items = items;
    this.buy_items = [];
    this.stacking_limit = 50;
    this.initHtmlItems();
    this.initHtmlItemsQty();
    this.open = false;
    this.shopping_cart = new ShoppingCart(game, this); 
}

ShoppingCart = function (game, inventory) {
    this.game = game;
    this.items = [];
    this.inventory = inventory;
    this.total = 0;
    this.sale_back = 1;
}


// returns new item object of the qty requested while keeping the remaining in the inventory
// use only when the qty of the item in the inventory is greater than the stack being requested. 
StorekeeperInventory.prototype.splitStack = function (html) {
    var new_stack = null;        
    if (html.item.potion_type) {
        var new_stack = new Potion(this.game, html.item.name, html.item.price, 1, html.item.img, html.item.potion_type, html.item.description);
    }        
    
    return new_stack;
}

ShoppingCartItem = function (item) {
    this.item = item;
    if (item) {
        this.qty = this.item.qty;
    }
}

ShoppingCartItem.prototype.increaseQty = function () {
    this.qty++; 
}

ShoppingCartItem.prototype.decreaseQty = function () {
    this.qty--;
}

ShoppingCart.prototype.addItem = function (html) {
    // 3 cases: 
    // single non-stackable item 
    // stackable item not already in shopping cart (need to create a new stack) 
    // stackable item but in cart already 
    if (html.stock_qty > 0) {
        if (this.includes(html.item) && html.item.isStackable) {
            var cart_item = this.includes(html.item);
            // increase shopping cart qty and decrease stock qty.
            cart_item.increaseQty();
            html.stock_qty--;

            this.total += html.item.price;
            this.inventory.quantity.innerHTML = "Qty: " + cart_item.qty;
            this.inventory.item_price.innerHTML = "Price: " + cart_item.qty * cart_item.item.price * this.sale_back; 
        } else if (html.item.isStackable) {
            // split stack auto increases new_item qty to 1 and decreases the stock_qty of item by 1. 
            var that = this; 
            var new_stack = that.inventory.splitStack(html, 1);
            var new_item = new ShoppingCartItem(new_stack);
            html.stock_qty--;
            this.total += html.item.price;
            this.inventory.quantity.innerHTML = "Qty: " + new_item.qty;
            this.inventory.item_price.innerHTML = "Price: " + new_item.qty * new_item.item.price * this.sale_back;
            // add new item to shopping cart
            this.items.push(new_item);
        } else {
            var new_item = new ShoppingCartItem(html.item);
            this.items.push(new_item);
            html.stock_qty--;

            this.total += html.item.price;
            this.inventory.quantity.innerHTML = "Qty: " + new_item.qty;
            this.inventory.item_price.innerHTML = "Price: " + new_item.qty * new_item.item.price * this.sale_back;
        }
    }

    this.inventory.total_price.innerHTML = "Total: " + this.total * this.sale_back;
    var that = this; 
    //window.setTimeout(that.inventory.draw.bind(that.inventory), 0);
    //that.inventory.draw.bind(that.inventory);
    that.inventory.draw();
}

ShoppingCart.prototype.removeItem = function (html) {
    // 2 cases: 
    // there is a stack greater than 1 
    // a stack of 1 or a non stackable item - needs to just be spliced. 
    var shop_item = this.includes(html.item);
    if (shop_item && html.stock_qty > 0) {
        if (shop_item.item.isStackable && shop_item.qty > 1) {
            shop_item.decreaseQty();
            html.stock_qty++;

            this.total -= html.item.price * this.sale_back;
            this.inventory.quantity.innerHTML = "Qty: " + shop_item.qty;         
        } else {
            // remove from shopping cart all together
            this.items.splice(html.item, 1);
            // add back to stock 
            html.stock_qty++; 
            this.total -= html.item.price * this.sale_back;
            this.inventory.quantity.innerHTML = "Qty: " + 0;
        }
    }
    this.inventory.total_price.innerHTML = "Total: " + this.total * this.sale_back;
    var that = this;
    //window.setTimeout(that.inventory.draw.bind(that.inventory), 0);
    //that.inventory.draw.bind(that.inventory);
    that.inventory.draw();
}

ShoppingCart.prototype.includes = function (item) {
    var found = false;
    for (var i = 0; i < this.items.length; i++) {
        if (this.items[i].item.name) {
            if (this.items[i].item.name === item.name) {
                found = this.items[i];
            }
        } else if (this.items[i].name === item.name) {
            found = this.items[i];
        }
    }
    return found;
}

StorekeeperInventory.prototype.initHtmlItems = function () {
    var html_elements = document.getElementById("store_items").getElementsByTagName('DIV');
    for (var i = 0; i < this.max_items; i++) {
        var new_object = new HTML_StoreItem(html_elements[i], this.game);
        if (this.items[i]) {
        }
        this.html_items.push(new_object);
    }
}

StorekeeperInventory.prototype.initHtmlItemsQty = function () {
    var html_elements = document.getElementById("store_items").getElementsByTagName('DIV');
    for (var i = 0; i < this.html_items.length; i++) {
        if (this.items[i]) {
            this.html_items[i].stock_qty = this.items[i].qty;
        }
    }
}

StorekeeperInventory.prototype.selectInput = function (index) {
    var that = this;
    var item = that.html_items[index].element;
    var html = that.html_items[index];
    item.index = index;
    item.pressed = false;
    item.removeEventListener("keydown", this.actionListener);
    item.addEventListener("keydown", function ItemMenu(e) {
        var new_index = null;
        var index = this.index;
        if (!this.pressed) {
            this.actionListener = ItemMenu;
            if (e.which === 37) { // left 
                // if at the beginning of a row, send focus to the end of row. 

                new_index = index - 1;
                window.setTimeout(that.changeFocus.bind(that, new_index), 0);
                //that.changeFocus(new_index); 
            } else if (e.which === 38 && html.item) {
                console.log(index);
                console.log(that.items[index]);
                //window.setTimeout(that.shopping_cart.addItem.bind(that.shopping_cart, html), 0);
                that.shopping_cart.addItem(html); 
            } else if (e.which === 39) { // right
                // if at the end of a row, send focus to the beginning of row. 

                new_index = index + 1;
                window.setTimeout(that.changeFocus.bind(that, new_index), 0);
                //that.changeFocus(new_index);
            } else if (e.which === 40 && html.item) {
                //window.setTimeout(that.shopping_cart.removeItem.bind(that.shopping_cart, html), 0);
                that.shopping_cart.removeItem(html);
            } else if (String.fromCharCode(e.which) === ' ') {
                if ((that.sell_mode && that.game.entities[0].inventory.coin >= that.shopping_cart.total)
                     || (that.coin >= that.shopping_cart.total)) {
                    that.checkOut(index);
                    that.game.sound_manager.playSound("coin");
                } else {
                    that.game.sound_manager.playSound("nope");
                }
            } else if (e.which === 13) {
                that.buyMode();
            } else if (e.which === 27) {
                that.showWares();
                that.html_items[index].showItemMenu(false, that, index);
            }
            
            this.pressed = true;
        }
        e.stopImmediatePropagation();
        e.preventDefault();
    }, false);
    

    item.addEventListener("keyup", function () {
        this.pressed = false;
    }, false);
    
}

StorekeeperInventory.prototype.buyMode = function () {
    if (this.sell_mode) {
        this.items = this.game.entities[0].inventory.items;
        this.mode.innerHTML = "Buy:";
        this.sell_mode = false;
        this.shopping_cart.sale_back = .5;
    } else {
        this.items = this.sale_items;
        this.mode.innerHTML = "Sell:";
        this.sell_mode = true;
        this.shopping_cart.sale_back = 1; 
    }
    this.initHtmlItemsQty();
    this.changeFocus(0); 
    this.draw();
}

StorekeeperInventory.prototype.checkOut = function (index) {
    if (this.sell_mode) {
        for (var i = 0; i < this.shopping_cart.items.length; i++) {
            this.game.entities[0].recieveItem(this.shopping_cart.items[i].item);
            this.shopping_cart.items[i].qty = 0;
        }
        this.game.entities[0].inventory.deductCoin(this.shopping_cart.total);
        this.coin += this.shopping_cart.total;
    } else {
        for (var i = 0; i < this.shopping_cart.items.length; i++) {
            this.game.entities[0].inventory.removeItem(this.shopping_cart.items[i].item);
            this.shopping_cart.items[i].qty = 0;
        }
        this.game.entities[0].inventory.addCoin(this.shopping_cart.total);
        this.coin -= this.shopping_cart.total;
    }

    this.shopping_cart.total = 0;
    this.showWares();
    this.html_items[index].showItemMenu(false, this, index);
}

StorekeeperInventory.prototype.changeFocus = function (index) {
    if (this.html_items[index].element) {
        var element = this.html_items[index].element;
        if (this.html_items[index].item) {
            window.setTimeout(element.focus(), 0);
        } 
    }
    if (this.items[index]) {
        this.html_items[index].showItemMenu(true, this, index);
        // show qty of items in cart
        for (var i = 0; i < this.shopping_cart.items.length; i++) {
            if (this.shopping_cart.items[i].item.name === this.items[index].name) {
                var qty = this.shopping_cart.items[i].qty;
                this.quantity.innerHTML = "Qty: " + qty;
                this.item_price.innerHTML = "Price: " + qty * this.shopping_cart.items[i].item.price * this.shopping_cart.sale_back;
                this.total_price.innerHTML = "Total: " + this.shopping_cart.total * this.shopping_cart.sale_back;
                break;
            } else {
                this.quantity.innerHTML = "Qty: " + 0;
                this.item_price.innerHTML = "Price: " + 0; 
                this.total_price.innerHTML = "Total: " + this.shopping_cart.total * this.shopping_cart.sale_back;
            }
        }
    }
}

StorekeeperInventory.prototype.showWares = function () {
    if (!this.open) {
        var that = this; 
        //window.setTimeout(that.draw.bind(that), 0);
        this.draw(); 
        this.game.context.canvas.tabIndex = 0;
        this.interface.tabIndex = 2;
        this.interface.style.visibility = "visible";
        this.interface.style.display = "block";
        //window.setTimeout(that.changeFocus.call(that, 0), 0);
        this.changeFocus(0);
        this.open = true;
    } else {
        this.open = false;
        this.interface.style.visibility = "hidden";
        this.interface.style.display = "none";
        this.interface.tabIndex = 0;
        this.game.context.canvas.tabIndex = 1;
        this.game.context.canvas.focus();
    }
}

StorekeeperInventory.prototype.draw = function () {
    var that = this; 
    for (var i = 0; i < this.html_items.length; i++) {
        // get img of each item
        if (this.items[i]) {
            var img = this.items[i].img;
            this.html_items[i].element.innerHTML = img.outerHTML;
            if (this.items[i].qty && this.items[i].qty > 1) {
                var qty = document.createElement('p');
                qty.innerHTML = this.html_items[i].stock_qty;
                this.html_items[i].element.innerHTML += qty.outerHTML;
            }
            // set items html spot
            this.items[i].html = this.html_items[i];
            this.html_items[i].item = this.items[i];
            this.selectInput(i);
        } else {
            this.html_items[i].item = null;
            this.html_items[i].element.innerHTML = "";
            this.html_items[i].stock_qty = 0; 
        }
    }
    // draw coin amount
    if (this.game.entities[0]) {
        this.html_hero_coin.innerHTML = this.game.entities[0].inventory.coin;
        this.html_storekeeper_coin.innerHTML = this.coin;
    }
}

HTML_StoreItem = function (element, game) {
    this.game = game;
    this.element = element;
    this.item = null;
    this.stock_qty = 0; 
    this.menu = document.getElementById("storeitem_menu");
    this.itemName = document.getElementById("item_name");
    this.itemDescription = document.getElementById("item_description");
    // add elements for description of item
    this.return = document.createElement("a");
    this.return.setAttribute("id", "return2");
    this.return.innerHTML = "Return";
    //this.og_children = this.menu.children[0].children;
}

/* show the menu for the item or a description of the item when item is selected */
HTML_StoreItem.prototype.showItemMenu = function (flag, inventory, index) {
    if (flag && this.item) {
        this.inventory = inventory; 
        this.inventory.interface.tabIndex = 0;
        this.setItemDescription();
        this.menu.style.visibility = "visible";
        this.menu.style.display = "block";
        this.menu.tabIndex = 1;
    } else {
        this.menu.style.visibility = "hidden";
        this.menu.style.display = "none";
        this.menu.tabIndex = 0;
    }
}

HTML_StoreItem.prototype.setItemDescription = function () {
    this.itemName.innerHTML = this.item.name + "<br><hr>";
    this.itemDescription.innerHTML = this.item.description + "<br>";
    if (this.item.type) {
        if (this.item.stats.health !== 0) {
            this.itemDescription.innerHTML += "<br>Health: ";
            this.itemDescription.innerHTML += this.item.stats.health;
        }

        if (this.item.stats.attack !== 0) {
            this.itemDescription.innerHTML += "<br>Attack: ";
            this.itemDescription.innerHTML += this.item.stats.attack;
        }

        if (this.item.stats.defense !== 0) {
            this.itemDescription.innerHTML += "<br>Defense: ";
            this.itemDescription.innerHTML += this.item.stats.defense;
        }

        if (this.item.stats.strength !== 0) {
            this.itemDescription.innerHTML += "<br>STR: ";
            this.itemDescription.innerHTML += this.item.stats.strength;
        }
        
        if (this.item.stats.dexterity !== 0) {
            this.itemDescription.innerHTML += "<br>DEX: ";
            this.itemDescription.innerHTML += this.item.stats.dexterity;
        }
        
        if (this.item.stats.intelligence !== 0) {
            this.itemDescription.innerHTML += "<br>INT: ";
            this.itemDescription.innerHTML += this.item.stats.intelligence;
        }
    }
}

SoundManager = function (game) {
    this.curr_sound = null;
    this.game = game;
    this.world1 = document.getElementById("world_theme");
    this.world2 = document.getElementById("world_theme2");
    this.battle1 = document.getElementById("battle_theme");
    this.select = document.getElementById("selection_beep");
    this.coin = document.getElementById("coin_sound");
    this.door_open = document.getElementById("door_open");
    this.door_close = document.getElementById("door_close");
    this.nope = document.getElementById("nope");
    this.select.volume = .2;
    this.world1.volume = .1;
    this.world2.volume = .5;
    this.battle1.volume = .07;
    this.paused = false;
    this.sound = this.select;
    this.background = this.world1;
    //this.background.play();
}

SoundManager.prototype.playSound = function (sound) {
    this.sound.pause();
    this.sound.currentTime = 0;
    switch (sound) {
        case "select":
            this.sound = this.select;
            break;
        case "coin":
            this.sound = this.coin;
            break;
        case "door_open":
            this.sound = this.door_open;
            break;
        case "door_close":
            this.sound = this.door_close;
            break;
        case "nope":
            this.sound = this.nope;
            break;
        default:
            break;
    }
    this.sound.play();
}

SoundManager.prototype.toggleSound = function () {
    if (this.background.paused) {
        //this.background.play();
    }
    else {
        this.background.pause();
    }
}

SoundManager.prototype.pauseBackground = function()
{
    this.paused = true;
    this.background.pause();
}

SoundManager.prototype.playBackground = function()
{
    this.paused = false;
    //this.background.play();
}
SoundManager.prototype.toggleSound = function()
{
    if(this.background.paused)
    {
        this.paused = false;
        //this.background.play();
    }
    else
    {
        this.paused = true;
        this.background.pause();
    }
}
SoundManager.prototype.playSong = function(sound)
{
    this.background.pause();
    switch (sound) {
        case "world1":
            this.world1.currentTime = 0;
            this.background = this.world1;
            break;
        case "world2":
            this.world2.currentTime = 0;
            this.background = this.world2;
            break;
        case "battle":
            this.battle1.currentTime = 0;
            this.background = this.battle1;
            break;
        default:
            break;
    }
    if (!this.paused) {
        //this.background.play();
    }
}
