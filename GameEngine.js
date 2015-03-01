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
}

Animation.prototype.drawFrame = function (tick, context, x, y, scaleBy) {
    this.elapsedTime += tick;
    var scaleBy = scaleBy || 1;
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
    this.environment = [];
    this.current_environment = "dragon_cave";
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
}

GameEngine.prototype.init = function (context) {
    this.context = context;
    this.width = this.context.canvas.width;
    this.height = this.context.canvas.height;
    this.timer = new Timer();
    this.startInput();
    this.menu = new BattleMenu(document.getElementById("battle_menu"), this);
    this.menu.init();
    this.context.canvas.focus();
    this.esc_menu = new GeneralMenu(this);
    this.sound_manager = new SoundManager(this);
    this.stage = {
        part1: false, // part 1 will turn true after our hero kills the level 1 dragon
        part2: false,
        part3: false
    }
    this.loot_dispenser = new LootDispenser(this);
}

GameEngine.prototype.addEnvironment = function (name, environment_object) {
    this.environment[name] = environment_object;
}

GameEngine.prototype.startInput = function () {
    var that = this;
    //Temporary, space bar invokes attack

    this.context.canvas.addEventListener("keyup", function(e)
    {
        if(e.which === 16 && !that.is_battle)
        {
            that.canControl = false;
            that.key = 0;
            that.space = 0; 
            // lock user input controls here.
            that.entities[0].game.fadeOut(that.entities[0].game, that.entities[0].game, that.entities[0].game.setBattle);
            

        };
        //e.stopImmediatePropagation();
        e.preventDefault();
    });
    this.context.canvas.addEventListener('keydown', function (e) {
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
            } else if (e.which === 73) {
                that.key_i = true;
            }
        } else {
            that.key = 0;
            that.space = 0;
            that.esc = 0;
            that.key_i = false;
        }
        e.preventDefault();
    }, false);

    this.context.canvas.addEventListener('keyup', function (e) {
        that.key = 0;
        that.space = 0;
        that.esc = 0;
        that.key_i = false;
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

GameEngine.prototype.clearEntities = function (save_entities) {
    if (save_entities) {
        this.auxillary_sprites = this.entities.splice(1, this.entities.length - 1);
    }
    else {
        this.entities = [this.entities[0]];
    }
}

GameEngine.prototype.reLoadEntities = function () {
    var len = this.auxillary_sprites.length;
    for (var i = 0; i < len; i++) {
        this.entities.push(this.auxillary_sprites.pop());
    }
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
    this.queueActions();
    for (var i = 1; i < this.entities.length; i++) {
        if (this.entities[i].map_name === this.current_environment && !this.is_battle) {
            if (!this.is_battle) {
                if (this.entities[0].x - this.entities[i].x < 35 && !hero_drawn) {
                    if (this.entities[i].y < this.entities[0].y) {
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

            }



        }
        else if (this.is_battle) {

            this.entities[i].draw(this.context);
        }
    }
    if (!hero_drawn) {
        this.entities[0].draw(this.context);
    }
    if (drawCallBack) {
        drawCallBack(this);
    }
    this.context.restore();
}

GameEngine.prototype.queueActions = function () {
    if (this.is_battle) {
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
        }
    }, 50);

}
/*
Takes the main player as a parameter. Sets up the battle by setting is_battle to true,
setting the battle background, saving coordinates, and also generating a list or random fiends for the hero
*/
GameEngine.prototype.setBattle = function (game) {
    var player = game.entities[0];
    game.sound_manager.playSong("battle");
    game.is_battle = true;
    game.setBackground(game.environment[game.current_environment].getBattleBackground());
    player.save_x = game.entities[0].x;
    player.save_y = game.entities[0].y;
    player.save_direction = game.entities[0].direction;
    player.x = 350;
    player.y = 200;
    player.direction = Direction.LEFT;
    player.changeMoveAnimation();
    player.changeLocation();
    game.animation_queue.push(new Event(player, player.stop_move_animation, 0));
    game.fiends = game.environment[game.current_environment].generateFiend(game, game.fiends).splice(0);
    game.clearEntities(true);


    if (game.fiends.length === 1)
    {
        game.fiends[0].y = game.height / 2;
    }
    else if (game.fiends.length === 2)
    {
        game.fiends[0].y = (game.height / 2) - 40;
        game.fiends[0].x = game.fiends[0].x + 10;
        game.fiends[1].y = (game.height / 2) + 40;
        game.fiends[1].x = game.fiends[0].x - 20;
    }

    else if (game.fiends.length === 3)
    {
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
    //var space_out = ((game.height / 2) / (game.fiends.length - ((game.fiends.length - 1) * .2)) * .95);
    //var start_y = ((game.height / 2) / game.fiends.length) * .95;
    //var next_y = start_y;
    //var next_x = game.fiends[0].x;
    //for (var i = 0; i < game.fiends.length; i++) {
    //    game.fiends[i].y = next_y;
    //    next_y += space_out;
    //    game.fiends[i].x = next_x;
    //    next_x -= 25;
    //    game.addEntity(game.fiends[i]);
    //}
    game.decideFighters();
    window.setTimeout(game.esc_menu.showMenu(false), 5000);
    window.setTimeout(game.menu.showMenu(true), 5000);
}

/*
    Puts ending conditions for a battle including resetting is_battle to false,
    putting the player back to original position, 
    and for now resets the players health.
*/

GameEngine.prototype.endBattle = function (game)
{
    if (game.entities[0].checkKillQuest(game.entities[0]))
    {
        game.alertHero("You've completed the quest");
    }
    game.is_battle = false;
    game.menu.showMenu(false);
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
    game.sound_manager.playSong("world1");
    game.loot_dispenser.increment();
    game.loot_dispenser.dispenseLoot(game.entities[0]);
}

GameEngine.prototype.gameOver = function (game) {
    game.setBackground("./imgs/game_over.png");
    game.canControl = false;
    game.menu.showMenu(false);
    game.entities = [];
    window.setTimeout(game.esc_menu.showMenu(false), 5000);
}
/**
    checks if battle is over and invokes fadeOut by passing endBattle() to end the game and
    reset the hero to the world map
*/
GameEngine.prototype.battleOver = function (game) {
    var net_health_1 = 0;
    for (var i = 0 ; i < game.fiends.length; i++) {
        if (game.fiends[i]) {
            net_health_1 += game.fiends[i].stats.health;
        }
    }
    if (net_health_1 <= 0 || game.entities[0].stats.health <= 0) {
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
    for (var i = 0; i < this.entities.length * 10; i++) {
        fighter = i % this.entities.length;
        this.fight_queue.push(this.entities[fighter]);
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

LootDispenser = function (game) {
    this.encounters = 0;
    this.game = game;
}

LootDispenser.prototype.dispenseLoot = function (hero) {
    if (this.encounters % 6 === 0) {
        hero.recieveItem(new SpecialItem(this.game, "Key", ASSET_MANAGER.getAsset("./imgs/items/key.png"), 1, function () { }));
    }
}

LootDispenser.prototype.increment = function () {
    this.encounters++;
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
    this.direction = Direction.DOWN;
    this.save_direction = this.direction;
    this.moving = false;
    this.spriteSheet = spriteSheet;
    this.stats = stats;
    this.curr_anim = null;
    this.is_turn = false;
    this.is_targeted = false;
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
        this.changeCoordinates(.15, .15, .15, .15);
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
    context.moveTo(this.x + this.curr_anim.frameWidth, this.y - 8);
    context.lineTo(this.x + this.curr_anim.frameWidth - 10, this.y - 18);
    context.lineTo(this.x + this.curr_anim.frameWidth + 10, this.y - 18);
    context.lineTo(this.x + this.curr_anim.frameWidth, this.y - 8);
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
    context.rect(this.x + this.curr_anim.frameWidth / 3 + 15, this.y - 7, this.curr_anim.frameWidth, 5);
    context.fillStyle = 'red';
    context.fill();
    context.closePath();
    context.beginPath();
    context.rect(this.x + this.curr_anim.frameWidth / 3 + 15, this.y - 7, this.curr_anim.frameWidth * green, 5);
    context.fillStyle = 'green';
    context.fill();
    context.closePath();
}

Entity.prototype.doDamage = function (player, foes, game, is_multi_attack) {
    foes.stats.health = foes.stats.health - ((player.stats.attack / foes.stats.defense) * (Math.random() * 10));
    game.animation_queue.push(new Event(foes, foes.animations.hit));
    if (foes.stats.health <= 0) {
        foes.stats.health = 0;
        foes.is_dead = true;
        // check to see if foe is one for a kill quest
        var kill_quest_complete = this.game.entities[0].checkKillQuest(foes);
        // TODO: alert hero if kill_quest_complete AFTER battle fades out
        // use gameengine.alertHero(<dialog>); when world view is back in


        game.removeFighters(foes);
        if (is_multi_attack) {
            game.animation_queue.push(new Event(foes, foes.animations.death, 0));
        }
        else {
            game.animation_queue.push(new Event(foes, foes.animations.death, 1000));
            if (game.battleOver(game)) {
                game.canControl = false;
                if (game.is_battle) {
                    if (game.entities[0].stats.health <= 0) {
                        setTimeout(function () { game.fadeOut(game, game, game.gameOver); }, 5000);
                    }
                    else {
                        setTimeout(function () { game.fadeOut(game, game, game.endBattle); }, 5000);
                    }
                }
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
    if (!is_multi_attack && !game.battleOver(game)) {
        game.animation_queue.push(new Event(null, null, 500, game.setNextFighter, game));
    }


}

Entity.prototype.draw = function (context) {
    // code for NPCs and Enemies. 
}

Entity.prototype.update = function () {
    // code for NPCs and Enemies.
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
}

/* HERO and subclasses */
Hero = function (game, x, y, spriteSheet, animations, stats, turn_weight) {
    Entity.call(this, game, x, y, spriteSheet, animations, stats);
    this.width = 43;
    this.height = 64;
    this.sight = 30; // this is how far the hero can interact. interactables (items or npcs) must be within this range (in pixels) for the space bar to
    // pick up on any interaction. 
    this.fleeing = false;
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
        if (ent_distance < min_distance && Interactable.prototype.startInteraction.call(this.game.environment[this.game.current_environment].interactables[i])) {
            min_distance = ent_distance;
            min_index = i;
        }
    }
    for (var i = 0; i < this.game.environment[this.game.current_environment].interactables.length; i++) {
        var ent_x_difference = Math.abs((this.game.environment[this.game.current_environment].interactables[i].x) - (this.x + 5));
        var ent_y_difference = Math.abs((this.game.environment[this.game.current_environment].interactables[i].y) - (this.y + 45));
        var ent_distance = Math.sqrt(Math.pow(ent_x_difference, 2) + Math.pow(ent_y_difference, 2));
        if (ent_distance < min_distance && Interactable.prototype.startInteraction.call(this.game.environment[this.game.current_environment].interactables[i])) {
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

Hero.prototype.draw = function (context) {
    //if the game is not in battle, draw regular move animations
    if (!this.game.is_battle) {
        this.curr_anim.drawFrame(this.game.clockTick, context, this.x, this.y);
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
                if (this.game.is_battle) {
                    this.game.fadeOut(this.game, this.game, this.game.endBattle);
                }
            }
        }
        if (this.game.fiends.length > 0 && this.game.fiends[0].name === "dragon1") {

            this.curr_anim.drawFrame(this.game.clockTick, context, this.x, this.y, 1.2);
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

    if (Math.abs(distance_traveled) > 100) {
        var x = 8;
        return Math.ceil(Math.random() * (4000 - 0) - 0) >= 3994;
    }
}

Hero.prototype.update = function () {

    if (!this.game.is_battle) {
            
    this.changeDirection();
    this.changeMoveAnimation();
    this.changeLocation();
    if (this.game.environment[this.game.current_environment].curr_quadrant != 0 && this.game.environment[this.game.current_environment].curr_quadrant != 3) {
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
        this.game.fadeOut(this.game, this.game, this.game.setBattle);
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
    return this.x + 20 < 0;
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
    } else if (this.boundaryDown() && this.game.current_environment !== "dragon_cave") {
        if (quadrant !== 3 && quadrant !== 4 && quadrant !== 5) {
            this.game.environment[this.game.current_environment].setQuadrant(this.game.environment[this.game.current_environment].curr_quadrant += 3);
            this.y -= 11 * 32;
        }
    }
}

// returns the number associated with the tile that the hero is standing on. used for collision purposes.
Hero.prototype.getTile = function (x, y, num) {
    if (this.game.environment[this.game.current_environment].map.length === 2) {
       return this.game.environment[this.game.current_environment].map[num][y][x];

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
    } else {
        return true;
    }
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
    this.x = 10;
    this.y = 215;

    this.quests = [];

    this.inventory = new Inventory(this.game, 100, 20);
    Hero.call(this, this.game, this.x, this.y, this.spriteSheet, this.animations, stats);
}

Warrior.prototype = new Hero();
Warrior.prototype.constructor = Warrior;

Warrior.prototype.draw = function (context) {
    Hero.prototype.draw.call(this, context);
}

Warrior.prototype.update = function () {
    this.inventory.update();
    Hero.prototype.update.call(this);
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
            if (this.quests[i].number_enemies === this.quests[i].enemies_killed) {
                this.quests[i].complete = true;

                complete = true; 
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
Enemy = function (game, stats, anims, spriteSheet, name) {
    this.x = 40;
    this.y = 150;
    Entity.call(this, game, this.x, this.y, spriteSheet, anims, stats);
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
    if (this.name === "dragon1") {

            this.curr_anim.drawFrame(this.game.clockTick, context, this.x, this.y, 2.0);
    }

    else
    {
        this.curr_anim.drawFrame(this.game.clockTick, context, this.x, this.y, 1.5);
    }
}

Enemy.prototype.update = function () {
    if (this.game.fight_queue[0].id === this.id && this.is_turn) {
        this.setAction("Single", this.game.entities[0]);
        this.is_turn = false;
    }
}

Enemy.prototype.hit = function () {

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

Skeleton = function (game, stats, loop_while_standing) {
    this.game = game;
    this.spriteSheet = ASSET_MANAGER.getAsset("./imgs/skeleton.png");
    this.animations = {
        down: new Animation(this.spriteSheet, 0, 10, 64, 64, 0.05, 9, true, false),
        up: new Animation(this.spriteSheet, 0, 8, 64, 64, 0.05, 9, true, false),
        left: new Animation(this.spriteSheet, 0, 9, 64, 64, 0.05, 9, true, false),
        right: new Animation(this.spriteSheet, 0, 11, 64, 64, 0.05, 9, true, false),
        destroy: new Animation(this.spriteSheet, 0, 3, 64, 64, 0.1, 7, true, false),
        hit: new Animation(this.spriteSheet, 0, 20, 64, 64, 0.08, 5, true, false),
        death: new Animation(this.spriteSheet, 0, 21, 64, 64, 0.5, 1, true, false)
    };
    Enemy.call(this, this.game, stats, this.animations, this.spriteSheet, "skeleton");
}

Skeleton.prototype = new Enemy();
Skeleton.prototype.constructor = Enemy;



Malboro = function(game, stats, loop_while_standing)
{
    this.game = game;
    this.spriteSheet = ASSET_MANAGER.getAsset("./imgs/malboro.png");
    this.animations = {
        down: null,
        up: null,
        left: null,
        right: new Animation(this.spriteSheet, 0, 0, 82, 91, 0.05, 3, true, false),
        destroy: new Animation(this.spriteSheet, 0, 1, 82, 91, 0.1, 7, true, false),
        hit: new Animation(this.spriteSheet, 0, 2, 82, 91, 0.1, 3, true, false),
        death: new Animation(this.spriteSheet, 0, 3, 82, 91, 0.1, 1, true, false)
    };
    Enemy.call(this, this.game, stats, this.animations, this.spriteSheet, "malboro");
}

Malboro.prototype = new Enemy();
Malboro.prototype.constructor = Enemy;


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
    Enemy.call(this, this.game, stats, this.animations, this.spriteSheet, "dragon1");
}

Dragon1.prototype = new Enemy();
Dragon1.prototype.constructor = Enemy;
/* NPC 
game : the game engine
dialogue : array of strings which will be used as the NPC's dialogue
anims : a SpriteSet object with the characters full set of animations
path : an array of Points which will determine the path that the NPC will take. pass in one point for the NPC to stand still
pause : whether the NPC will rest for 1 second once it reaches one of its points*/
NPC = function (game, dialogue, anims, path, speed, pause, quad, map_name) {
    if (game && dialogue && anims && path) {
        this.game = game;
        this.scale = 1;
        this.map_name = map_name; 
        this.animations = anims;
        this.spriteSheet = this.animations.right.spriteSheet;

        //next variables for the npc's path
        this.path = path;
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
                if (this.y - this.next_point.getY() < this.speed) {
                    this.changeCoordinates(0, this.speed, 0, 0);
                }
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
            if (this.dialogue_index < this.dialogue.length - 1) {
                this.dialogue_index++;
                text.innerHTML = this.dialogue[this.dialogue_index];
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
        text.innerHTML = this.dialogue[this.dialogue_index];
        text_box.innerHTML = text.outerHTML;
        text_box.style.visibility = "visible";
        text_box.style.display = "block";
        this.game.context.canvas.tabIndex = 0;
        text_box.tabIndex = 1;
        text_box.focus();
        this.interacting = true;
        this.game.canControl = false;
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


NPC_QUEST = function(game, name, dialog, anims, path, speed, pause, quad, quest, map_name) {
    this.name = name;
    this.quest = quest; 
    NPC.call(this, game, dialog, anims, path, speed, pause, quad, map_name);
}

NPC_QUEST.prototype = new NPC();
NPC_QUEST.prototype.constructor = NPC_QUEST;


/* QUEST OBJECT abstract class
 Parameters: giverName (who gave the quest), 
             reward (what the reward is for finishing that quest)
			 game (the game engine)			 
*/

QUEST = function (game, giverName, reward) {
    this.game = game;
    this.giverName = giverName;
    this.reward = reward;
    this.complete = false;
    if (this.complete) { // if the quest has been complete
        this.game.alertHero("Your mission is complete, dear young hero!");
    }
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

Environment = function (game, map, animations, tilesheet, quads, interactables, name, battle_background, fiends) {
    this.game = game;
    // "Map" will be a double array of integer values. 
    this.map = map;
    this.animations = animations;
    this.tileSheet = tilesheet;
    this.quads = quads;
    this.name = name;
    this.curr_quadrant = 0;
    this.fiends = fiends;
    this.battle_background = battle_background;
    this.interactables = interactables;
    //Environment.initInteractables.call(this, this.interactables);
}

Environment.prototype.getBattleBackground = function()
{
    return this.battle_background;
}
EnvironmentAnimation = function (animation, coords, quads) {
    this.animation = animation;
    this.coords = coords;
    this.quads = quads;
}

OutdoorEnvironment = function (game, map, indoor_maps, animations, tilesheet, quads, interactables, fiends, name, battle_background) {
    this.indoor_maps = indoor_maps;
    this.fiends = fiends;
    Environment.call(this, game, map, animations, tilesheet, quads, interactables, name, battle_background, fiends);
    this.addIndoorEnvironments();
}

OutdoorEnvironment.prototype = new Environment();
OutdoorEnvironment.prototype.constructor = OutdoorEnvironment;

OutdoorEnvironment.prototype.addIndoorEnvironments = function () {
    for (var i = 0; i < this.indoor_maps.length; i++) {
        this.game.addEnvironment(this.indoor_maps[i].name, this.indoor_maps[i]);
    }
}

IndoorEnvironment = function (game, map, animations, tilesheet, quads, interactables, name, battle_background, fiends) {
    this.fiends = fiends;
    Environment.call(this, game, map, animations, tilesheet, quads, interactables, name, battle_background, fiends);
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
}

Log.prototype = new Interactable();
Log.prototype.constructor = Log;

Log.prototype.startInteraction = function () {
    if (Interactable.prototype.startInteraction.call(this)) {
        if (this.game.entities[0].inventory.hasItem("Ax", 1)) {
            this.game.alertHero("You use your ax to break the log!");
            var loc_point = this.game.changeXYForQuad(new Point(this.x / 32, this.y / 32), 4);
            var ax = this.game.entities[0].inventory.getItem("Ax");
            ax.doAction();
            this.game.environment[this.game.current_environment].map[loc_point.y][loc_point.x] = 0;
            this.game.environment[this.game.current_environment].map[loc_point.y][loc_point.x - 1] = 0;
        } else {
            this.game.alertHero("This log requires an ax to break.");
        }
    }
}

// PORTAL FUNCTIONS 
EnterDragonCave = function () {
    if (this.game.entities[0].inventory.hasItem("King Arthur's Rock")) {
        this.game.current_environment = "dragon_cave";
        this.game.environment[this.game.current_environment].setQuadrant(0);
        this.game.entities[0].x = 32;

        this.game.entities[0].y = 200;
    } else {
        this.game.alertHero("There -must- be some way into this mountain. Perhaps through some hidden cave.");
    }
}

ExitDragonCave = function () {
    this.game.current_environment = "level1";
    this.game.environment[this.game.current_environment].setQuadrant(5);
    this.game.entities[0].x = 512;

    this.game.entities[0].y = 192;
}

TalkToDragon = function () {

}

// used to change maps or to initiate special battles. 
Portal = function (x, y, quad, game, func) {
    this.func = func; 
    Interactable.call(this, x, y, quad, game);
}

Portal.prototype = new Interactable();
Portal.prototype.constructor = Portal;

Portal.prototype.startInteraction = function () {
    this.func();
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
        if (this.game.stage.part2) {
            this.locked = false;
        }

        if (this.locked) {
            if (this.game.stage.part1) {
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
                    var key = this.game.entities[0].inventory.removeItem("Key", 1);
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
            this.game.environment[this.game.current_environment].map[loc_point.y][loc_point.x] = 100;
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
    this.berry = new Potion(this.game, "Heal Berry", 10, 1, ASSET_MANAGER.getAsset("./imgs/items/heal_berry.png"), "health", 1);

    Interactable.call(this, x, y, quad, game);
}

HealBerry.prototype = new Interactable();
HealBerry.prototype.constructor = HealBerry;

HealBerry.prototype.startInteraction = function () {
    if (Interactable.prototype.startInteraction.call(this)) {
        var x = this.x / 32;
        var y = this.y / 32;
        var loc_point = this.game.changeXYForQuad(new Point(x, y), this.quad);

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

Environment.prototype.initNewFiend = function (fiend) {
    switch (fiend) {
        case "Skeleton":
            return (new Skeleton(this.game, new Statistics(50, 10, 5), false));
            break;
        case "Malboro":
            return (new Malboro(this.game, new Statistics(75, 15, 10), false));
            break;
        case "Dragon1":
            return (new Dragon1(this.game, new Statistics(250, 30, 40), true));
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
        if (includes(this.animations[i].quads, this.curr_quadrant)) {
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

//Environment.prototype.drawFlames = function () {
//    // draw flames
//    if (this.curr_quadrant === 0) {
//        for (var i = 0; i < this.flame1_locations.length; i++) {
//            var x = this.flame1_locations[i][0];
//            var y = this.flame1_locations[i][1];
//            this.flame1_animation.drawFrame(this.game.clockTick, this.context, x * 32, y * 32 - 32, 1.3);
//        }
//        for (var i = 0; i < this.flame2_locations.length; i++) {
//            var x = this.flame2_locations[i][0];
//            var y = this.flame2_locations[i][1];
//            this.flame2_animation.drawFrame(this.game.clockTick, this.context, x * 32, y * 32, 1.3);
//        }
//    } else if (this.curr_quadrant === 3) {
//        for (var i = 0; i < this.flame3_locations.length; i++) {
//            var x = this.flame3_locations[i][0];
//            var y = this.flame3_locations[i][1];
//            this.flame1_animation.drawFrame(this.game.clockTick, this.context, x * 32, y * 32 - 32, 1.3);
//        }
//        for (var i = 0; i < this.flame4_locations.length; i++) {
//            var x = this.flame4_locations[i][0];
//            var y = this.flame4_locations[i][1];
//            this.flame2_animation.drawFrame(this.game.clockTick, this.context, x * 32, y * 32, 1.3);
//        }
//    }
//}

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

UseItemMenu.prototype.showMenu = function () {
    if (!this.open) {
        this.game.context.canvas.tabIndex = 0;
        this.menu.tabIndex = 1;
        this.menu.style.display = "block";
        this.menu.style.visibility = "visible";

        this.parent.menu.tabIndex = 0;
        this.parent.attack.tabIndex = 0;
        this.parent.use_item.tabIndex = 0;
        this.parent.flee.tabIndex = 0;
        this.updateItems();
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

UseItemMenu.prototype.updateItems = function () {
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
        this.list_items[i].input();
    }
}

List_item = function (game, item, index) {
    this.game = game;
    this.item = item;
    this.html = null;
    this.index = index;
}

List_item.prototype.input = function () {
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
            that.item.doAction();
            //window.setTimeout(that.item.doAction(), 0);
            that.game.menu.use_item_list.updateItems();
            window.setTimeout(that.game.menu.use_item_list.showMenu(), 0);
        } else if (e.which === 27) {
            window.setTimeout(that.game.menu.use_item_list.showMenu(), 0);
        }
        e.stopImmediatePropagation();
        e.preventDefault();
    }, false);
}

BattleMenu.prototype.init = function () {
    var that = this;


    this.attack.addEventListener("keydown", function (e) {
        if (that.game.entities[0].is_turn && that.game.canControl) {
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
        this.pressed = false;
        if (e.which === 40) {
            window.setTimeout(that.flee.focus(), 0);
        } else if (e.which === 38) {
            window.setTimeout(that.attack.focus(), 0);
        } else if (String.fromCharCode(e.which) === ' ') {
            if (that.use_item_list.hasUsuableItems()) {
                that.use_item_list.showMenu();
            }
        }

        e.preventDefault();
        e.stopImmediatePropagation();
    }, false);
    this.use_item.addEventListener("keyup", function (e) {
        this.pressed = false;
    }, false);
    this.flee.addEventListener("keydown", function (e) {
        if (that.game.entities[0].is_turn) {
            if (e.which === 38) {
                window.setTimeout(that.use_item.focus(), 0);
            } else if (String.fromCharCode(e.which) === ' ') {
                if (that.game.entities[0].is_turn) {
                    that.game.entities[0].is_turn = false;
                    that.game.entities[0].flee(true);
                }
                // characters flee
            }
        }
        e.preventDefault();
    });

    // ATTACK MENU CONTROLS 
    this.single_attack.addEventListener("keydown", function (e) {
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
                if (that.game.entities[0].is_turn) {
                    if (that.game.fight_queue[0]) {
                        that.game.fight_queue[0].setAction("Single", [that.game.fiends[that.next_target]]);
                        if (that.game.fiends[that.next_target]) {
                            that.game.fiends[that.next_target].is_targeted = false;
                        }
                        that.is_selecting = false;
                        that.game.entities[0].is_turn = false;
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
        e.preventDefault();
    });

    this.aoe_attack.addEventListener("keydown", function (e) {
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
                if (that.game.entities[0].is_turn) {
                    if (that.game.fight_queue[0]) {
                        that.game.fight_queue[0].setAction("Sweep", that.game.fiends);
                        for (var i = 0; i < that.game.fiends.length; i++) {
                            if (that.game.fiends[i]) {
                                that.game.fiends[i].is_targeted = false;
                            }
                        }
                        that.is_selecting = false;
                        that.game.entities[0].is_turn = false;
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
        e.preventDefault();
    });

    this.back.addEventListener("keydown", function (e) {
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

BattleMenu.prototype.showMenu = function (flag) {
    this.target_queue = [];
    for (var i = 0; i < this.game.fiends.length; i++) {
        this.target_queue.push(this.game.fiends[i]);
    }
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
            that.hero.inventory.showInventory.call(that.hero.inventory);
        }
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
	this.lastX = this.x;
	}
	
Ghost.prototype = new NPC_QUEST();
Ghost.prototype.constructor = Ghost;

Ghost.prototype.startInteraction = function () {
    if (this.game.stage.part1 === false) {
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
                if (this.part===1&&this.game.entities[0].inventory.hasItem("Potion")) {

                    this.game.entities[0].inventory.removeItem("Potion", 1);
                    this.game.entities[0].inventory.addItem(this.quest.reward);
                    this.part++; 
					console.log("reward added"+ this.part);
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
Storekeeper = function (game, name, dialog, anims, path, speed, pause, quad, quest, map_name) {

    this.part = 0; 

    NPC_QUEST.call(this, game, name, dialog, anims, path, speed, pause, quad, quest, map_name);
    this.curr_anim = this.animations.down;
    this.lastX = this.x;
}

Storekeeper.prototype = new NPC_QUEST();
Storekeeper.prototype.constructor = Storekeeper;

Storekeeper.prototype.startInteraction = function () {
    if (this.game.stage.part1 === false) {
        // if before dragon is dead, have storekeeper give hero a quest. 
        this.showDialog();
    } else {
        // after dragon is dead, show wares to the hero.
        this.showWares();
    }
}

Storekeeper.prototype.showDialog = function () {
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
                    this.game.entities[0].addQuest(this.quest);
                }
                if (this.part === 2) {
                    this.game.entities[0].inventory.addItem(this.quest.reward);
                    this.part++;
                } else if (this.part === 3) {
                    this.part++;
                }
            }
            this.game.next = false;
        }
    }
}

Storekeeper.prototype.draw = function (context) {
    if (this.game.environment[this.game.current_environment].curr_quadrant === 3) {
        this.x = 485;
        this.curr_anim.drawFrame(this.game.clockTick, context, this.x, this.y, 1.2);
    } else if (this.game.environment[this.game.current_environment].curr_quadrant === 4) {
        this.x = 133;
        this.curr_anim.drawFrame(this.game.clockTick, context, this.x, this.y, 1.2);
    }
}

Storekeeper.prototype.showWares = function (flag) {
    if (flag) {

    } else {

    }
}

/*WITCH NPC_QUEST with KILL_QUEST
*/
Witch = function (game, name, dialog, anims, path, speed, pause, quad, quest, map_name) {

    this.part = 0; 
    NPC_QUEST.call(this, game, name, dialog, anims, path, speed, pause, quad, quest, map_name);
    this.curr_anim = this.animations.down;
    this.lastX = this.x;
}

Witch.prototype = new NPC_QUEST();
Witch.prototype.constructor = Witch;

Witch.prototype.startInteraction = function () {
    if (this.game.stage.part1 === false) {
        // if before dragon is dead, have Witch give hero a quest. 
        this.showDialog();
    } 
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
    if (this.part === 0) {
        text.innerHTML = this.dialogue[this.part][this.dialogue_index];
    }
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

//Storekeeper.prototype.requestSale = function (buyer, item_name, qty) {
//    var item = null;
//    if (buyer.deductCoin()) {
//        this.items.splice(item.name, 1);
//        item = this.items[item_name];
//        if (this.items[item_name].qty === qty) {
//            this.items.splice(item_name, 1);
//        } else {
//            item.decreaseQty(item.qty);
//            item.increaseQty(qty);
//            this.items[item_name].decreaseQty(qty);
//        }
//        buyer.recieveItem(item);
//    } else {
//        // TODO make shopkeeper say something about not having enough money to buy the item. 
//    }
//}

//Storekeeper.prototype.initializeItems = function (items) {
//    for (var i = 0; i < items.length; i++) {
//        this.items[items[i].name] = items[i];
//    }
//}

Item = function (game, name, price, qty, img) {
    this.game = game;
    this.name = name;
    this.price = price;
    this.qty = qty;
    this.img = img;
    this.isStackable = true;
    this.html = null;
    this.usable = false;
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

UsableItem = function (game, name, price, qty, img) {
    Item.call(this, game, name, price, qty, img);
    this.usable = true;
    this.isEquipped = false;
}

UsableItem.prototype = new Item();
UsableItem.prototype.constructor = UsableItem;


// Special items are not equipable, stackable, or usable in the normal sense, and they do not have a sale price.
// special items have a number of uses and when they run out, the item will remove itself from the hero's inventory
// actionFunction is the "doAction" function for special item, pass in whatever you need the item to do. 
SpecialItem = function (game, name, img, uses, actionFunction) {
    UsableItem.call(this, game, name, 0, 1, img);
    this.isStackable = false;
    this.isEquipped = false;
    this.uses = uses;
    this.actionFunction = actionFunction;
    this.usable = false;
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
Potion = function (game, name, price, qty, img, type, level) {
    this.potion_type = type;
    this.level = level;
    UsableItem.call(this, game, name, price, qty, img);
}

Potion.prototype = new UsableItem();
Potion.prototype.constructor = Potion;

Potion.prototype.doAction = function () {
    switch (this.potion_type) {
        case "health":
            this.game.entities[0].health += this.level * 25;
            break;
        case "stam":

            break;
        case "mana":

            break;
        case "str":
            this.game.entities[0].strength += this.level * 1;
            break;
        case "dex":
            this.game.entities[0].dexterity += this.level * 1;
            break;
        case "int":
            this.game.entities[0].intelligence += this.level * 1;
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
    this.og_children = this.menu.children[0].children;
}

HTML_Item.prototype.showItemMenu = function (flag, inventory, index) {
    this.index = index;
    if (flag && this.item) {
        inventory.interface.tabIndex = 0;
        this.menu.style.visibility = "visible";
        this.menu.style.display = "block";
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




Armor = function (game, name, price, img, type, stats) {
    this.isEquipped = false;
    this.type = type;
    this.slot = document.getElementById("equip_" + type);
    this.background_img = this.slot.style.backgroundImage;
    Item.call(this, game, name, price, 1, img);
    this.isStackable = false;
    this.stats = stats;
}

Armor.prototype = new Item();
Armor.prototype.constructor = Armor;

Armor.prototype.doAction = function () {
    this.unequipOldArmor();
    // equip new item
    if (this.isEquipped) {
        this.slot.style.backgroundImage = this.background_img;
        this.slot.innerHTML = "";
        this.game.entities[0].inventory.equipped[this.type] = false;
        this.isEquipped = false;
    } else {
        this.slot.style.backgroundImage = "none";
        this.slot.innerHTML = this.img.outerHTML;
        this.game.entities[0].inventory.equipped[this.type] = this;
        this.isEquipped = true;
    }
}

Armor.prototype.unequipOldArmor = function (bool) {
    if (bool) {
        this.isEquipped = false;
        this.slot.style.backgroundImage = this.background_img;
        this.slot.innerHTML = "";
        this.game.entities[0].inventory.equipped[this.type] = false;
    } else {
        // check if item is already equipped
        if (this.game.entities[0].inventory.equipped[this.type] &&
            this.game.entities[0].inventory.equipped[this.type] !== this) {
            var old_item = this.game.entities[0].inventory.equipped[this.type];
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
    this.inventory.addItem(item);
}

Warrior.prototype.removeItem = function (item_name, qty) {
    return this.inventory.removeItem(item_name, qty);
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
    this.equipped = {
        armor: false,
        accessory: false,
        offhand: false,
        mainhand: false
    }
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
            found = true;
        }
    }
    return found;
}

Inventory.prototype.showInventory = function (flag) {
    if (this.open === false) {
        this.game.context.canvas.tabIndex = 0;
        this.interface.tabIndex = 2;
        this.interface.style.visibility = "visible";
        this.interface.style.display = "block";
        this.html_items[0].element.focus();
        this.open = true;
        this.game.key_i = 0;
    } else {
        this.open = false;
        this.interface.style.visibility = "hidden";
        this.interface.style.display = "none";
        this.interface.tabIndex = 0;
        this.game.context.canvas.tabIndex = 1;
        this.game.context.canvas.focus();
        this.game.key_i = 0;
    }
}

HTML_Item.prototype.updateShowItemMenu = function () {
    var that = this;
    this.element.addEventListener("keydown", function (e) {
        if (String.fromCharCode(e.which) === ' ') {
            that.showItemMenu(true, that.game.entities[0].inventory);
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
            this.html_items[i].actionInput();
            this.html_items[i].updateShowItemMenu();
        } else {
            this.html_items[i].item = null;
            this.html_items[i].element.innerHTML = "";
        }
    }
    // draw coin amount
    this.html_coin.innerHTML = this.coin;

}

Inventory.prototype.update = function () {
    if (this.game.key_i) {
        this.showInventory();
    } else if (this.game.esc) {
        this.showInventory();
    }
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
    this.draw.call(this);
}

// will return false if item can't be removed either because it doesn't exist in inventory or there aren't enough of the item to remove (qty too low) 
// otherwise it will return the item 
Inventory.prototype.removeItem = function (item_name, qty) {
    var item = false;
    for (var i = 0; i < this.items.length; i++) {
        if (this.items[i].name === item_name) {
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
    this.draw.call(this);
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
    }
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
                    that.showInventory();
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
                    that.item.game.entities[0].inventory.removeItem(that.item.name, that.item.qty);
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
}

SoundManager = function (game) {
    this.curr_sound = null;
    this.game = game;
    this.world1 = document.getElementById("world_theme");
    this.battle1 = document.getElementById("battle_theme");
    this.paused = false;
    this.background = this.world1;
    //this.background.play();
}

SoundManager.prototype.playSound = function (sound) {
    switch (sound) {
        case "door":
            this.sound = this.door;
            break;
        default:
            break;
    }
}

SoundManager.prototype.toggleSound = function () {
    if (this.background.paused) {
        this.background.play();
    }
    else {
        this.background.pause();
    }
}

SoundManager.prototype.toggleSound = function()
{
    if(this.background.paused)
    {
        this.background.play();
    }
    else
    {
        this.background.pause();
    }
}
SoundManager.prototype.playSong = function(sound)
{
    this.background.pause();
    switch (sound) {
        case "world1":
            this.background = this.world1;
            break;
        case "door":
            this.curr_sound = this.door;
            break;
        case "battle":
            this.background = this.battle1;
            break;
        default:
            break;
    }
    this.background.play();
}
