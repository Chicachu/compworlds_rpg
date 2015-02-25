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


//sound part
sounds.load([
//  "sounds/AncientForest.wav"
]);

sounds.whenLoaded = setup;

function setup() {
    console.log("sounds loaded");

    //Create the sounds
    var music = sounds["sounds/AncientForest.wav"]

    //Make the music loop
    music.loop = true;

    //Set the pan to the left
    music.pan = -0.8;

    //Set the music volume
    music.volume = 0.5;

    //Set a reverb effect on the bounce sound
    //arguments: duration, decay, reverse?
    //music.setReverb(2, 2, false);

    //Set the sound's `reverb` property to `false` to turn it off
    //music.reverb = false;

    //Optionally set the music playback rate to half speed
    //music.playbackRate = 0.5;

    // if (game is not battle?)
    if (true) {
        music.play();
    } else {
        music.pause();
    }



    //Capture the keyboard events
    //var k = keyboard(75);
    //l = keyboard(76);

    ////Control the sounds based on which keys are pressed

    ////Play the loaded music sound
    //k.press = function () {
    //    if (!music.isPlaying) music.play();
    //    if (music.pause) music.restart();
    //    console.log("music playing");
    //};

    ////Pause the music 
    //l.press = function () {
    //    music.pause();
    //    console.log("music paused");
    //};
}
//end sound part

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
    this.environment = null;
    this.canControl = true;
    this.animation_queue = [];
    this.event = null;
    this.auxillary_sprites = [];
    this.fight_queue = [];
    this.fiends = [];
    this.next = false; // used to detect space when advancing dialogue with NPCs.
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
    this.environment = new Environment(this);
    this.esc_menu = new GeneralMenu(this);
}
GameEngine.prototype.startInput = function () {
    var that = this;
    //Temporary, space bar invokes attack
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
            that.key_i = 0;
        }
        e.preventDefault();
    }, false);


    this.context.canvas.addEventListener('keyup', function (e) {
        that.key = 0;
        that.space = 0;
        that.esc = 0;
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

GameEngine.prototype.clearEntities = function(save_entities)
{
    //for(var i = 1; i < this.entities.length; i++)
    //{
        if (save_entities) {
            this.auxillary_sprites = this.entities.splice(1, this.entities.length - 1);
        }
        else {
            this.entities = [this.entities[0]];
        }
    //}
}

GameEngine.prototype.reLoadEntities = function()
{
    for(var i = 0; i < this.auxillary_sprites.length; i++)
    {
        this.entities.push(this.auxillary_sprites.pop());
    }
}
GameEngine.prototype.addAuxillaryEntity = function(entity)
{
    this.auxillary_sprites.push(entity);
}
GameEngine.prototype.draw = function (drawCallBack) {
    this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
    this.context.save();
    if (this.curr_background && this.is_battle) {
        this.context.drawImage(this.curr_background, 0, 0);
    } else {
        this.environment.draw(1);
    }
    this.queueActions();
    for (var i = 0; i < this.entities.length; i++) {
        this.entities[i].draw(this.context);
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
            event.entity.setAnimation(event.animation);
        }
        //If event is not null, check if the current event has gone through a full loop
        if (event) {
            if (event.entity.curr_anim.looped) {
                if (this.animation_queue.length >= 0) {
                    //if loop has been made, dequeue off the queue and set it to event

                    //Sets the events entitiy's animation
                    if (event.wait && !event.hanging) {
                        var that = this;
                        var that_event = event;
                        event.hanging = true;
                        event.hang_timer = setTimeout(function () {
                            that_event.hanging = false;
                            that_event.executeCallback();
                            clearInterval(that_event.hang_timer);
                            that_event = that.animation_queue.shift();
                            that_event.entity.setAnimation(that_event.animation);
                            that_event.entity.curr_anim.looped = false;
                        }, event.wait);
                    }
                    else if (!event.hanging) {
                        event.executeCallback();
                        event = this.animation_queue.shift();
                        event.entity.setAnimation(event.animation);
                        event.entity.curr_anim.looped = false;
                    }

                }
                else {
                    event.entity.setAnimation(event.entity.stop_move_animation);
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
    game.is_battle = true;
    game.setBackground("./imgs/woods.png");
    game.entities[0].save_x = game.entities[0].x;
    game.entities[0].save_y = game.entities[0].y;
    game.entities[0].save_direction = game.entities[0].direction;
    game.entities[0].x = 300;
    game.entities[0].y = 200;
    game.entities[0].direction = Direction.LEFT;
    game.fiends = game.environment.generateFiend(game, game.fiends).splice(0);
    game.clearEntities(true);
    var space_out = ((game.height / 2) / game.fiends.length) * 1.2;
    var next_y = space_out;
    for (var i = 0; i < game.fiends.length; i++) {
        game.fiends[i].y = next_y;
        next_y += space_out;
        game.addEntity(game.fiends[i]);
    }
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
    game.is_battle = false;
    window.setTimeout(game.menu.showMenu(false), 5000);
    window.setTimeout(game.menu.showMenu(false), 5000);
    game.entities[0].x = game.entities[0].save_x;
    game.entities[0].y = game.entities[0].save_y;
    game.entities[0].direction = game.entities[0].save_direction;
    game.clearEntities(false);
    game.reLoadEntities();
    game.fiends = [];
    game.fight_queue = [];
    game.animation_queue = [];
}
/**
    checks if battle is over and invokes fadeOut by passing endBattle() to end the game and
    reset the hero to the world map
*/
GameEngine.prototype.battleOver = function (game) {
    var net_health_1 = 0;
    for (var i = 0 ; i < game.fiends.length; i++) {
        net_health_1 += game.fiends[i].stats.health;
    }
        //net_health_1 = game.fiends[0].stats.health;
        if (net_health_1 <= 0) {
            game.canControl = false;
            //players[1].game.animation_queue.push(new Event(players[1], players[1].animations.death));
            game.timerId2 = setTimeout(function () {
                game.fadeOut(game, game, game.endBattle);
                clearInterval(game.timerId2);
            }, 2000);
        }

}

GameEngine.prototype.decideFighters = function()
{
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
    for(var i = 0; i < this.entities.length * 10; i++)
    {
        fighter = i % this.entities.length;
        this.fight_queue.push(this.entities[fighter]);
    }
    this.fight_queue[0].is_turn = true;
}

GameEngine.prototype.removeFighters = function(player)
{
    for(var i = 0; i < this.fight_queue.length; i++)
    {
        if(this.fight_queue[i].id === player.id)
        {
            this.fight_queue.splice(i, 1);
        }
    }
}

GameEngine.prototype.setNextFighter = function()
{
    this.fight_queue.shift();
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
Event = function(entity, animation, wait, callback, args)
{
    this.entity = entity;
    this.animation = animation;
    this.wait = wait;
    this.hang_timer = null;
    this.hanging = false;
    this.callback = callback;
    this.args = args;
}

Event.prototype.executeCallback = function()
{
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
        this.changeCoordinates(.5, .5, .5, .5);
    } else {
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

Entity.prototype.drawHealthBar = function(context)
{
    if (this.stats.health < 0)
    {
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

Entity.prototype.doDamage = function(args)
{
    args[1].stats.health = args[1].stats.health - ((args[0].stats.attack / args[1].stats.defense) * (Math.random() * 10));
    if (args[1].stats.health <= 0)
    {
        args[1].stats.health = 0;
        args[1].game.removeFighters(args[1]);
        args[1].game.animation_queue.push(new Event(args[1], args[1].animations.death, 1000));
        args[1].game.battleOver(args[1].game);
    }
    else {
            args[1].game.animation_queue.push(new Event(args[1], args[1].stop_move_animation, 1000));
        
    }
        args[0].game.setNextFighter();
        args[0].game.fight_queue[0].is_turn = true;
    

}

Entity.prototype.doMultiDamage = function(player, foes)
{
    var player = player;
    var args = foes;
    for(var i = 0; i < args.length; i++)
    {
        args[i].stats.health = args[i].stats.health - ((player.stats.attack / args[i].stats.defense) * (Math.random() * 10));
        if(i === args.length - 1)
        {
            if (args[i].stats.health <= 0)
            {
                args[i].stats.health = 0;
                args[i].game.removeFighters(args[i]);
                args[i].game.animation_queue.push(new Event(args[i], args[i].animations.hit));
                args[i].game.animation_queue.push(new Event(args[i], args[i].animations.death, 1000));
                args[i].game.battleOver(args[i].game);
            }
            else
            {
                args[i].game.animation_queue.push(new Event(args[i], args[i].animations.hit));
                args[i].game.animation_queue.push(new Event(args[i], args[i].stop_move_animation, 1000));
            }
        }
        else
        {
            if (args[i].stats.health <= 0)
            {
                args[i].stats.health = 0;
                args[i].game.removeFighters(args[i]);
                args[i].game.animation_queue.push(new Event(args[i], args[i].animations.hit));
                args[i].game.animation_queue.push(new Event(args[i], args[i].animations.death));
                args[i].game.battleOver(args[i].game);
            }
            else
            {
                args[i].game.animation_queue.push(new Event(args[i], args[i].animations.hit));
                args[i].game.animation_queue.push(new Event(args[i], args[i].stop_move_animation));
            }
        }
    }
    args[0].game.setNextFighter();
    args[0].game.fight_queue[0].is_turn = true;
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
Entity.prototype.setAnimation = function(anim)
{
    this.curr_anim = anim;
}

Statistics = function (health, attack, defense, turn_weight) {
    this.health = health;
    this.total_health = health;
    this.attack = attack;
    this.total_attack = attack;
    this.defense = defense;
    this.total_defense = defense;
    this.turn_weight = turn_weight
    this.turn_chance = 0;
}

/* HERO and subclasses */
Hero = function (game, x, y, spriteSheet, animations, stats, turn_weight) {
    Entity.call(this, game, x, y, spriteSheet, animations, stats);
    this.width = 43;
    this.height = 64;
    this.sight = 20; // this is how far the hero can interact. interactables (items or npcs) must be within this range (in pixels) for the space bar to
                        // pick up on any interaction. 
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
        if (ent_distance < min_distance) {
            min_distance = ent_distance;
            min_index = i;
        }
    }
    for (var i = 0; i < this.game.environment.interactables.length; i++) {
        var ent_x_difference = Math.abs((this.game.environment.interactables[i].x) - (this.x + 15));
        var ent_y_difference = Math.abs((this.game.environment.interactables[i].y) - (this.y + 40));
        var ent_distance = Math.sqrt(Math.pow(ent_x_difference, 2) + Math.pow(ent_y_difference, 2));
        if (ent_distance < min_distance) {
            min_distance = ent_distance;
            min_index = i;
            array = 1;
        }
    }
    if (array === 0) {
        return { ent: this.game.entities[min_index], reposition: true };
    } else {
        return { ent: this.game.environment.interactables[min_index] }
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
        this.curr_anim.drawFrame(this.game.clockTick, context, this.x, this.y, 2);
    }
}

Hero.prototype.checkSurroundings = function () {
    // return true or false
    return Math.round(Math.random() * 1000) >= 999;
}

Hero.prototype.update = function () {
    this.changeDirection();
    this.changeMoveAnimation();
    this.changeLocation();
    
    this.preBattle();
    this.checkBoundaries();
    if (!this.game.is_battle) {
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
    var index_low = { x: this.x + 20, y: this.y + 62 };
    var index_high = { x: this.x + 44, y: this.y + 62 };

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
    if (this.game.environment.curr_quadrant !== 0) {
        this.changeBound(index_low);
        this.changeBound(index_high);
    }

    var x1 = Math.floor(index_low.x / 32);
    var x2 = Math.floor(index_high.x / 32);
    var y1 = Math.floor(index_low.y / 32);
    var y2 = Math.floor(index_high.y / 32);
    return this.isPassable(this.getTile(x1, y1), index_low) && this.isPassable(this.getTile(x2, y2), index_high);
}

// changes x and/or y coordinates based on which quadrant of the map the character is in. Used for map collision detection
Hero.prototype.changeBound = function (index_object) {
    if (this.game.environment.curr_quadrant !== 0) {
        if (this.game.environment.curr_quadrant >= 3) {
            index_object.y += 11 * 32;
        }
        if (this.game.environment.curr_quadrant === 1 || this.game.environment.curr_quadrant === 4) {
            index_object.x += 11 * 32;
        } else if (this.game.environment.curr_quadrant === 2 || this.game.environment.curr_quadrant === 5) {
            index_object.x += 23 * 32;
        }
    }
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
    var quadrant = this.game.environment.curr_quadrant;
    if (this.boundaryRight()) {
        if (quadrant !== 2 && quadrant !== 5) {
            this.game.environment.setQuadrant(this.game.environment.curr_quadrant += 1);
            if (quadrant === 1 || quadrant === 4) {
                this.x -= 12 * 32;
            } else {
                this.x -= 11 * 32;
            }
        }
    }  else if (this.boundaryLeft()) {
        if (quadrant !== 0 && quadrant !== 3) {
            this.game.environment.setQuadrant(this.game.environment.curr_quadrant -= 1);
            if (quadrant === 2 || quadrant === 5) {
                this.x += 12 * 32;
            } else {
                this.x += 11 * 32;
            }
        }
    } else if (this.boundaryUp()) {
        if (quadrant !== 0 && quadrant !== 1 && quadrant !== 2) {
            this.game.environment.setQuadrant(this.game.environment.curr_quadrant -= 3);
            this.y += 11 * 32; 
        }
    } else if (this.boundaryDown()) {
        if (quadrant !== 3 && quadrant !== 4 && quadrant !== 5) {
            this.game.environment.setQuadrant(this.game.environment.curr_quadrant += 3);
            this.y -= 11 * 32; 
        }
    }
}

// returns the number associated with the tile that the hero is standing on. used for collision purposes.
Hero.prototype.getTile = function (x, y) {
    return this.game.environment.map[y][x];
}

Hero.prototype.isPassable = function (tile, index) {
    if (this.game.environment.level === 1) {
        if (tile === 0 || (tile >= 7 && tile <= 14) || tile === 80) {
            return true;
        } else if (tile === 66 || tile === 105) {
            if (index.y < 304) {
                return true;
            }
        }
    }
}

Warrior = function (game, stats) {
    this.game = game;
    this.spriteSheet = ASSET_MANAGER.getAsset("./imgs/warrior.png");
    this.animations = {
        down: new Animation(this.spriteSheet, 0, 10, 64, 64, 0.05, 9, true, false),
        up: new Animation(this.spriteSheet, 0, 8, 64, 64, 0.05, 9, true, false),
        left: new Animation(this.spriteSheet, 0, 9, 64, 64, 0.05, 9, true, false),
        right: new Animation(this.spriteSheet, 0, 11, 64, 64, 0.05, 9, true, false),
        destroy : new Animation(this.spriteSheet, 0, 17, 64, 64, 0.05, 12, true, false),
        hit: new Animation(this.spriteSheet, 0, 20, 64, 64, 0.05, 7, true, false),
        special : new Animation(this.spriteSheet, 0, 17, 64, 64, 0.05, 12, true, false)
    };
    this.x = 10;
    this.y = 215;
    
    this.inventory = new Inventory(this.game, 100, 20);
    Hero.call(this, this.game, this.x, this.y, this.spriteSheet, this.animations, stats);
}

Warrior.prototype = new Hero();
Warrior.prototype.constructor = Warrior;

Warrior.prototype.draw = function (context) {
    Hero.prototype.draw.call(this, context);
}

Warrior.prototype.update = function () {
    this.inventory.update.call(this); 
    Hero.prototype.update.call(this);
}

Warrior.prototype.setAction = function(action, target)
{
    switch(action)
    {
        case "Single":
            this.game.animation_queue.push(new Event(this, this.animations.destroy));
            this.game.animation_queue.push(new Event(this, this.stop_move_animation));
            target[0].game.animation_queue.push(new Event(target[0], target[0].animations.hit, 0, this.doDamage, [this, target[0]]));
            break;
        case "Sweep":
            this.game.animation_queue.push(new Event(this, this.animations.destroy));
            this.game.animation_queue.push(new Event(this, this.stop_move_animation));
            this.doMultiDamage(this, target);
    }

}

/* ENEMY and subclasses */
Enemy = function (game, stats, anims, loop_while_standing) {
    this.game = game;
    this.spriteSheet = anims.destroy.spriteSheet;
    this.x = 50;
    this.y = 150;
    this.animations = {
        down: anims.down,
        up: anims.up,
        left: anims.left,
        right: anims.right,
        destroy: anims.destroy,
        hit: anims.hit,
        death: anims.death
        // TODO: Move stop_move_animation and death_animation to here and fight animations
    };

    //this.animations.death.elapsedTime = .25;
    //this.animations.death.totalTime = .5;
    Entity.call(this, game, this.x, this.y, this.spriteSheet, this.animations, stats);
    if (!loop_while_standing){
        this.stop_move_animation = this.stopAnimation(this.animations.right);
    }
    else{
        this.stop_move_animation = this.animations.right;
    }
    this.direction = Direction.RIGHT;
    this.curr_anim = this.stop_move_animation;
}

Enemy.prototype = new Entity();
Enemy.prototype.constructor = Enemy;

Enemy.prototype.draw = function (context) {
     
    this.drawHealthBar(context);
    this.curr_anim.drawFrame(this.game.clockTick, context, this.x, this.y, 2);
}

Enemy.prototype.update = function () {
    if(this.game.fight_queue[0].id === this.id && this.is_turn)
    {
        this.setAction("Single", this.game.entities);
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
            target[0].game.animation_queue.push(new Event(target[0], target[0].animations.hit, 0, this.doDamage, [this, target[0]]));
            //target[0].game.animation_queue.push(new Event(target[0], target[0].stop_move_animation, 1000));
            break;
        case "Sweep":
            this.game.animation_queue.push(new Event(this, this.animations.special));
            this.game.animation_queue.push(new Event(this, this.stop_move_animation));
            for (var i = 0; i < target.length; i++) {
                target[i].game.animation_queue.push(new Event(target[i], target[i].animations.hit));
                target[i].game.animation_queue.push(new Event(target[i], target[i].stop_move_animation));
                target[i].stats.health = target[i].stats.health - ((this.stats.attack / target[i].stats.defense) * (Math.random() * 10));
            }
    }
    if (this.game.is_battle) {
        this.game.battleOver(this.game);
    }
}
/* NPC 
game : the game engine
dialogue : array of strings which will be used as the NPC's dialogue
anims : a SpriteSet object with the characters full set of animations
path : an array of Points which will determine the path that the NPC will take. pass in one point for the NPC to stand still
pause : whether the NPC will rest for 1 second once it reaches one of its points*/
NPC = function (game, dialogue, anims, path, speed, pause) {
    if (game && dialogue && anims && path) {
        this.game = game;

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
    }
}

NPC.prototype = new Entity();
NPC.prototype.constructor = NPC;

NPC.prototype.setNextCoords = function()
{
        this.next_point = this.path.shift();
        this.path.push(this.next_point);
}
NPC.prototype.draw = function (context) {
    if (this.game.environment.curr_quadrant === 0) {
        this.curr_anim.drawFrame(this.game.clockTick, context, this.x, this.y);
    }
}

NPC.prototype.update = function () {
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
            if (!this.pause_timer && this.pause) {
                var that = this;
                this.curr_anim = this.stopAnimation(this.curr_anim);
                this.pause_timer = setTimeout(function () {
                    that.setNextCoords();
                    that.hanging = false;
                    clearInterval(that.pause_timer);
                    that.pause_timer = null;
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

NPC.prototype.updateDialogue = function () {
    if (this.game) {
        if (this.game.next === true) {
            var text_box = document.getElementById("dialogue_box");
            var text = text_box.childNodes[1];
            if (this.dialogue_index < this.dialogue.length - 1) {
                this.dialogue_index++;
                text.innerHTML = this.dialogue[this.dialogue_index];
            } else {
                this.dialogue_index = 0;
                text_box.style.visibility = "hidden";
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
    this.reposition();
    var text_box = document.getElementById("dialogue_box");
    text_box.style.visibility = "visible";
    text_box.style.display = "block";
    this.game.context.canvas.tabIndex = 0;
    text_box.tabIndex = 1;
    text_box.focus();
    this.interacting = true;
    var text = text_box.childNodes[1];
    this.game.canControl = false;
    text.innerHTML = this.dialogue[this.dialogue_index];
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
    this.tiles = []; // array of Tile objects, NOT used for the tile images, just information about the tile. 
}

Environment = function (game) {
    this.game = game;
    this.level = 1;
    // "Map" will be a double array of integer values. 
    this.map = [[0, 66, 0, 0, 90, 91, 0, 0, 66, 0, 0, 94, 94, 0, 0, 66, 0, 94, 0, 0, 90, 91, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 17, 15, 0, 17, 3, 4, 62],
                [67, 68, 69, 94, 92, 93, 94, 67, 68, 69, 94, 95, 95, 94, 67, 68, 69, 95, 90, 91, 92, 93, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 18, 16, 18, 15, 16, 5, 6, 63],
                [70, 71, 72, 95, 90, 91, 95, 70, 71, 72, 95, 90, 91, 95, 70, 71, 72, 94, 92, 93, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 17, 15, 18, 17, 0, 62, 20],
                [73, 74, 75, 94, 92, 93, 94, 73, 74, 75, 94, 92, 93, 94, 73, 74, 75, 95, 0, 0, 0, 0, 0, 94, 28, 94, 28, 28, 0, 3, 4, 0, 0, 0, 18, 16, 18, 15, 16, 0, 0, 19],
                [76, 76, 78, 95, 90, 91, 95, 76, 78, 76, 95, 90, 91, 95, 76, 78, 76, 0, 94, 0, 0, 0, 0, 95, 29, 95, 29, 29, 0, 5, 6, 28, 28, 0, 0, 0, 1, 18, 0, 0, 3, 4],
                [77, 77, 79, 85, 92, 93, 85, 77, 79, 77, 87, 92, 93, 87, 77, 79, 77, 94, 95, 0, 0, 0, 0, 94, 117, 118, 119, 120, 3, 4, 28, 29, 29, 0, 0, 0, 2, 0, 0, 28, 5, 6],
                [0, 0, 80, 87, 86, 85, 87, 0, 80, 0, 86, 85, 87, 85, 0, 80, 0, 95, 0, 0, 94, 94, 0, 95, 121, 122, 123, 124, 5, 6, 29, 0, 0, 0, 28, 0, 0, 0, 0, 29, 62, 64],
                [7, 8, 7, 8, 7, 8, 7, 8, 7, 8, 7, 8, 7, 8, 7, 8, 7, 8, 7, 8, 95, 95, 94, 94, 125, 126, 127, 128, 0, 0, 0, 0, 3, 4, 29, 0, 0, 0, 28, 0, 3, 4],
                [9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 0, 94, 95, 95, 129, 130, 131, 132, 0, 0, 28, 62, 5, 6, 65, 0, 0, 65, 29, 20, 5, 6],
                [0, 66, 0, 0, 94, 0, 0, 94, 0, 0, 66, 0, 86, 87, 85, 86, 87, 85, 7, 8, 94, 95, 94, 3, 4, 0, 0, 0, 0, 62, 29, 62, 63, 3, 4, 0, 0, 3, 4, 19, 0, 28],
                [67, 68, 69, 94, 95, 0, 0, 95, 94, 67, 68, 69, 85, 86, 87, 85, 86, 87, 9, 10, 95, 94, 95, 5, 6, 37, 38, 0, 0, 37, 38, 3, 4, 5, 6, 0, 0, 5, 6, 3, 4, 29],
                [70, 71, 72, 95, 90, 0, 0, 91, 95, 70, 71, 72, 0, 90, 91, 94, 90, 91, 7, 8, 8, 95, 3, 4, 81, 82, 81, 82, 81, 82, 65, 5, 6, 0, 0, 0, 20, 3, 4, 5, 6, 65],
                [73, 74, 75, 94, 92, 0, 0, 93, 94, 73, 74, 75, 94, 92, 93, 95, 92, 93, 9, 10, 88, 89, 5, 6, 83, 84, 83, 84, 83, 84, 81, 82, 0, 0, 0, 64, 19, 5, 6, 65, 30, 30],
                [76, 78, 76, 95, 94, 0, 0, 0, 95, 76, 78, 76, 95, 94, 94, 90, 91, 94, 7, 8, 11, 12, 11, 12, 11, 12, 11, 12, 11, 12, 83, 84, 0, 0, 3, 4, 65, 32, 63, 32, 31, 31],
                [77, 79, 77, 0, 95, 0, 0, 0, 0, 77, 79, 77, 0, 95, 95, 92, 93, 95, 9, 10, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 81, 82, 0, 0, 5, 6, 63, 33, 30, 33, 65, 65],
                [0, 80, 0, 25, 26, 27, 0, 0, 0, 0, 80, 0, 90, 91, 133, 106, 107, 108, 104, 104, 0, 0, 3, 4, 103, 21, 22, 20, 11, 12, 83, 84, 0, 0, 81, 82, 81, 82, 31, 96, 97, 32],
                [0, 0, 0, 0, 0, 25, 26, 27, 0, 0, 0, 0, 92, 93, 109, 110, 111, 112, 0, 0, 0, 0, 5, 6, 0, 23, 24, 19, 13, 14, 104, 104, 0, 0, 83, 84, 83, 84, 65, 98, 99, 33],
                [39, 39, 40, 41, 0, 25, 26, 27, 36, 34, 36, 0, 0, 0, 113, 114, 115, 95, 0, 3, 4, 28, 20, 28, 3, 4, 0, 28, 11, 12, 11, 12, 11, 12, 11, 12, 11, 12, 11, 12, 96, 97],
                [46, 46, 47, 48, 0, 0, 42, 43, 44, 45, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 6, 29, 19, 29, 5, 6, 64, 29, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 98, 99],
                [53, 53, 40, 41, 36, 0, 49, 50, 51, 52, 0, 0, 0, 0, 0, 0, 0, 0, 0, 28, 28, 0, 28, 64, 62, 3, 4, 62, 64, 62, 65, 103, 37, 38, 104, 63, 32, 96, 97, 63, 32, 30],
                [36, 36, 47, 48, 94, 0, 54, 55, 56, 57, 0, 3, 4, 28, 28, 0, 28, 0, 65, 29, 29, 28, 29, 3, 4, 5, 6, 37, 38, 0, 62, 3, 4, 65, 65, 63, 33, 98, 99, 30, 33, 31],
                [90, 91, 36, 36, 95, 0, 58, 59, 60, 61, 0, 5, 6, 29, 29, 20, 29, 28, 64, 3, 4, 29, 64, 5, 6, 28, 0, 20, 3, 4, 62, 5, 6, 3, 4, 65, 30, 30, 65, 31, 65, 65],
                [92, 93, 90, 91, 94, 0, 0, 0, 0, 0, 0, 3, 4, 37, 38, 19, 64, 29, 20, 5, 6, 3, 4, 28, 28, 29, 28, 19, 5, 6, 3, 4, 28, 5, 6, 32, 31, 31, 32, 62, 30, 63],
                [0, 0, 92, 93, 95, 0, 0, 0, 0, 0, 0, 5, 6, 64, 37, 38, 62, 62, 19, 62, 65, 5, 6, 29, 29, 0, 29, 62, 37, 38, 5, 6, 29, 37, 38, 33, 63, 63, 33, 62, 31, 63]
    ];

    this.house_floor = [[1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2],
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
                        [4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1]];

    this.house_interior = [[28, 29, 30, 31, 32, 33, 34, 0, 0, 58, 59, 0, 0, 52, 52, 52, 52, 52],
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
                           [46, 0, 0, 54, 55, 54, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 51]];

    this.house_floor2 = [[67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67],
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
                         [67, 67, 68, 67, 67, 67, 67, 67, 67, 68, 67, 67, 67, 67, 67, 67, 68, 68]];

    this.house_interior2 = [[88, 85, 70, 71, 70, 71, 70, 72, 88, 85, 73, 70, 71, 70, 71, 70, 88, 88],
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
                            [0, 0, 0, 0, 0, 0, 83, 0, 0, 0, 85, 0, 0, 0, 85, 0, 0, 0]];

    this.dragon_cave = [[5, 6, 1, 2, 11, 9, 5, 6, 11, 13, 5, 6, 9, 12, 5, 6, 13, 11, 5, 6, 13, 13, 5, 6, 9, 11, 5, 6, 10, 12, 5, 6, 9, 13, 5, 6, 12, 10, 5, 6, 13, 9],
                        [7, 8, 3, 4, 10, 13, 7, 8, 9, 10, 7, 8, 11, 10, 7, 8, 10, 12, 7, 8, 11, 10, 7, 8, 9, 13, 7, 8, 10, 12, 7, 8, 9, 13, 7, 8, 9, 13, 7, 8, 12, 10],
                        [1, 2, 5, 6, 1, 2, 12, 11, 1, 2, 12, 10, 1, 2, 12, 9, 1, 2, 12, 11, 1, 2, 12, 13, 1, 2, 9, 13, 1, 2, 9, 13, 1, 2, 13, 12, 1, 2, 9, 13, 1, 2],
                        [3, 4, 7, 8, 3, 4, 13, 10, 3, 4, 9, 13, 3, 4, 13, 12, 3, 4, 9, 10, 3, 4, 9, 12, 3, 4, 10, 12, 3, 4, 12, 10, 3, 4, 9, 10, 3, 4, 12, 10, 3, 4],
                        [5, 6, 1, 2, 12, 10, 5, 6, 9, 10, 5, 6, 10, 9, 5, 6, 9, 13, 5, 6, 12, 10, 5, 6, 10, 13, 5, 6, 9, 10, 5, 6, 10, 13, 5, 6, 13, 10, 5, 6, 10, 9],
                        [7, 8, 3, 4, 9, 13, 7, 8, 12, 9, 7, 8, 12, 11, 7, 8, 10, 9, 7, 8, 9, 12, 7, 8, 12, 9, 7, 8, 13, 12, 7, 8, 12, 9, 7, 8, 9, 12, 7, 8, 13, 12],
                        [1, 2, 5, 6, 1, 2, 10, 12, 1, 2, 9, 12, 1, 2, 10, 12, 1, 2, 10, 11, 1, 2, 10, 9, 1, 2, 10, 12, 1, 2, 9, 10, 1, 2, 9, 13, 1, 2, 12, 9, 1, 2],
                        [3, 4, 7, 8, 3, 4, 9, 10, 3, 4, 11, 10, 3, 4, 9, 13, 3, 4, 12, 9, 3, 4, 11, 10, 3, 4, 13, 10, 3, 4, 13, 12, 3, 4, 10, 9, 3, 4, 13, 10, 3, 4],
                        [5, 6, 1, 2, 12, 10, 5, 6, 9, 12, 5, 6, 10, 13, 5, 6, 9, 12, 5, 6, 10, 13, 5, 6, 9, 11, 5, 6, 9, 12, 5, 6, 11, 10, 5, 6, 10, 12, 5, 6, 12, 13],
                        [7, 8, 3, 4, 13, 9, 7, 8, 13, 10, 7, 8, 12, 9, 7, 8, 10, 11, 7, 8, 9, 12, 7, 8, 10, 9, 7, 8, 12, 13, 7, 8, 12, 10, 7, 8, 9, 11, 7, 8, 12, 9],
                        [1, 2, 5, 6, 1, 2, 10, 9, 1, 2, 12, 9, 1, 2, 13, 10, 1, 2, 13, 12, 1, 2, 11, 12, 1, 2, 10, 12, 1, 2, 9, 13, 1, 2, 9, 12, 1, 2, 12, 10, 1, 2],
                        [3, 4, 7, 8, 3, 4, 12, 11, 3, 4, 10, 11, 3, 4, 12, 9, 3, 4, 9, 10, 3, 4, 9, 12, 3, 4, 11, 12, 3, 4, 12, 10, 3, 4, 11, 10, 3, 4, 11, 9, 3, 4]];

    this.tileSheet = new Tilesheet("./imgs/tiles.png", 32, 26);
    var firesheet1 = ASSET_MANAGER.getAsset("./imgs/fire.png");
    var firesheet2 = ASSET_MANAGER.getAsset("./imgs/fire2.png");
    this.flame1_animation = new Animation(firesheet1, 0, 0, 32, 64, 0.5, 9, true, false);
    this.flame2_animation = new Animation(firesheet2, 0, 0, 32, 32, 0.5, 4, true, false);
    this.flame1_locations = [[0, 4], [1, 4], [7, 4], [14, 4], [16, 4]];
    this.flame2_locations = [[2, 1], [14, 1], [1, 2], [16, 2]];
    this.quadrants = [[0, 0, 18, 12], [11, 0, 29, 12], [23, 0, 41, 12], [0, 11, 18, 23], [11, 11, 29, 23], [23, 11, 41, 23]];
    this.curr_quadrant = 0;
    
    this.interactables = [];
    this.initInteractables();

    this.fiends = [];
    this.initSpriteSets();
}

Environment.prototype.initSpriteSets = function()
{
    var skeleton_sprites = ASSET_MANAGER.getAsset("./imgs/skeleton.png");
    var malboro_sprites = ASSET_MANAGER.getAsset("./imgs/malboro.png");
    this.fiends.push(new SpriteSet(new Animation(skeleton_sprites, 0, 10, 64, 64, 0.05, 9, true, false),
        new Animation(skeleton_sprites, 0, 8, 64, 64, 0.05, 9, true, false),
        new Animation(skeleton_sprites, 0, 19, 64, 64, 0.05, 13, true, false),
        new Animation(skeleton_sprites, 0, 11, 64, 64, 0.05, 9, true, false),
        new Animation(skeleton_sprites, 0, 19, 64, 64, 0.05, 13, true, false),
        new Animation(skeleton_sprites, 0, 20, 64, 64, 0.07, 5, true, false),
        new Animation(skeleton_sprites, 0, 21, 64, 64, .1, 1, true, false)));
    this.fiends.push(new SpriteSet(null, null, null, new Animation(malboro_sprites, 0, 0, 82, 91, .15, 3, true, false),
        new Animation(malboro_sprites, 0, 1, 82, 91, .12, 6, true, false),
        new Animation(malboro_sprites, 0, 2, 82, 91, .15, 3, true, false),
        new Animation(malboro_sprites, 0, 3, 82, 91, .08, 1, true, false)
        ));
}

Environment.prototype.initInteractables = function () {
    this.interactables.push(new Door(2 * 32, 6 * 32, 0, this.game)); // door 1
    this.interactables.push(new Door(8 * 32, 6 * 32, 0, this.game)); // door 2 
    this.interactables.push(new Interactable(7 * 32, 6 * 32, 0, this.game)); // sign in front of store
    this.interactables.push(new Door(15 * 32, 6 * 32, 0, this.game)); // door 3
}

Interactable = function (x, y, quad, game) {
    this.x = x;
    this.y = y;
    this.quad = quad;
    this.game = game;
}

Interactable.prototype.startInteraction = function () { }

Door = function (x, y, quad, game) {
    this.is_closed = true;
    Interactable.call(this, x, y, quad, game);
}

Door.prototype = new Interactable();
Door.prototype.constructor = Door;

Door.prototype.startInteraction = function () {
    var y = this.y / 32;
    var x = this.x / 32;
    if (this.is_closed) {
        // close door
        this.game.environment.map[y][x] = 105;
        this.game.environment.map[y - 1][x] = 102;
        this.game.environment.map[y - 2][x] = 101;
    } else {
        // open door
        this.game.environment.map[y][x] = 80;
        this.game.environment.map[y - 1][x] = 79;
        this.game.environment.map[y - 2][x] = 78;
    }
    this.is_closed = !this.is_closed;
}

 /*Generates an array of random length between 1 and 2 with fiends that belong to that environment*/
Environment.prototype.generateFiend = function (game)
{
    var number_of_fiends = Math.floor(Math.random() * (4 - 1)) + 1;
    var fiend_array = [];
    for (var i = 0; i < number_of_fiends; i++) {
        var fiend_number = Math.floor(Math.random() * (this.fiends.length - 0) + 0);
        var fiend = this.fiends[fiend_number];
        fiend_array.push(new Enemy(this.game, new Statistics(100, 15, 5, .2), this.fiends[Math.floor(Math.random() * (this.fiends.length - 0) + 0)], false));
    }
    return fiend_array;
}

/* Loops over double array called Map, then draws the image of the tile associated with the integer in the map array. */
Environment.prototype.draw = function (scaleBy) {
    this.context = this.game.context;
    var scaleBy = (scaleBy || 1);

    this.drawTiles(scaleBy);
    this.drawFlames();
    
}

Environment.prototype.drawTiles = function (scaleBy) {
    //draw tiles
    for (var i = this.quadrants[this.curr_quadrant][1]; i <= this.quadrants[this.curr_quadrant][3]; i++) { // length of each row
        for (var j = this.quadrants[this.curr_quadrant][0]; j <= this.quadrants[this.curr_quadrant][2]; j++) { // length of each column
            var tile_index = this.map[i][j];

            var x_start_clip = tile_index % this.tileSheet.sheetWidth * this.tileSheet.tileSize;
            var y_start_clip = Math.floor(tile_index / this.tileSheet.sheetWidth) * this.tileSheet.tileSize;
            var amount_clip = this.tileSheet.tileSize;
            var x_coord = (this.tileSheet.tileSize * j) - (this.quadrants[this.curr_quadrant][0] * this.tileSheet.tileSize);
            var y_coord = (this.tileSheet.tileSize * i) - (this.quadrants[this.curr_quadrant][1] * this.tileSheet.tileSize);
            var draw_size = this.tileSheet.tileSize * scaleBy;

            this.context.drawImage(this.tileSheet.sheet,
                              x_start_clip, y_start_clip, // where to start clipping
                              amount_clip, amount_clip,  // how much to clip
                              x_coord, y_coord, // coordinates to start drawing to 
                              draw_size, draw_size); // how big to draw. 
        }
    }
}

Environment.prototype.drawFlames = function () {
    // draw flames
    if (this.curr_quadrant === 0) {
        for (var i = 0; i < this.flame1_locations.length; i++) {
            var x = this.flame1_locations[i][0];
            var y = this.flame1_locations[i][1];
            this.flame1_animation.drawFrame(this.game.clockTick, this.context, x * 32, y * 32 - 32, 1.3);

        }
        for (var i = 0; i < this.flame2_locations.length; i++) {
            var x = this.flame2_locations[i][0];
            var y = this.flame2_locations[i][1];
            this.flame2_animation.drawFrame(this.game.clockTick, this.context, x * 32, y * 32, 1.3);

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
    
    this.target_queue = [];
}

BattleMenu.prototype.init = function () {
    var that = this;

    this.attack.addEventListener("keydown", function (e) {
        if (e.which === 40) {
            window.setTimeout(that.use_item.focus(), 0);
        } else if (String.fromCharCode(e.which) === ' ') {
            // opens attack sub_menu
            that.changeTabIndex("main", false);

            that.changeTabIndex("attack", true); 

            window.setTimeout(that.single_attack.focus(), 0);
        }
        e.preventDefault();
    });
    this.use_item.addEventListener("keydown", function (e) {
        if (e.which === 40) {
            window.setTimeout(that.flee.focus(), 0);
        } else if (e.which === 38) {
            window.setTimeout(that.attack.focus(), 0);
        } else if (String.fromCharCode(e.which) === ' ') {
            // opens item sub_menu
        }
        e.preventDefault();
    });
    this.flee.addEventListener("keydown", function (e) {
        if (e.which === 38) {
            window.setTimeout(that.use_item.focus(), 0);
        } else if (String.fromCharCode(e.which) === ' ') {
            // characters flee
        }
        e.preventDefault();
    });

    // ATTACK MENU CONTROLS 
    this.single_attack.addEventListener("keydown", function (e) {
        if (e.which === 40) {
            window.setTimeout(that.aoe_attack.focus(), 0);
        } else if (String.fromCharCode(e.which) === ' ') {
            // stuff to make character do a single attack 
            if (that.game.entities[0].is_turn) {
                if (that.game.fight_queue[0]) {
                    that.game.fight_queue[0].setAction("Single", [that.target_queue[0]]);
                    that.game.entities[0].is_turn = false;
                }
            }
            that.target_queue.push(that.target_queue.shift());
            that.changeTabIndex("attack", false);
            that.changeTabIndex("main", true);
            window.setTimeout(that.attack.focus(), 0);
        }
        e.preventDefault();
    });

    this.aoe_attack.addEventListener("keydown", function (e) {
        if (e.which === 40) {
            window.setTimeout(that.back.focus(), 0);
        } else if (e.which === 38) {
            window.setTimeout(that.single_attack.focus(), 0);
        } else if (String.fromCharCode(e.which) === ' ') {
            if (that.game.fight_queue[0] && that.game.entities[0].is_turn) {
                that.game.fight_queue[0].setAction("Sweep", that.target_queue);
                that.game.entities[0].is_turn = false;
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
        default: ; 
    }
}

BattleMenu.prototype.showMenu = function (flag) {
    this.target_queue = [];
    for (var i = 0; i < this.game.fiends.length; i++) {
        this.target_queue.push(this.game.fiends[i])
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
            that.hero.inventory.showInventory(); 
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

Storekeeper = function (game, dialogue, anims, path, pause, name) {
    this.name = name;
    NPC.call(this, game, dialogue, anims, path, 0, pause);
}

Storekeeper.prototype = new NPC();
Storekeeper.prototype.constructor = Storekeeper;

Storekeeper.prototype.requestSale = function (buyer, item_name, qty) {
    var item = null;
    if (buyer.deductCoin()) {
        this.items.splice(item.name, 1);
        item = this.items[item_name];
        if (this.items[item_name].qty === qty) {
            this.items.splice(item_name, 1);
        } else {
            item.decreaseQty(item.qty);
            item.increaseQty(qty);
            this.items[item_name].decreaseQty(qty);
        }
        buyer.recieveItem(item);
    } else {
        // TODO make shopkeeper say something about not having enough money to buy the item. 
    }
}

Storekeeper.prototype.initializeItems = function (items) {
    for (var i = 0; i < items.length; i++) {
        this.items[items[i].name] = items[i];
    }
}

Item = function (name, price, qty, img, stackable) {
    this.name = name;
    this.price = price;
    this.qty = qty;
    this.img = img;
    this.isStackable = stackable; 
}

Item.prototype.increaseQty = function (amount) {
    this.qty += amount;
}

Item.prototype.decreaseQty = function (amount) {
    if (this.qty >= amount) {
        this.qty -= amount;
    }
}

Warrior.prototype.deductCoin = function (amount) {
    if (this.inventory.coin >= amount) {
        this.inventory.coin -= amount;
        return true;
    } else {
        return false;
    }
}

Warrior.prototype.addCoin = function (amount) {
    this.inventory.coin += amount;
}

Warrior.prototype.recieveItem = function (item) {
    this.inventory.addItem(item); 
}

Warrior.prototype.removeItem = function (item_name, qty) {
    this.inventory.removeItem(item_name, qty);
}

Inventory = function (game, coin, max_items) {
    this.game = game; 
    this.coin = coin;
    this.html_coin = document.getElementById("coin");
    this.max_items = max_items;
    this.interface = document.getElementById("inventory_sack");
    this.html_items = document.getElementById("items").getElementsByTagName('DIV');
    this.items = [];
    this.stacking_limit = 50;
    //this.input();
}

Inventory.prototype.showInventory = function (flag) {
    if (flag) {
        this.game.context.canvas.tabIndex = 0;
        this.interface.tabIndex = 1;
        this.interface.style.visibility = "visible";
        this.interface.style.display = "block";
        this.html_items[0].focus();
    } else {
        this.interface.style.visibility = "hidden";
        this.interface.style.display = "none";
        this.interface.tabIndex = 0;
        this.game.context.canvas.tabIndex = 1;
        this.game.context.canvas.focus();
    }
}

Inventory.prototype.draw = function (ctx) {
    for (var i = 0; i < this.items.length; i++) {
        // get img of each item
        var img = this.items[i].img;
        this.html_items[i].innerHTML = img.outerHTML;
    }
    // draw coin amount
    var inner_stuff = 
    this.html_coin.innerHTML = this.coin;
}

Inventory.prototype.update = function () {
    if (this.game.key_i) {
        this.inventory.showInventory(true); 
    } else if (this.inventory.interface.style.visibility === "visible" && this.game.esc) {
        this.inventory.showInventory(false);
        this.game.key_i = 0;
    }
}

Inventory.prototype.addItem = function (item) {
    var found = false;
    if (this.items && item.isStackable) {
        for (var i = 0; i < this.items.length; i++) {
            if (this.items[i].name === item.name) {
                if ((this.items[i].qty += item.qty) <= this.stacking_limit) {

                }
                this.items[i].qty += item.qty;
                found = true;
            }
        }
    }
    if (!found) {
        if (this.items.length < this.max_items) {
            this.items.push(item);
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
                this.items.splice(item, 1);
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
            new_stack = new Item(item_name, items[i].price, items[i].qty, items[i].img, items[i].stackable);
            items[i].qty -= qty; 
        }
    }
    return new_stack;
}

Inventory.prototype.input = function () {
    for (var i = 0; i < this.html_items.length; i++) {
        var item = this.html_items[i];
        item.addEventListener("keydown", function (e) {
            if (e.which === 37) { // left 
                // if at the end of a row, send focus to the beginning of row. 
                if ((indexOf(this) % 5 - 1) === 0) {
                    this.html_items[indexOf(this) - 5].focus();
                } else {
                    this.html_items[indexOf(this) - 1].focus();
                }
            } else if (e.which === 38) { // up
                // if in top row, send focus to bottom row. 
                if (Math.floor((indexOf(this) / 5)) === 0) {
                    this.html_items[20 - indexOf(this)].focus();
                } else {
                    this.html_items[indexOf(this) - 5];
                }
            } else if (e.which === 39) { // right
                // if at the beginning of a row, send focus to the end of row. 
                if ((indexOf(this) % 5 - 1) === 0) {
                    this.html_items[indexOf(this) + 5].focus();
                } else {
                    this.html_items[indexOf(this) + 1].focus();
                }
            } else if (e.which === 40) { // down
                // if in bottom row, send focus to top row
                if (Math.floor((indexOf(this) / 5)) === 4) {
                    this.html_items[indexOf(this) % 5].focus();
                } else {
                    this.html_items[indexOf(this) + 5];
                }
            } else if (String.fromCharCode(e.which) === ' ') {
                // bring up menu to let user choose what to do with item
                // item could be usable or equipable
            }
        });
    }
}
