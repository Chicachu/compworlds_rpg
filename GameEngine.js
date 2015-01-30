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
}

GameEngine.prototype.init = function (context) {
    this.context = context;
    this.width = this.context.canvas.width;
    this.height = this.context.canvas.height;
    this.timer = new Timer();
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

GameEngine.prototype.draw = function () {
    this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
    this.context.save();

    for (var i = 0; i < this.entities.length; i++) {
        var entity = this.entities[i];
        entity.draw(this.context); 
    }
    this.context.restore();
}

GameEngine.prototype.update = function () {
    for (var i = 0; i < this.entities.length; i++) {
        var entity = this.entities[i];
        entity.update(); 
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

Entity = function (game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
}

Entity.prototype.update = function () {
}

Entity.prototype.draw = function () {
}

Entity.prototype.reset = function () {
}

Hero = function (game, spriteSheet) {
    this.rightAnimation = new Animation(spriteSheet, 0, 2, 32, 32, 0.05, 3, true, false);
    this.downAnimation = new Animation(spriteSheet, 0, 0, 32, 32, 0.05, 3, true, false); 
    this.x = 0;
    this.y = 0;
    this.game = game;
    this.context = game.context;
    this.moveRight = true; 
}

Hero.prototype = new Entity();
Hero.prototype.constructor = Hero;

Hero.prototype.draw = function () {
    if (this.moveRight) {
        this.rightAnimation.drawFrame(this.game.clockTick, this.context, this.x, this.y);
    } else {
        this.downAnimation.drawFrame(this.game.clockTick, this.context, this.x, this.y);
    }
}

Hero.prototype.update = function () {
    if (this.moveRight) {
        this.x += 2;
        if (this.x % 23 === 0) {
            this.moveRight = false; 
        }
    } else {
        this.y += 2;
        if (this.y % 15 === 0) {
            this.moveRight = true; 
        }
    }
}

Enemy = function (game, spriteSheet) {
    this.moveLeftAnimation = new Animation(spriteSheet, 0, 9, 64, 64, 0.05, 9, true, false);
    this.shootLeftAnimation = new Animation(spriteSheet, 0, 18, 64, 64, 0.05, 13, true, false);
    this.moveRightAnimation = new Animation(spriteSheet, 0, 11, 64, 64, 0.05, 9, true, false); 
    this.x = game.context.canvas.width - 1;
    this.y = 100;
    this.game = game;
    this.context = game.context;
    this.moveLeft = true;
    this.shootLeft = true;
}

Enemy.prototype = new Entity();
Enemy.prototype.constructor = Enemy;

Enemy.prototype.draw = function () {
    if (this.moveLeft) {
        this.moveLeftAnimation.drawFrame(this.game.clockTick, this.context, this.x, this.y);
    } else if (this.shootLeft) {
        this.shootLeftAnimation.drawFrame(this.game.clockTick, this.context, this.x, this.y);
    } else {
        this.moveRightAnimation.drawFrame(this.game.clockTick, this.context, this.x, this.y);
    }
}

Enemy.prototype.update = function () {
    if (this.moveLeft) {
        this.x -= 2;
        if (this.x < 220) {
            this.moveLeft = false; 
        }
    } else if (this.shootLeft) {
        if (this.game.timer.gameTime > 3.0) {
            this.shootLeft = false; 
        }
    } else {
        this.x += 2; 
    }
}
