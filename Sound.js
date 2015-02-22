// JavaScript source code

/*
Part 1 - Working with sound files
=================================
*/

//Load the sounds
sounds.load([
  "sounds/shoot.wav",
  "sounds/AncientForest.wav",
  "sounds/bounce.mp3"
]);

//Assign the callback function that should run
//when the sounds have loaded
sounds.whenLoaded = setup;

function setup() {
    console.log("sounds loaded");

    //Create the sounds
    var shoot = sounds["sounds/shoot.wav"],
        music = sounds["sounds/AncientForest.wav"],
        bounce = sounds["sounds/bounce.mp3"];

    //Pan the shoot sound to the right
    shoot.pan = 0.8;

    //Make the music loop
    music.loop = true;

    //Set the pan to the left
    music.pan = -0.8;

    //Set the music volume
    music.volume = 0.7;

    //Set a reverb effect on the bounce sound
    //arguments: duration, decay, reverse?
    //music.setReverb(2, 2, false);

    //Set the sound's `reverb` property to `false` to turn it off
    //music.reverb = false;

    //Add an echo effect to the bounce sound
    //arguments: delay time, feedback time, optional frequency filtering
    bounce.setEcho(0.2, 0.3, 1000);

    //Set `echo` to false to turn it off
    //bounce.echo = false;

    //Optionally set the music playback rate to half speed
    //music.playbackRate = 0.5;


    //Capture the keyboard events
    var k = keyboard(75);
        l = keyboard(76);

    //Control the sounds based on which keys are pressed

    //Play the loaded music sound
    k.press = function () {
        if (!music.isPlaying) music.play();
        if (music.pause) music.restart();
        console.log("music playing");
    };

    //Pause the music 
    l.press = function () {
        music.pause();
        console.log("music paused");
    };

    //Restart the music 
    d.press = function () {
        music.restart();
        console.log("music restarted");
    };

}

/*
Part 2 - Working with sound effects
===================================
*/

var g = keyboard(71),
    h = keyboard(72),
    i = keyboard(73),
    j = keyboard(74);

g.press = function () { shootSound() };
h.press = function () { jumpSound() };
i.press = function () { explosionSound() };
j.press = function () { bonusSound() };

//The sound effect functions

//The shoot sound
function shootSound() {
    soundEffect(
      1046.5,           //frequency
      0,                //attack
      0.3,              //decay
      "sawtooth",       //waveform
      1,                //Volume
      -0.8,             //pan
      0,                //wait before playing
      1200,             //pitch bend amount
      false,            //reverse bend
      0,                //random pitch range
      25,               //dissonance
      [0.2, 0.2, 2000], //echo: [delay, feedback, filter]
      undefined         //reverb: [duration, decay, reverse?]
    );
}

//The jump sound
function jumpSound() {
    soundEffect(
      523.25,       //frequency
      0.05,         //attack
      0.2,          //decay
      "sine",       //waveform
      3,            //volume
      0.8,          //pan
      0,            //wait before playing
      600,          //pitch bend amount
      true,         //reverse
      100,          //random pitch range
      0,            //dissonance
      undefined,    //echo: [delay, feedback, filter]
      undefined     //reverb: [duration, decay, reverse?]
    );
}

//The explosion sound
function explosionSound() {
    soundEffect(
      16,          //frequency
      0,           //attack
      1,           //decay
      "sawtooth",  //waveform
      1,           //volume
      0,           //pan
      0,           //wait before playing
      0,           //pitch bend amount
      false,       //reverse
      0,           //random pitch range
      50,          //dissonance
      undefined,   //echo: [delay, feedback, filter]
      undefined    //reverb: [duration, decay, reverse?]
    );
}

//The bonus points sound
function bonusSound() {
    //D
    soundEffect(587.33, 0, 0.2, "square", 1, 0, 0);
    //A
    soundEffect(880, 0, 0.2, "square", 1, 0, 0.1);
    //High D
    soundEffect(1174.66, 0, 0.3, "square", 1, 0, 0.2);
}
