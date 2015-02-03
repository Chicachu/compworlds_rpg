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

    this.context.canvas.addEventListener("keydown", function (e) {
        that.key = null;
        that.space = null; 
        if (String.fromCharCode(e.which) === ' ') {
            that.space = true;
        } else if (String.fromCharCode(e.which) === '37'
                   || String.fromCharCode(e.which) === '38'
                   || String.fromCharCode(e.which) === '39'
                   || String.fromCharCode(e.which) === '40') {
            that.key = String.fromCharCode(e.which);
        }
        e.preventDefault();
    }, false);

    this.context.canvas.addEventListener("keyup", function (e) {
        that.key = null;
        that.space = null;
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
    UP: { value: "up", code: "38" },
    LEFT: { value: "left", code: "37" },
    DOWN: { value: "down", code: "40" },
    RIGHT: { value: "right", code: "39" }
}
Object.freeze(Direction);

Entity = function (game, x, y, spriteSheet) {
    this.game = game;
    this.x = x;
    this.y = y; 
    this.direction = Direction.DOWN;
    this.moveRight = true;
    this.health;
    this.down_animation = new Animation(spriteSheet, 0, 10, 64, 64, 0.05, 9, true, false);
    this.up_animation = new Animation(spriteSheet, 0, 8, 64, 64, 0.05, 9, true, false);
    this.left_animation = new Animation(spriteSheet, 0, 9, 64, 64, 0.05, 9, true, false);
    this.right_animation = new Animation(spriteSheet, 0, 11, 64, 64, 0.05, 9, true, false);
}

/* ENTITY - Super class to the heroes, npcs, and enemies. */ 
Entity.prototype.draw = function (context) {
    var direction_animation = this.down_animation; 
    switch (this.direction) {
        case Direction.DOWN:
            direction_animation = this.down_animation;
            break;
        case Direction.UP:
            direction_animation = this.up_animation;
            break;
        case Direction.LEFT:
            direction_animation = this.left_animation;
            break;
        case Direction.RIGHT:
            direction_animation = this.right_animation;
            break;
        default:
            direction_animation = this.down_animation;
    }
    direction_animation.drawFrame(this.game.clockTick, context, this.x, this.y); 
}

Entity.prototype.update = function () {
    if (this.game.space) {
        // code for selecting something with the space bar. I don't think this will be necessary for the prototype.
    } else if (this.game.key === '37') { // left
        this.direction = Direction.LEFT;
    } else if (this.game.key === '38') { // up
        this.direction = Direction.UP;
    } else if (this.game.key === '39') { // right
        this.direction = Direction.RIGHT;
    } else if (this.game.key === '40') { // down
        this.direction = Direction.DOWN;
    }
    switch (this.Direction) {
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
            this.y += 2;
            break;
        default:;
    }
}

Entity.prototype.reset = function () {
    
}

/* HERO subclasses */ 

Warrior = function (game) {
    this.game = game; 
    this.spriteSheet = ASSET_MANAGER.getAsset("./imgs/warrior.png");
    this.x = 50;
    this.y = 50; 
    Entity.call(this, game, this.x, this.y, this.spriteSheet); 
}

Warrior.prototype = new Entity();
Warrior.prototype.constructor = Warrior;

Warrior.prototype.draw = function (context) {
    Entity.prototype.draw.call(this, context);
}

Warrior.prototype.update = function () {
    Entity.prototype.update.call(this); 
}

/* ENEMY and subclasses */

/* NPC */

