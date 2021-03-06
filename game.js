var Breakout = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function Breakout ()
    {
        Phaser.Scene.call(this, { key: 'breakout' });

        this.bricks;
        this.paddle;
        this.ball;
        this.particles;
    },

    preload: function ()
    {
        this.load.image('title', 'img/title.png');
        this.load.image('background', 'img/background.jpg');
        this.load.image('paddle', 'img/paddle.png');
        this.load.image('brick', 'img/brick.png');
        this.load.image('brick_top', 'img/brick_top.png');
        this.load.image('floor_1', 'img/floor_1.png');
        this.load.image('floor_2', 'img/floor_2.png');
        this.load.image('ball', 'img/ball.png');

        this.load.atlas('explosion', 'img/explosion.png', 'img/explosion.json');

        this.load.audio('brick_hit', [
            'audio/explode.ogg',
            'audio/explode.mp3'
        ]);
    
    },

    create: function ()
    {
        this.score = 0;
        this.remainingBalls = 3;

        this.soundBrickHit = this.sound.add('brick_hit');

        this.add.image(400, 300, 'background');

        //  Enable world bounds, but disable the ceiling
        this.physics.world.setBoundsCollision(true, true, false, true);

        this.bricks = this.physics.add.staticGroup();

        // Create particle emitter for when bricks get hit
        this.particles = this.add.particles('explosion');

        //  Setting { min: x, max: y } will pick a random value between min and max
        //  Setting { start: x, end: y } will ease between start and end
    
        this.particles.createEmitter({
            frame: [ 'smoke-puff', 'cloud', 'smoke-puff' ],
            angle: { min: 240, max: 300 },
            speed: { min: 30, max: 100 },
            quantity: 4,
            lifespan: 1000,
            alpha: { start: 1, end: 0 },
            scale: { start: 1.5, end: 0.5 },
            on: false
        });
    
        this.particles.createEmitter({
            frame: 'stone',
            angle: { min: 240, max: 300 },
            speed: { min: 100, max: 200 },
            quantity: { min: 2, max: 3 },
            lifespan: 500,
            alpha: { start: 1, end: 0 },
            scale: { min: 0.05, max: 0.4 },
            rotate: { start: 0, end: 360, ease: 'Back.easeOut' },
            gravityY: 800,
            on: false
        });        

        this.ball = this.physics.add.image(400, 100, 'ball').setCollideWorldBounds(true).setBounce(1);
        this.ball.setData('onPaddle', true);

        this.paddle = this.physics.add.image(400, 50, 'paddle').setImmovable();

        //  Our colliders
        this.physics.add.collider(this.ball, this.bricks, this.hitBrick, null, this);
        this.physics.add.collider(this.ball, this.paddle, this.hitPaddle, null, this);

        //  Input events
        this.input.on('pointermove', function (pointer) {

            //  Keep the paddle within the game
            this.paddle.x = Phaser.Math.Clamp(pointer.x, 52, 748);

            if (this.ball.getData('onPaddle'))
            {
                this.ball.x = this.paddle.x;
            }

        }, this);

        this.input.on('pointerup', function (pointer) {

            this.title.visible = false;

            if (this.ball.getData('onPaddle'))
            {
                this.ball.setVelocity(-75, 300);
                this.ball.setData('onPaddle', false);
            }

        }, this);
        
        this.scoreText = this.add.text(10, 570, 'SCORE: 0', { fontSize: '32px', fill: '#fff' });
        this.ballsText = this.add.text(600, 570, 'SHOTS: 3', { fontSize: '32px', fill: '#fff' });

        this.resetCity();

        this.title = this.add.image(400, 300, 'title');
    },

    hitBrick: function (ball, brick)
    {
        brick.disableBody(true, true);

        this.soundBrickHit.play();

        this.particles.emitParticleAt(brick.x, brick.y);

        // Make the scaffolding black
        brick.scaffold.fillColor = 0x000000;
        brick.scaffold.fillAlpha = 0.5;

        this.cameras.main.shake(50, 0.02);

        this.updateScore(1);

        if (this.bricks.countActive() === 0)
        {
            this.resetLevel();
        }
    },

    resetBall: function ()
    {
        if (this.remainingBalls > 0) {

            this.remainingBalls -= 1;

            this.ballsText.setText('SHOTS: ' + this.remainingBalls);

            this.ball.setVelocity(0);
            this.ball.setPosition(this.paddle.x, 100);
            this.ball.setData('onPaddle', true);
        }
    },

    resetLevel: function ()
    {
        this.resetCity();
    },

    hitPaddle: function (ball, paddle)
    {
        var diff = 0;

        if (ball.x < paddle.x)
        {
            //  Ball is on the left-hand side of the paddle
            diff = paddle.x - ball.x;
            ball.setVelocityX(-10 * diff);
        }
        else if (ball.x > paddle.x)
        {
            //  Ball is on the right-hand side of the paddle
            diff = ball.x -paddle.x;
            ball.setVelocityX(10 * diff);
        }
        else
        {
            //  Ball is perfectly in the middle
            //  Add a little random X to stop it bouncing straight up!
            ball.setVelocityX(2 + Math.random() * 8);
        }
    },

    update: function ()
    {
        if (this.ball.y < 0)
        {
            if (this.remainingBalls > 0) {
                this.resetBall();
            } else {
                this.gameOver();
            }
            
        } 
    },

    resetCity: function() 
    {
        this.resetBall();

        // Destroy all of the scaffolds tied to bricks
        this.bricks.children.each(function (brick) {
            brick.scaffold.destroy(true);
            brick.scaffold = null;
        });

        // Clear out the current bricks and scaffolding
        this.bricks.clear(true, true);

        // Create a new set of blueprints for our city
        var blueprints = this.generateBlueprints();

        // I want to center the city on the screen to create the 
        // chance to have gutters on the edges of the screen, so 
        // I'm going to precalculate the x values for all the buildings
        var buildingXs = [];
        var x = 0;
        for (var i = 0; i < blueprints.length; i++) {            

            blueprints[i].x = x;

            // Increment x by the pixel width of a building
            x += blueprints[i].width * 50;

            // Add gaps between buildings (if we're between buildings)
            if (i < blueprints.length - 1) {
                if (this.rnd(0, 3) > 0) {
                    x += this.rnd(0, 50);
                }
            }
        }

        // Calculate the x-offset using the calculated x above plus the width of the last building to get the buildings' full width
        var xOffset = (this.cameras.main.width - x) * 0.5;

        // Draw the city
        for (var i = 0; i < blueprints.length; i++)
        {
            // Determine the color of this building
            var colors = [0xe0c799, 0x8f6f6e, 0x3e878d, 0x772f5f, 0x5eb471, 0xa8947c];
            var buildingColor = colors[i % colors.length];

            var x = blueprints[i].x;

            for (var b = 0; b < blueprints[i].width; b++) {

                for (var y = 0; y < blueprints[i].height; y++) {
                    var buildingX = xOffset + x + 25; // This is weird because the sprites' origin is at their center
                    var buildingY = 525 - y * 32;

                    // Create the background color first for z-axis
                    var scaffold = this.add.rectangle(buildingX, buildingY, 50, 32, buildingColor);

                    // Buildings have tops and bottoms
                    var graphicName = 'brick';
                    if (y == blueprints[i].height - 1) {
                        graphicName = 'brick_top';
                    } else if (y == 0) {
                        graphicName = 'floor_' + this.rnd(1, 2);
                    }
                    var brick = this.bricks.create(buildingX, buildingY, graphicName);

                    // Scaffold holds the colors of the building's bricks
                    brick.scaffold = scaffold; 
                }
                x += 50;
            }

            // Space between buildings
            // if (this.rnd(0, 3) > 0) {
            //     x += this.rnd(0, 50);
            // }
            
        }

        // Bring the ball and particles to the top of the z-order
        this.particles.setDepth(1);
        this.ball.setDepth(1);
    },

    /** Returns an array of blueprints for creating the bricks  */
    generateBlueprints: function()
    {
        var MAX_WIDTH = 12;
        var blueprints = [];
        var totalWidth = 0;

        while (totalWidth < MAX_WIDTH) {
            var width = this.rnd(1, 3);
            var height = this.rnd(5, 10);

            if (totalWidth + width <= MAX_WIDTH) {
                blueprints.push({
                    'width': width, 
                    'height': height});
                totalWidth += width;
            }
        }
        return blueprints;
    },

    // Returns an integer random number within our min/max range
    rnd: function(min,max) {
        return Math.round(Math.random() * (max - min) + min);
    },

    updateScore: function(amt)
    {
        this.score += amt;
        this.scoreText.setText('SCORE: ' + this.score);
    },

    gameOver: function() {

    }
});

var config = {
    type: Phaser.CANVAS,
    width: 800,
    height: 600,
    parent: 'gamebox',
    scene: [ Breakout ],
    physics: {
        default: 'arcade'
    }
};

var game = new Phaser.Game(config);
