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
}

GameEngine.prototype.init = function (context) {
    this.context = context;
    this.width = this.context.canvas.width;
    this.height = this.context.canvas.height;
    this.timer = new Timer();
    this.startInput();
    this.menu = new BattleMenu(document.getElementById("battle_menu"));
    this.context.canvas.focus();
}

GameEngine.prototype.startInput = function () {
    var that = this;

    document.addEventListener('keydown', function (e) {
        if (String.fromCharCode(e.which) === ' ') {
            that.space = true;
        } else if (e.which === 37
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

GameEngine.prototype.setBattle = function (player, foe) {
    this.is_battle = true;
    this.drawBackground("./imgs/woods.png");
    player.x = 350;
    player.y = 250;
    player.direction = Direction.LEFT;
    foe.x = 100;
    foe.y = 250;
    this.menu.showMenu(true);
    player.fight_animation = player.stopAnimation(fight_animation);
    foe.fight_animation = foe.stopAnimation(fight_animation);
}

GameEngine.prototype.battleOver = function ()
{
    if(this.is_battle)
    {
        if (this.entities[0].stats.health <= 0 && this.entities[0].fight_animation.looped && this.entities[1].fight_animation.looped)
        {
            this.is_battle = false;
            this.drawBackground("./imgs/desert.png");
            this.entities[0].stats.health = 50;
        }
        else if (this.entities[1].stats.health <= 0 && this.entities[1].fight_animation.looped && this.entities[0].fight_animation.looped)
        {
            this.entities[1].stats.health = 1000;
            this.is_battle = false;
        }
    }
}

GameEngine.prototype.fight = function(player, foe)
{
    player.fight_animation = player.animations.destroy;
    player.attack_anim = true;
    foe.stats.health = foe.stats.health - ((player.stats.attack / foe.stats.defense) * (Math.random() * 10));
    foe.fight_animation = foe.animations.hit;
    foe.attack_anim = true;
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
        this.moving = false;
        this.stop_move_animation = this.stopAnimation(this.move_animation);
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

Entity.prototype.fight = function (vs_player) {
    this.fight_animation = this.animations.destroy;
    this.attack_anim = true;
    vs_player.stats.health = vs_player.stats.health - ((this.stats.attack / vs_player.stats.defense) * (Math.random() * 10));
    vs_player.fight_animation = vs_player.animations.hit;

    vs_player.attack_anim = true;
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
    if (Math.round(Math.random() * 1000) >= 500)
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
        this.fight_animation.looped = false;
        this.attack_anim = false;
    }
    this.changeDirection();
    this.changeMoveAnimation();
    Entity.prototype.changeLocation.call(this);
    if (this.checkSurroundings() && this.moving) {
        this.game.setBattle(this, this.game.entities[1]); 
    }
    if (this.game.space) {
        console.log(this.game.entities[1].stats.health);
        this.game.fight(this, this.game.entities[1]);
    }

    this.game.battleOver();
    
    
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
    this.x = 50;
    this.y = 50;
    //var stats = new Statistics(50, 20, 10);
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
    else
    {
        this.stop_move_animation.drawFrame(this.game.clockTick, context, this.x, this.y);
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
        destroy: new Animation(this.spriteSheet, 0, 9, 64, 64, 0.05, 9, true, false),
        right: new Animation(this.spriteSheet, 0, 11, 64, 64, 0.05, 9, true, false)
    }
    this.x = 10;
    this.y = 10;
    Entity.call(this, game, this.x, this.y, this.spriteSheet, this.animations);
}

NPC.prototype = new Entity();
NPC.prototype.constructor = NPC;

NPC.prototype.draw = function (context) {
    if (this.game.is_battle) {
        //do nothing? (un-draw npc?)
    }
    else {
        this.stop_move_animation.drawFrame(this.game.clockTick, context, this.x, this.y);
    }}

NPC.prototype.update = function () {

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


