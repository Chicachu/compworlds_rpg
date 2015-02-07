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
    var index = 0;
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
    this.environment = null; 
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

    document.addEventListener('keypress' ) = function (e) {
        if (String.fromCharCode(e.which) === ' ') {
            that.space = true;
        }

    document.addEventListener('keydown', function (e) {
        if (e.which === 37
                   || e.which === 38
                   || e.which === 39
                   || e.which === 40) {
            that.key = e.which; 
        }
        e.preventDefault();
    }, false);

    document.addEventListener('keyup', function (e) {
        that.key = 0;
        that.space = 0;
    }, false);
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

GameEngine.prototype.draw = function (drawCallBack) {
    this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
    this.context.save();
    if (this.curr_background && this.is_battle)
    {
        this.context.drawImage(this.curr_background, 0, 0);
    } else {
        this.environment.draw(this.context, 1);
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

GameEngine.prototype.setBattle = function (player, foe) {
    this.is_battle = true;
    this.drawBackground("./imgs/woods.png");
    player.x = 300;
    player.y = 250;
    player.direction = Direction.LEFT;
    foe.x = 50;
    foe.y = 250;
    this.menu.showMenu(true);
    player.attack_anim = false;
    player.fight_animation.looped = false;
    foe.attack_anim = false;
    foe.fight_animation.looped = false;
}

GameEngine.prototype.battleOver = function ()
{
    if(this.is_battle)
    {
        if ((this.entities[0].stats.health <= 0 || this.entities[1].stats.health <= 0))
        {
            this.is_battle = false;
            this.drawBackground("./imgs/desert.png");
            this.entities[0].stats.health = 50;
            this.entities[1].stats.health = 2000;
            this.menu.showMenu(false);
        }
    }
}

GameEngine.prototype.fight = function(player, foe)
{
    player.fight_animation = player.animations.destroy;
    player.attack_anim = true;
    foe.stats.health = foe.stats.health - ((player.stats.attack / foe.stats.defense) * (Math.random() * 10));
}

GameEngine.prototype.queueAction = function(player, foe)
{
    if(player.fight_animation.looped)
    {
        player.attack_anim = false;
        player.fight_animation.looped = false;
        foe.fight_animation = foe.animations.hit;
        foe.attack_anim = true;
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
Object.freeze(Direction);

/* ENTITY - Super class to the heroes, npcs, and enemies. */
Entity = function (game, x, y, spriteSheet, animations, stats) { 
    this.game = game;
    this.x = x;
    this.y = y; 
    this.direction = Direction.DOWN;
    this.moving = false;
    this.spriteSheet = spriteSheet;
    this.stats = stats;
    this.attack_anim = false;
    if (animations) {
        this.animations = animations;
        this.move_animation = this.animations.down;
        this.stop_move_animation = this.stopAnimation(this.move_animation);
        this.fight_animation = this.animations.destroy;
    }
}

/* Changes the x and y coordinates of the entity depending on which direction they are travelling */
Entity.prototype.changeLocation = function () { 
  
    if (this.game.key !== 0 && this.game.key !== null && !this.game.is_battle) {
        this.moving = true;
        this.changeCoordinates(.5, .5, .5, .5);
    } else {
        this.moving = false;
        this.stop_move_animation = this.stopAnimation(this.move_animation);
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


Statistics = function (health, attack, defense) {
    this.health = health;
    this.attack = attack;
    this.defense = defense;
}

/* HERO and subclasses */
Hero = function (game, x, y, spriteSheet, animations, stats) {
    Entity.call(this, game, x, y, spriteSheet, animations, stats);
}

Hero.prototype = new Entity();
Hero.prototype.constructor = Hero;

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
            this.move_animation = this.animations.down;
            break;
        case Direction.UP:
            this.move_animation = this.animations.up;
            break;
        case Direction.LEFT:
            this.move_animation = this.animations.left;
            break;
        case Direction.RIGHT:
            this.move_animation = this.animations.right;
            break;
    }
}

Hero.prototype.draw = function (context) {
    if (this.game.key !== 0 && this.game.key !== null && this.moving) {
        this.move_animation.drawFrame(this.game.clockTick, context, this.x, this.y);
    } else {
        if (this.game.is_battle && this.attack_anim) {
            this.fight_animation.drawFrame(this.game.clockTick, context, this.x, this.y, 2);
        }
        else if (this.game.is_battle) {
            this.stop_move_animation.drawFrame(this.game.clockTick, context, this.x, this.y, 2);
        }
        else {
            this.stop_move_animation.drawFrame(this.game.clockTick, context, this.x, this.y);
        }
    }
}

Hero.prototype.checkSurroundings = function () {
    // return true or false
    if (Math.round(Math.random() * 1000) >= 999)
    {
        return true;
    }
    else
    {
        return false;
    }
}

Hero.prototype.update = function () {
    if (this.attack_anim && this.fight_animation.looped) {
        //this.fight_animation.looped = false;
        this.attack_anim = false;
    }
    this.changeDirection();
    this.changeMoveAnimation();
    Entity.prototype.changeLocation.call(this);
    if (this.checkSurroundings() && this.moving) {
        this.game.setBattle(this, this.game.entities[1]); 
    }
    if (this.game.space) {
        //console.log(this.game.entities[1].stats.health);
        this.game.fight(this, this.game.entities[1]);
    }
    this.game.queueAction(this, this.game.entities[1]);
    this.game.battleOver();
    

    
}

// Boundary detection
Hero.prototype.boundaryRight = function () {
    return this.x > this.game.context.canvas.width;
}

Hero.prototype.boundaryLeft = function () {
    return this.x < 0; 
}

Hero.prototype.boundaryUp = function () {
    return this.y < 0; 
}

Hero.prototype.boundaryDown = function () {
    return this.y > this.game.context.canvas.height; 
}

Hero.prototype.checkBoundaries = function () {
    if (this.boundaryRight) {
        if (!this.game.map.curr_quadrant === 2 && !this.game.map.curr_quadrant === 5) {
            this.game.map.curr_quadrant += 1;
        }
    } else if (this.boundaryLeft) {
        if (!this.game.map.curr_quadrant === 0 && !this.game.map.curr_quadrant === 3) {
            this.game.map.curr_quadrant -= 1;
        }
    } else if (this.boundaryUp) {
        if (!this.game.map.curr_quadrant === 0 && !this.game.map.curr_quadrant === 1 && !this.game.map.curr_quadrant === 2) {
            this.game.map.curr_quadrant += 1;
        }
    } else if (this.boundaryDown) {

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
        hit: new Animation(this.spriteSheet, 0, 21, 64, 64, 0.05, 12, true, false)
    };
    this.x = 10;
    this.y = 224;
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
Enemy = function (game, stats) {
    this.game = game;
    this.spriteSheet = ASSET_MANAGER.getAsset("./imgs/skeleton.png");
    this.x = 100;
    this.y = 50;
    this.animations = {
        down: new Animation(this.spriteSheet, 0, 10, 64, 64, 0.05, 9, true, false),
        up: new Animation(this.spriteSheet, 0, 8, 64, 64, 0.05, 9, true, false),
        left: new Animation(this.spriteSheet, 0, 19, 64, 64, 0.05, 13, true, false),
        right: new Animation(this.spriteSheet, 0, 11, 64, 64, 0.05, 9, true, false),
        destroy: new Animation(this.spriteSheet, 0, 19, 64, 64, 0.05, 13, true, false),
        hit: new Animation(this.spriteSheet, 0, 20, 64, 64, 0.07, 5, true, false)
    };
    
    Entity.call(this, game, this.x, this.y, this.spriteSheet, this.animations, stats);
    this.stop_move_animation = this.stopAnimation(this.animations.right);
    this.direction = Direction.RIGHT;
}

Enemy.prototype = new Entity();
Enemy.prototype.constructor = Enemy;

Enemy.prototype.draw = function (context) {
    if (this.game.is_battle && this.attack_anim) {
        this.fight_animation.drawFrame(this.game.clockTick, context, this.x, this.y, 2);
    }
    else if (this.game.is_battle)
    {
        this.stop_move_animation.drawFrame(this.game.clockTick, context, this.x, this.y, 2);
    }
}

Enemy.prototype.update = function ()
{
    if(this.attack_anim && this.fight_animation.looped)
    {
        this.fight_animation.looped = false;
        this.attack_anim = false;
    }
}


Enemy.prototype.hit = function ()
{
    
}

/* NPC */
NPC = function (game) {
    this.game = game;
    this.spriteSheet = ASSET_MANAGER.getAsset("./imgs/npc-female.png");
    this.animations = {
        down: new Animation(this.spriteSheet, 0, 10, 64, 64, 0.05, 9, true, false),
        up: new Animation(this.spriteSheet, 0, 8, 64, 64, 0.05, 9, true, false),
        left: new Animation(this.spriteSheet, 0, 9, 64, 64, 0.05, 9, true, false),
        right: new Animation(this.spriteSheet, 0, 11, 64, 64, 0.05, 9, true, false)
    }
    this.x = 160;
    this.y = 224;
    Entity.call(this, game, this.x, this.y, this.spriteSheet, this.animations);
}

NPC.prototype = new Entity();
NPC.prototype.constructor = NPC;

NPC.prototype.draw = function (context) {
    if (!this.game.is_battle) {
        this.move_animation.drawFrame(this.game.clockTick, context, this.x, this.y);
    }
}

NPC.prototype.update = function () {
    if (this.x === 160 && this.y === 224 && this.direction === Direction.DOWN) {
        this.move_animation = this.animations.right;
        this.direction = Direction.RIGHT;
    } else if (this.x === 288 && this.y === 224 && this.direction === Direction.RIGHT) {
        this.move_animation = this.animations.up;
        this.direction = Direction.UP;
    } else if (this.x === 288 && this.y === 224 && this.direction === Direction.UP) {
        this.move_animation = this.animations.left;
        this.direction = Direction.LEFT;
    } else if (this.x === 160 && this.y === 224 && this.direction === Direction.LEFT) {
        this.move_animation = this.animations.down;
        this.direction = Direction.DOWN;
    }
    this.changeCoordinates(0, 0, 0.25, 0.25);
    
}

Tile = function (id, passable, selectable) {
    this.id = id;
    this.passable = passable;
    this.selectable = selectable;
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
    // "Map" will be a double array of integer values. 
    this.map = [[0, 66, 0, 0, 90, 91, 0, 0, 66, 0, 0, 94, 94, 0, 0, 66, 0, 94, 0, 0, 15, 17, 15, 0, 17, 0, 94, 0, 94, 94, 0, 94, 94, 94, 94, 62, 64, 3, 4, 3, 4, 62],
                [67, 68, 69, 94, 92, 93, 94, 67, 68, 69, 94, 95, 95, 94, 67, 68, 69, 95, 90, 91, 18, 16, 18, 15, 16, 94, 95, 94, 95, 95, 94, 95, 95, 95, 95, 3, 4, 5, 6, 5, 6, 63],
                [70, 71, 72, 95, 90, 91, 95, 70, 71, 72, 95, 90, 91, 95, 70, 71, 72, 94, 92, 93, 15, 17, 15, 18, 17, 95, 94, 95, 94, 0, 95, 3, 4, 3, 4, 5, 6, 28, 37, 38, 62, 20],
                [73, 74, 75, 94, 92, 93, 94, 73, 74, 75, 94, 92, 93, 94, 73, 74, 75, 95, 0, 94, 18, 16, 18, 15, 16, 94, 95, 0, 95, 3, 4, 5, 6, 5, 6, 28, 28, 29, 3, 4, 0, 19],
                [76, 76, 78, 95, 90, 91, 95, 76, 78, 76, 95, 90, 91, 95, 76, 78, 76, 0, 94, 95, 94, 1, 94, 18, 94, 95, 94, 94, 0, 5, 6, 28, 28, 63, 28, 29, 29, 0, 5, 6, 3, 4],
                [77, 77, 79, 85, 92, 93, 85, 77, 79, 77, 87, 92, 93, 87, 77, 79, 77, 94, 95, 94, 95, 2, 95, 94, 95, 94, 95, 95, 3, 4, 28, 29, 29, 20, 29, 28, 3, 4, 3, 4, 5, 6],
                [0, 0, 80, 87, 86, 85, 87, 0, 80, 0, 86, 85, 87, 85, 0, 80, 0, 95, 0, 95, 94, 94, 0, 95, 94, 95, 94, 0, 5, 6, 29, 28, 0, 19, 28, 29, 5, 6, 5, 6, 62, 64],
                [7, 8, 7, 8, 7, 8, 7, 8, 7, 8, 7, 8, 7, 8, 7, 8, 7, 8, 7, 8, 95, 95, 94, 94, 95, 0, 95, 3, 4, 28, 0, 29, 3, 4, 29, 3, 4, 0, 28, 0, 3, 4],
                [9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 0, 94, 95, 95, 0, 3, 4, 5, 6, 29, 28, 62, 5, 6, 65, 5, 6, 0, 29, 20, 5, 6],
                [0, 66, 0, 0, 94, 90, 91, 94, 0, 0, 66, 0, 86, 87, 85, 86, 87, 85, 7, 8, 94, 95, 94, 3, 4, 5, 6, 20, 28, 62, 29, 62, 63, 3, 4, 0, 28, 3, 4, 19, 0, 28],
                [67, 68, 69, 94, 95, 92, 93, 95, 94, 67, 68, 69, 85, 86, 87, 85, 86, 87, 9, 10, 95, 94, 95, 5, 6, 37, 38, 19, 29, 37, 38, 3, 4, 5, 6, 28, 29, 5, 6, 3, 4, 29],
                [70, 71, 72, 95, 90, 91, 90, 91, 95, 70, 71, 72, 0, 90, 91, 94, 90, 91, 7, 8, 8, 95, 3, 4, 81, 82, 81, 82, 81, 82, 65, 5, 6, 3, 4, 29, 20, 3, 4, 5, 6, 65],
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
                [0, 0, 92, 93, 95, 95, 95, 95, 95, 5, 6, 5, 6, 64, 37, 38, 62, 62, 19, 62, 65, 5, 6, 29, 29, 0, 29, 62, 37, 38, 5, 6, 29, 37, 38, 33, 63, 63, 33, 62, 31, 63]];



    this.tileSheet = new Tilesheet("./imgs/tiles.png", 32, 26);
    var firesheet1 = ASSET_MANAGER.getAsset("./imgs/fire.png");
    var firesheet2 = ASSET_MANAGER.getAsset("./imgs/fire2.png");
    this.flame1_animation = new Animation(firesheet1, 0, 0, 32, 64, 0.5, 9, true, false);
    this.flame2_animation = new Animation(firesheet2, 0, 0, 32, 32, 0.5, 4, true, false);
    this.flame1_locations = [[0,3],[1,3],[7,3],[14,3],[16,3]];
    this.flame2_locations = [[2, 1], [14, 1], [1, 2], [16, 2]];
    this.quadrants = [[0, 0, 18, 12], [11, 0, 29, 12], [23, 0, 41, 12], [0, 11, 18, 23], [11, 11, 29, 23], [23, 11, 41, 23]];
    this.curr_quadrant = 0;
}

/* Loops over double array called Map, then draws the image of the tile associated with the integer in the map array. */
Environment.prototype.draw = function (context, scaleBy) {
    this.context = context; 
    var scaleBy = (scaleBy || 1);

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

    // draw flames
    for (var i = 0; i < this.flame1_locations.length; i++) {
        var x = this.flame1_locations[i][0];
        var y = this.flame1_locations[i][1];
        this.flame1_animation.drawFrame(this.game.clockTick, this.context, x * 32, y * 32, 1.3);
        
    }
    for (var i = 0; i < this.flame2_locations.length; i++) {
        var x = this.flame2_locations[i][0];
        var y = this.flame2_locations[i][1];
        this.flame2_animation.drawFrame(this.game.clockTick, this.context, x * 32, y * 32, 1.3);
        
    }

}

Environment.prototype.update = function () {

}


GameEngine.prototype.drawBackground = function(img)
{
    this.curr_background = ASSET_MANAGER.getAsset(img);
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


