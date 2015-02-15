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

GameEngine = function () {
    this.entities = [];
    this.context = null;
    this.width = null;
    this.height = null;
    this.timer = null;
    this.key = null; 
    this.space = null;
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
    this.next = false; // used to detect space when advancing dialogue with NPCs.
}

GameEngine.prototype.init = function (context) {
    this.context = context;
    this.width = this.context.canvas.width;
    this.height = this.context.canvas.height;
    this.timer = new Timer();
    this.startInput();
    this.menu = new BattleMenu(document.getElementById("battle_menu"));
    this.context.canvas.focus();
    this.environment = new Environment(this);
}
GameEngine.prototype.startInput = function () {
    var that = this;
    //Temporary, space bar invokes attack
    this.context.canvas.addEventListener('keydown', function (e) {
        if (that.canControl) {
            if (String.fromCharCode(e.which) === ' ') {
                if (!that.space) {
                    //calls fight and then checks if battle is over
                    that.fight(that.entities[0], that.entities[0].fiends[0]);
                    that.battleOver([that.entities[0], that.entities[0].fiends[0]]);
                }
                that.space = true;

            } else if (e.which === 37
                        || e.which === 38
                        || e.which === 39
                        || e.which === 40) {
                that.key = e.which;
            }
            e.preventDefault();
        } else {
            that.key = 0;
            that.space = 0; 
        }
    }, false);

   

    this.context.canvas.addEventListener('keyup', function (e) {
        that.key = 0;
        that.space = 0;
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
    for (var i = 0; i < this.entities.length; i++) {
        this.entities[i].draw(this.context);
    }
    if (drawCallBack) {
        drawCallBack(this);
    }
    this.context.restore();
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
            callback(args);
            that.fadeIn(that);
        }
    }, 50);
}
/**
Only called by fadeOut, fades the screen back in
Takes a game as a parameter
*/
GameEngine.prototype.fadeIn = function (game) {
    var that = game;

    this.timerId = setInterval(function () {
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
GameEngine.prototype.setBattle = function (player) {

    player.game.is_battle = true;
    player.game.setBackground("./imgs/woods.png");
    player.save_x = player.x;
    player.save_y = player.y;
    player.save_direction = player.direction;
    player.x = 300;
    player.y = 250;
    player.direction = Direction.LEFT;
    player.game.environment.generateFiend(player.fiends);
    for (var i = 0; i < player.fiends.length; i++) {
        if (i > 0) {
            player.fiends[i].y = 225 - player.fiends[i - 1].y;
        }
        player.game.addEntity(player.fiends[i]);
    }
    player.game.menu.showMenu(true);
}
    
/*
    Puts ending conditions for a battle including resetting is_battle to false,
    putting the player back to original position, 
    and for now resets the players health.
*/
GameEngine.prototype.endBattle = function (player)
{
    player.game.is_battle = false;
    player.stats.health = 100;
    player.stats.health = 75;
    player.game.menu.showMenu(false);
    player.x = player.save_x;
    player.y = player.save_y;
    player.direction = player.save_direction;
}
/**
    checks if battle is over and invokes fadeOut by passing endBattle() to end the game and
    reset the hero to the world map
*/
GameEngine.prototype.battleOver = function (players) {
    if (players[0].game.is_battle && (players[0].stats.health <= 0 || players[1].stats.health <= 0)) {
        players[0].game.canControl = false;
        players[1].game.animation_queue.push(new Event(players[1], players[1].animations.death));
        player.game.timerId2 = setTimeout(function () {
            player.game.fadeOut(player.game, player.game.entities[0], player.game.endBattle);
            clearInterval(player.game.timerId2);
        }, 2000);
    }
}

/*
    Takes in two players as parameters, pushes the players attack animation to the queue and 
    the foes hit animation. also does a damage calculation for the hit target
*/
GameEngine.prototype.fight = function (player, foe) {
    //player.game.animation_queue.push(new Event(player, player.animations.destroy));
    //player.game.animation_queue.push(new Event(player, player.stop_move_animation));
    //foe.game.animation_queue.push(new Event(foe, foe.animations.hit));
    //foe.game.animation_queue.push(new Event(foe, foe.stop_move_animation));
    //foe.stats.health = foe.stats.health -((player.stats.attack / foe.stats.defense) * (Math.random() * 10));
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
Event = function(entity, animation)
{
    this.entity = entity;
    this.animation = animation;
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

Statistics = function (health, attack, defense) {
    this.health = health;
    this.attack = attack;
    this.defense = defense;
}

/* HERO and subclasses */
Hero = function (game, x, y, spriteSheet, animations, stats) {
    Entity.call(this, game, x, y, spriteSheet, animations, stats);
    this.width = 43;
    this.height = 64;
    this.fiends = [];
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
        //Logic to calculate when to time the next animation event
        var event = this.game.event;
        //if event is null and there is an animation in the queue, set animation to the first item in the queue
        if (!event && this.game.animation_queue.length > 0) {
            event = this.game.animation_queue[0];
            event.entity.setAnimation(event.animation);
        }
        //If event is not null, check if the current event has gone through a full loop
        if(event){
            if (event.entity.curr_anim.looped) {
                if (this.game.animation_queue.length >= 0) {
                    //if loop has been made, dequeue off the queue and set it to event
                    event = this.game.animation_queue.shift();
                    //Sets the events entitiy's animation
                    event.entity.setAnimation(event.animation);
                    event.entity.curr_anim.looped = false;
                }
                else {
                    event.entity.setAnimation(event.entity.stop_move_animation);
                }
            }
        }
        this.curr_anim.drawFrame(this.game.clockTick, context, this.x, this.y, 2);
    }
}

Hero.prototype.checkSurroundings = function () {
    // return true or false
    return Math.round(Math.random() * 1000) >= 1001;
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
        // lock user input controls here.
        this.game.fadeOut(this.game, this, this.game.setBattle);
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
        destroy: new Animation(this.spriteSheet, 0, 17, 64, 64, 0.05, 12, true, false),
        hit: new Animation(this.spriteSheet, 0, 20, 64, 64, 0.05, 7, true, false)
    };
    this.x = 10;
    this.y = 215;
    Hero.call(this, this.game, this.x, this.y, this.spriteSheet, this.animations, stats);
}

Warrior.prototype = new Hero();
Warrior.prototype.constructor = Warrior;

Warrior.prototype.draw = function (context) {
    Hero.prototype.draw.call(this, context);
}

Warrior.prototype.update = function () {
    Hero.prototype.update.call(this);
}

/* ENEMY and subclasses */
Enemy = function (game, stats, anims, loop_while_standing) {
    this.game = game;
    this.spriteSheet = anims.destroy.spriteSheet;
    this.x = 50;
    this.y = 225;
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
     
    if (this.game.is_battle) {
        this.curr_anim.drawFrame(this.game.clockTick, context, this.x, this.y, 2);
    }
}

Enemy.prototype.update = function() {
}


Enemy.prototype.hit = function () {

}

/* NPC */
NPC = function (game, dialogue) {
    this.game = game;
    this.spriteSheet = ASSET_MANAGER.getAsset("./imgs/npc-female.png");
    this.animations = {
        down: new Animation(this.spriteSheet, 0, 10, 64, 64, 0.05, 9, true, false),
        up: new Animation(this.spriteSheet, 0, 8, 64, 64, 0.05, 9, true, false),
        left: new Animation(this.spriteSheet, 0, 9, 64, 64, 0.05, 9, true, false),
        right: new Animation(this.spriteSheet, 0, 11, 64, 64, 0.05, 9, true, false)
    }
    this.x = 160;
    this.y = 215;
   // this.move_animation = this.animations.right;
    Entity.call(this, game, this.x, this.y, this.spriteSheet, this.animations);

    // next few variables used for NPC interaction and dialogue. 
    this.interacting = false;
    this.dialogue = dialogue;
    this.dialogue_index = 0;
}

NPC.prototype = new Entity();
NPC.prototype.constructor = NPC;

NPC.prototype.draw = function (context) {
    if (!this.game.is_battle && this.game.environment.curr_quadrant === 0) {
        this.move_animation.drawFrame(this.game.clockTick, context, this.x, this.y);
    }
}

NPC.prototype.update = function () {
    if (!this.interacting) {
        if (this.x === 160 && this.direction === Direction.DOWN) {
            this.move_animation = this.animations.right;
            this.direction = Direction.RIGHT;
        } else if (this.x === 288  && this.direction === Direction.RIGHT) {
            this.move_animation = this.animations.up;
            this.direction = Direction.UP;
        } else if (this.x === 288  && this.direction === Direction.UP) {
            this.move_animation = this.animations.left;
            this.direction = Direction.LEFT;
        } else if (this.x === 160  && this.direction === Direction.LEFT) {
            this.move_animation = this.animations.down;
            this.direction = Direction.DOWN;
        }
        this.changeCoordinates(0, 0, 0.25, 0.25);
    } else {
        this.move_animation = this.stopAnimation(this.move_animation);
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

// when setting changes or a quest completes, change what the NPC says with this function
NPC.prototype.changeDialogue = function () {
    this.dialogue = ["",
                     "",
                     ""];
}

// loops through dialogue for the given NPC.
NPC.prototype.startInteraction = function () {
    this.reposition(); 
    var text_box = document.getElementById("dialogue_box");
    text_box.style.visibility = "visible";
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
        this.move_animation = this.animations.left; 
    } else if (this.x < this.game.entities[0].x && this.direction !== Direction.RIGHT) {
        this.direction = Direction.RIGHT;
        this.move_animation = this.animations.right;
    }
}
/*
An object that is passed in when creating a new enemy that has a full map of its animations.
If a certain animation does not exist, pass in null.
*/
Animations = function(down, up, left, right, destroy, hit, death)
{
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
    this.map = [[0, 66, 0, 0, 90, 91, 0, 0, 66, 0, 0, 94, 94, 0, 0, 66, 0, 94, 0, 0, 15, 17, 15, 0, 17, 0, 94, 0, 94, 94, 0, 94, 94, 94, 94, 62, 64, 3, 4, 3, 4, 62],
                [67, 68, 69, 94, 92, 93, 94, 67, 68, 69, 94, 95, 95, 94, 67, 68, 69, 95, 90, 91, 18, 16, 18, 15, 16, 94, 95, 94, 95, 95, 94, 95, 95, 95, 95, 3, 4, 5, 6, 5, 6, 63],
                [70, 71, 72, 95, 90, 91, 95, 70, 71, 72, 95, 90, 91, 95, 70, 71, 72, 94, 92, 93, 15, 17, 15, 18, 17, 95, 94, 95, 94, 0, 95, 3, 4, 3, 4, 5, 6, 28, 37, 38, 62, 20],
                [73, 74, 75, 94, 92, 93, 94, 73, 74, 75, 94, 92, 93, 94, 73, 74, 75, 95, 0, 94, 18, 16, 18, 15, 16, 94, 95, 0, 95, 3, 4, 5, 6, 5, 6, 28, 28, 29, 3, 4, 0, 19],
                [76, 76, 78, 95, 90, 91, 95, 76, 78, 76, 95, 90, 91, 95, 76, 78, 76, 0, 94, 95, 94, 1, 94, 18, 94, 95, 94, 94, 0, 5, 6, 28, 28, 63, 28, 29, 29, 0, 5, 6, 3, 4],
                [77, 77, 79, 85, 92, 93, 85, 77, 79, 77, 87, 92, 93, 87, 77, 79, 77, 94, 95, 94, 95, 2, 95, 94, 95, 94, 95, 95, 3, 4, 28, 29, 29, 20, 29, 28, 3, 4, 3, 4, 5, 6],
                [0, 0, 80, 87, 86, 85, 87, 89, 80, 0, 86, 85, 87, 85, 0, 80, 0, 95, 0, 95, 94, 94, 0, 95, 94, 95, 94, 0, 5, 6, 29, 28, 0, 19, 28, 29, 5, 6, 5, 6, 62, 64],
                [7, 8, 7, 8, 7, 8, 7, 8, 7, 8, 7, 8, 7, 8, 7, 8, 7, 8, 7, 8, 95, 95, 94, 94, 95, 0, 95, 3, 4, 28, 0, 29, 3, 4, 29, 3, 4, 0, 28, 0, 3, 4],
                [9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 0, 94, 95, 95, 0, 3, 4, 5, 6, 29, 28, 62, 5, 6, 65, 5, 6, 0, 29, 20, 5, 6],
                [0, 66, 0, 0, 94, 90, 91, 94, 0, 0, 66, 0, 86, 87, 85, 86, 87, 85, 7, 8, 94, 95, 94, 3, 4, 5, 6, 20, 28, 62, 29, 62, 63, 3, 4, 0, 28, 3, 4, 19, 0, 28],
                [67, 68, 69, 94, 95, 92, 93, 95, 94, 67, 68, 69, 85, 86, 87, 85, 86, 87, 9, 10, 95, 94, 95, 5, 6, 37, 38, 19, 29, 37, 38, 3, 4, 5, 6, 28, 29, 5, 6, 3, 4, 29],
                [70, 71, 72, 95, 90, 91, 90, 91, 95, 70, 71, 72, 0, 90, 91, 94, 90, 91, 7, 8, 0, 95, 3, 4, 81, 82, 81, 82, 81, 82, 65, 5, 6, 3, 4, 29, 20, 3, 4, 5, 6, 65],
                [73, 74, 75, 94, 92, 93, 92, 93, 94, 73, 74, 75, 94, 92, 93, 95, 92, 93, 9, 10, 88, 89, 5, 6, 83, 84, 83, 84, 83, 84, 81, 82, 28, 5, 6, 64, 19, 5, 6, 65, 30, 30],
                [76, 78, 76, 95, 94, 90, 91, 94, 95, 76, 78, 76, 95, 94, 94, 90, 91, 94, 7, 8, 11, 12, 11, 12, 11, 12, 11, 12, 11, 12, 83, 84, 29, 28, 3, 4, 65, 32, 63, 32, 31, 31],
                [77, 79, 77, 0, 95, 92, 93, 95, 0, 77, 79, 77, 0, 95, 95, 92, 93, 95, 9, 10, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 81, 82, 0, 29, 5, 6, 63, 33, 30, 33, 65, 65],
                [0, 80, 0, 25, 26, 27, 25, 26, 27, 0, 80, 0, 90, 91, 0, 0, 94, 0, 104, 104, 3, 4, 3, 4, 103, 21, 22, 20, 11, 12, 83, 84, 81, 82, 81, 82, 81, 82, 31, 96, 97, 32],
                [34, 34, 34, 0, 25, 26, 27, 34, 34, 36, 36, 94, 92, 93, 90, 91, 95, 94, 94, 0, 5, 6, 5, 6, 0, 23, 24, 19, 13, 14, 104, 104, 83, 84, 83, 84, 83, 84, 65, 98, 99, 33],
                [39, 39, 40, 41, 36, 25, 26, 27, 36, 34, 36, 95, 0, 0, 92, 93, 0, 95, 95, 3, 4, 28, 20, 28, 3, 4, 0, 28, 11, 12, 11, 12, 11, 12, 11, 12, 11, 12, 11, 12, 96, 97],
                [46, 46, 47, 48, 36, 36, 42, 43, 44, 45, 39, 90, 91, 3, 4, 3, 4, 3, 4, 5, 6, 29, 19, 29, 5, 6, 64, 29, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 98, 99],
                [53, 53, 40, 41, 36, 36, 49, 50, 51, 52, 46, 92, 93, 5, 6, 5, 6, 5, 6, 28, 28, 0, 28, 64, 62, 3, 4, 62, 64, 62, 65, 103, 37, 38, 104, 63, 32, 96, 97, 63, 32, 30],
                [36, 36, 47, 48, 94, 94, 54, 55, 56, 57, 53, 3, 4, 28, 28, 0, 28, 0, 65, 29, 29, 28, 29, 3, 4, 5, 6, 37, 38, 0, 62, 3, 4, 65, 65, 63, 33, 98, 99, 30, 33, 31],
                [90, 91, 36, 36, 95, 95, 58, 59, 60, 61, 0, 5, 6, 29, 29, 20, 29, 28, 64, 3, 4, 29, 64, 5, 6, 28, 0, 20, 3, 4, 62, 5, 6, 3, 4, 65, 30, 30, 65, 31, 65, 65],
                [92, 93, 90, 91, 94, 94, 94, 94, 94, 3, 4, 3, 4, 37, 38, 19, 64, 29, 20, 5, 6, 3, 4, 28, 28, 29, 28, 19, 5, 6, 3, 4, 28, 5, 6, 32, 31, 31, 32, 62, 30, 63],
                [0, 0, 92, 93, 95, 95, 95, 95, 95, 5, 6, 5, 6, 64, 37, 38, 62, 62, 19, 62, 65, 5, 6, 29, 29, 0, 29, 62, 37, 38, 5, 6, 29, 37, 38, 33, 63, 63, 33, 62, 31, 63]
    ];
    this.tileSheet = new Tilesheet("./imgs/tiles.png", 32, 26);
    var firesheet1 = ASSET_MANAGER.getAsset("./imgs/fire.png");
    var firesheet2 = ASSET_MANAGER.getAsset("./imgs/fire2.png");
    this.flame1_animation = new Animation(firesheet1, 0, 0, 32, 64, 0.5, 9, true, false);
    this.flame2_animation = new Animation(firesheet2, 0, 0, 32, 32, 0.5, 4, true, false);
    this.flame1_locations = [[0, 4], [1, 4], [7, 4], [14, 4], [16, 4]];
    this.flame2_locations = [[2, 1], [14, 1], [1, 2], [16, 2]];
    this.quadrants = [[0, 0, 18, 12], [11, 0, 29, 12], [23, 0, 41, 12], [0, 11, 18, 23], [11, 11, 29, 23], [23, 11, 41, 23]];
    this.curr_quadrant = 0;
    this.fiends = [];
    this.interactables = [];
    this.initInteractables();
    this.fiends.push(this.game.auxillary_sprites[0]);
    this.fiends.push(this.game.auxillary_sprites[1]);
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
Environment.prototype.generateFiend = function (f)
{
    var fiend_number = Math.floor(Math.random() * (1 - 0) + 0);
    var number_of_fiends = Math.floor(Math.random() * (3 - 1)) + 1;
    for (var i = 0; i < number_of_fiends; i++) {
        fiend_number = Math.floor(Math.random() * (1 - 0) + 0);
        f.push(this.fiends[(Math.floor(Math.random() * (2 - 0)) + 0)]);
    }
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

Background = function () {
    // "Map" will be a double array of integer values. 
    this.map = [[],
                [],
                [],
                []];
    this.tileSheet = new Tilesheet(/* TODO: fill in parameters here */);
}

/* Loops over double array called Map, then draws the image of the tile associated with the integer in the map array. */
Background.prototype.draw = function (context, scaleBy) {
    var scaleBy = (scaleBy || 1);

    for (var i = 0; i < this.map[0].length; i++) { // length of each row
        for (var j = 0; j < this.map.length; j++) { // length of each column
            var tile_index = this.map[i][j];

            context.drawImage(this.tileSheet,
                                tile_index % this.tileSheet.sheetWidth, tile_index / this.tileSheet.sheetWidth, // where to start clipping
                                this.tileSheet.tileSize, this.tileSheet.tileSize,  // how much to clip
                                this.tileSheet.tileSize * i, this.tileSheet.tileSize * j, // coordinates to start drawing to 
                                this.tileSheet.tileSize * scaleBy, this.tileSheet.tileSize * scaleBy); // how big to draw.                          
        }
    }
}

Background.prototype.update = function () {
    
}


BattleMenu = function (menu_element) {
    this.menu = menu_element;
    if (this.menu) {
        this.attack = document.getElementById("attack");
        this.use_item = document.getElementById("use_item");
        this.flee = document.getElementById("flee");
    }
}

BattleMenu.prototype.init = function () {
    var that = this;

    this.attack.addEventListener("focus", function () {
        that.attack.style.color = "white";
    });
}

BattleMenu.prototype.showMenu = function (flag) {
    if (flag) {
        this.menu.style.visibility = "visible";
        window.setTimeout("this.attack.focus();", 0);
    } else {
        this.menu.style.visibility = "hidden";
    }
}
