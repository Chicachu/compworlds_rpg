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
}

Animation.prototype.drawFrame = function (tick, context, x, y, scaleBy) {
    this.elapsedTime += tick;
    var scaleBy = scaleBy || 1; 
    if (this.loop) {
        if (this.isDone()) {
            this.elapsedTime = 0;
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
}

GameEngine.prototype.init = function (context) {
    this.context = context;
    this.width = this.context.canvas.width;
    this.height = this.context.canvas.height;
    this.timer = new Timer();
    this.startInput(); 
}

GameEngine.prototype.startInput = function () {
    var that = this;

    this.context.canvas.addEventListener('keydown', function (e) {
        if (String.fromCharCode(e.which) === ' ') {
            that.space = true;
            console.log('space'); 
        } else if (e.which === 37
                   || e.which === 38
                   || e.which === 39
                   || e.which === 40) {
            that.key = e.which;
            console.log('keydown'); 
        }
        e.preventDefault();
    }, false);

    this.context.canvas.addEventListener('keyup', function (e) {
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
    if (this.curr_background)
    {
        this.context.drawImage(this.curr_background, 0, 0);
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
Entity = function (game, x, y, spriteSheet, animations) { 
    this.game = game;
    this.x = x;
    this.y = y; 
    this.direction = Direction.DOWN;
    this.moveRight = true;
    this.health;
    this.spriteSheet = spriteSheet;
    if (animations) {
        this.animations = animations;
        this.move_animation = this.animations.down;
        this.stop_move_animation = this.stopAnimation(this.move_animation);
    }
}

/* Changes the x and y coordinates of the entity depending on which direction they are travelling */
Entity.prototype.changeLocation = function () { 
  
    if (this.game.key !== 0 && this.game.key !== null) {
        switch (this.direction) {
            case Direction.DOWN:
                this.y += 2;
                break;
            case Direction.UP:
                this.y -= 2;
                break;
            case Direction.LEFT:
                this.x -= 2;
                break;
            case Direction.RIGHT:
                this.x += 2;
                break;
        }
    } else {
        this.stop_move_animation = this.stopAnimation(this.move_animation);
    }
    
}

/* Returns the last frame of the last animation used, this is used to show the character stopped but still in the last position of the last
    animation. */
Entity.prototype.stopAnimation = function (animation) {
    return new Animation(this.spriteSheet, animation.currentFrame(), animation.startY, animation.frameWidth, animation.frameHeight, animation.frameDuration, 1, true, false);
}

Entity.prototype.draw = function (context) {
    if (this.game.key !== 0 && this.game.key !== null) {
        this.move_animation.drawFrame(this.game.clockTick, context, this.x, this.y);
    } else {
        this.stop_move_animation.drawFrame(this.game.clockTick, context, this.x, this.y);
    }
}

Entity.prototype.update = function () {
    
}

Entity.prototype.reset = function () {

}


Statistics = function (health, attack, defense) {
    this.health = health;
    this.attack = attack;
    this.defense = defense;
}
/* HERO and subclasses */
Hero = function (game, x, y, spriteSheet, animations) {
    Entity.call(this, game, x, y, spriteSheet, animations);
}

/* Tells the entity what direction they should face depending on what key was pressed. */
Hero.prototype.changeDirection = function () {
    if (this.game.space) {
        // code for selecting something with the space bar. I don't think this will be necessary for the prototype.
    } else if (this.game.key === Direction.LEFT.code) {
        this.direction = Direction.LEFT;
    } else if (this.game.key === Direction.UP.code) {
        this.direction = Direction.UP;
    } else if (this.game.key === Direction.RIGHT.code) {
        this.direction = Direction.RIGHT;
    } else if (this.game.key === Direction.DOWN.code) {
        this.direction = Direction.DOWN;
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
    Entity.prototype.draw.call(this, context);
}

Hero.prototype.update = function () {
    this.changeDirection();
    this.changeMoveAnimation();
    Entity.prototype.changeLocation.call(this);
}

Hero.prototype = new Entity();
Hero.prototype.constructor = Hero;

Warrior = function (game) {
    this.game = game;
    this.spriteSheet = ASSET_MANAGER.getAsset("./imgs/warrior.png");
    this.animations = {
        down: new Animation(this.spriteSheet, 0, 10, 64, 64, 0.05, 9, true, false),
        up: new Animation(this.spriteSheet, 0, 8, 64, 64, 0.05, 9, true, false),
        left: new Animation(this.spriteSheet, 0, 9, 64, 64, 0.05, 9, true, false),
        right: new Animation(this.spriteSheet, 0, 11, 64, 64, 0.05, 9, true, false)
    };
    this.x = 50;
    this.y = 50;
    //var stats = new Statistics(50, 20, 10);
    Hero.call(this, this.game, this.x, this.y, this.spriteSheet, this.animations);
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
Enemy = function (game) {
    this.game = game;
    this.spriteSheet = ASSET_MANAGER.getAsset("./imgs/skeleton.png");
    this.x = 100;
    this.y = 50;
    this.health = 30;
    this.attack = 20;
    this.defense = 5;
    this.animations = {
        down: new Animation(this.spriteSheet, 0, 10, 64, 64, 0.05, 9, true, false),
        up: new Animation(this.spriteSheet, 0, 8, 64, 64, 0.05, 9, true, false),
        left: new Animation(this.spriteSheet, 0, 9, 64, 64, 0.05, 9, true, false),
        // right: new Animation(this.spriteSheet, 0, 11, 64, 64, 0.05, 9, true, false),
        right: new Animation(this.spriteSheet, 0, 19, 64, 64, 0.05, 13, true, false)
    };
    Entity.call(this, game, this.x, this.y, this.spriteSheet, this.animations);
}

Enemy.prototype = new Entity();
Enemy.prototype.constructor = Enemy;

Enemy.prototype.draw = function (context) {
    Entity.prototype.draw.call(this, context);
}
Enemy.prototype.update = function () {
    Entity.prototype.update.call(this);
}

Enemy.prototype.attack = function (vs_player) {

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
    };

    this.x = 10;
    this.y = 10;
    Entity.call(this, game, this.x, this.y, this.spriteSheet, this.animations);
}

NPC.prototype = new Entity();
NPC.prototype.constructor = NPC;

NPC.prototype.draw = function (context) {
    Entity.prototype.draw.call(this, context);
}

NPC.prototype.update = function () {
    Entity.prototype.update.call(this);
}



/* BACKGROUND : sheetWidth being how many tiles wide the sheet is. */
Tilesheet = function (tileSheetPathName, tileSize, sheetWidth) {
    if (tileSheetPathName) {
        this.sheet = ASSET_MANAGER.getAsset(tileSheetPathName);
    }
    this.tileSize = tileSize;
    this.sheetWidth = sheetWidth;
}

Background = function () {
    // "Map" will be a double array of integer values. Each value will correspond to a map tile. 
    // tile associated with it taken from our condensed tile sheet. 
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



BattleScreen = function(img, game)
{
    this.game = game;
    this.img = img;
}

BattleScreen.prototype.drawBackground = function()
{
    this.game.curr_background = ASSET_MANAGER.getAsset(this.img);
}


