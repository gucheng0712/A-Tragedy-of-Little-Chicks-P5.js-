var mother;
var motherDamage = 100;
var countForDamaged;
var savedChicks;
var savedChicksNum;
var collectionsGroup;

var isFight;
var easing = 0.5;
var enemyNum;
var enemyGroup;
var enemyHeartNum;
var enemyType = [];
var enemyDistance = 80;
var enemyPosArray;
var enemySpawnFrame = 120;

var obstacleGroup;

//Settings
var gameState;
var canvasShakeAmplitude = 12;
var isPause = false;
var startDelay;

// for particles...
var maxParticles, particleBreakDistance, repelDist;
var particles = [];

// text transparency animation
var textColorState = "Transparent";
var transparencyBG = 0;

//images...
var motherImage, childImg, dogImg, catImg, racoonImg, wolfImg, elephantImg;
var fightingAnim;
//sounds...
var menuBGM, gameBGM, gameOverSound, collectSound, fightingSound

// lerp color variables
var bgColor;
var bgStartColor;
var bgTargetColor;

var transitionStart = -1;
var transitionDuration = 900000;

// Score caculation varables
var score;

function preloadImages() {
    motherImg = loadImage("images/Chicken Mother.png");
    childImg = loadImage("images/chick.png");

    //enemy image
    catImg = loadImage("images/cat.png");
    sheepImg = loadImage("images/sheep.png");
    dogImg = loadImage("images/dog.png");
    racoonImg = loadImage("images/racoon.png");
    pigImg = loadImage("images/pig.png");
    wolfImg = loadImage("images/wolf.png");
    bearImg = loadImage("images/wolf.png");
    snakeImg = loadImage("images/snake.png");
    eagleImg = loadImage("images/eagle.png");
    tigerImg = loadImage("images/tiger.png");
    crocodileImg = loadImage("images/crocodile.png");
    elephantImg = loadImage("images/elephant.png");

    // UI Image
    chickImg = loadImage("images/chickui.png");
    playImg = loadImage("images/play-button.png");
}

function preloadSounds() {
    menuBGM = loadSound("sounds/menu.mp3");
    gameBGM = loadSound("sounds/bg1.mp3");
    //gameOverSound = loadSound("sounds/end.mp3");
    collectSound = loadSound("sounds/collected.wav");
    fightingSound = loadSound("sounds/fighting.mp3");
}

function preloadAnimationSpriteSheet() {
    fightingAnim = loadAnimation("images/FightAnimation0001.png", "images/FightAnimation0005.png");
}

function preload() {
    preloadImages();
    preloadSounds();
    preloadAnimationSpriteSheet()
}

function startGame() {

    // Clear everything when restart the game 
    for (var i = allSprites.length - 1; i >= 0; i--) {
        var sprite = allSprites[i];
        sprite.remove();
    }
    if (gameBGM.isPlaying()) {
        gameBGM.stop();
    }

    // initialization
    savedChicks = [];
    enemyPosArray = [];
    gameState = "GameMenu";
    isFight = false;
    countForDamaged = 0;
    isPause = false;
    enemyNum = 0;
    bgColor = color(0, 0, 0);
    bgTargetColor = bgColor;
    particlePreSet();

    // play menu music
    menuBGM.setVolume(0.1);
    menuBGM.loop();
    menuBGM.play();

    //create the collectionsGroup
    collectionsGroup = new Group();

    //create the enemyGroup
    enemyGroup = new Group();

    // create enemyType array
    enemyType = [catImg, sheepImg, dogImg, racoonImg, pigImg, wolfImg, bearImg, snakeImg, eagleImg, tigerImg, crocodileImg, elephantImg];
    // create chicken mother group
    mother = new Mother(200, 300, 0.2);

    // initialize in the beginning how many chicks that chicken mother has
    savedChicksNum = 5;
    for (var i = 0; i < savedChicksNum; i++) {
        savedChicks[i] = new SavedChicks(200, 335, 1.3)
        savedChicks[i].y += 30 * i;
        savedChicks[i].positionChick();
    }
    // enemy spawn position array
    enemyPosArray = [50, 150, 250, 350];
    // obstacles group
    obstacleGroup = new Group();

}

function setup() {
    createCanvas(400, 600);
    startGame();
}

// backgroud particles
function particlePreSet() {
    strokeWeight(2);
    stroke(255);

    maxParticles = 30;
    repelDist = max(width, height) / 8;
    particleBreakDistance = max(width, height) / 40;
    while (particles.length < maxParticles) {
        obj = [createVector(random(width), random(height)), createVector(random(4) - 2, random(4) - 2)];
        particles.push(obj);
    }
}

// Use for generating obstacles, collections, and enemy.
function mapGenerators() {
    // generate collection every 60 frame ~= 1s
    if (frameCount % 60 == 0) {
        var randomPosX = random(50, width - 50);
        var randomPosY = -100;
        var collection = new Collections(randomPosX, randomPosY);
    }

    // generate collection every 60 frame ~= 1s
    // may be will inscrease the generate rate by the time to set certain levels
    if (frameCount % 120 == 0) {
        enemySpawnFrame--;
        motherDamage--;
        if (enemySpawnFrame < 60) {
            enemySpawnFrame = 60;
        }
        if (motherDamage < 50) {
            motherDamage = 50;
        }
    }

    if (frameCount % enemySpawnFrame == 0) {

        // a random variable to choose how many enemies should spawn
        enemyNum = int(random(1, 5));

        // make sure the enemy spawn position are not overlap
        // so use a temp array to save the position which are already used when each time enemy spawn
        var removedPos = [];

        // the starting Y position of enemy
        var randomPosY = -500;
        switch (enemyNum) {
            case 1:
                var randomPosX = enemyPosArray[Math.floor(Math.random() * enemyPosArray.length)];
                var randomEnemy = enemyType[Math.floor(Math.random() * enemyType.length)];
                createEnemy(randomPosX, randomPosY, randomEnemy);

                break;
            case 2:
                for (var i = 0; i < 2; i++) {
                    var randomIndex = Math.floor(Math.random() * enemyPosArray.length);
                    var randomPosX = enemyPosArray[randomIndex];
                    var randomEnemy = enemyType[Math.floor(Math.random() * enemyType.length)];
                    createEnemy(randomPosX, randomPosY, randomEnemy);
                    enemyPosArray.splice(randomIndex, 1);
                    removedPos.push(randomPosX);
                }

                // after spawning position, the enemyPosArray should reset
                for (var j = 0; j < removedPos.length; j++) {
                    enemyPosArray.push(removedPos[j]);
                }
                // at the same time the removedPos should reset
                removedPos.splice(0, removedPos.length);
                break;
            case 3:
                for (var i = 0; i < 3; i++) {
                    var randomIndex = Math.floor(Math.random() * enemyPosArray.length);
                    var randomPosX = enemyPosArray[randomIndex];
                    var randomEnemy = enemyType[Math.floor(Math.random() * enemyType.length)];
                    createEnemy(randomPosX, randomPosY, randomEnemy);
                    enemyPosArray.splice(randomIndex, 1);
                    removedPos.push(randomPosX);
                }
                for (var j = 0; j < removedPos.length; j++) {
                    enemyPosArray.push(removedPos[j]);
                }
                removedPos.splice(0, removedPos.length);
                break;
            case 4:
                for (var i = 0; i < 4; i++) {
                    var randomIndex = Math.floor(Math.random() * enemyPosArray.length);
                    var randomPosX = enemyPosArray[randomIndex];
                    var randomEnemy = enemyType[Math.floor(Math.random() * enemyType.length)];
                    createEnemy(randomPosX, randomPosY, randomEnemy);
                    enemyPosArray.splice(randomIndex, 1);
                    removedPos.push(randomPosX);
                }
                for (var j = 0; j < removedPos.length; j++) {
                    enemyPosArray.push(removedPos[j]);
                }
                removedPos.splice(0, removedPos.length);
                break;
        }
    }
}

// the function that create enemy sprite
function createEnemy(x, y, enemyType) {
    var enemySprite = createSprite(x, y);
    enemySprite.addImage(enemyType);
    enemySprite.setCollider("rectangle");
    enemySprite.health = setHealth(enemyType);
    enemyGroup.add(enemySprite);
    var percentOfSpawnObstacles = int(random(100));

    // make the obstacle spawn percent be half of the enemy spawn percentage
    if (percentOfSpawnObstacles % 2 == 0) {
        createObstacles(x, y, random(100, 200));
    }

    // if overlap then remove
    enemySprite.overlap(enemyGroup, removeSprite);

}

// the function that create obstacles sprite
function createObstacles(x, y, height) {
    var obstacleSprite = createSprite(x + 40, y + height / 2 - 20, 8, height);
    obstacleSprite.setCollider("rectangle");
    obstacleGroup.add(obstacleSprite);
    obstacleSprite.overlap(obstacleGroup, removeSprite);

}

// determine the different enemy health
function setHealth(img) {
    switch (img) {
        case catImg:
            return 50;
        case sheepImg:
            return 100;
        case dogImg:
            return 150;
        case racoonImg:
            return 200;
        case pigImg:
            return 250;
        case wolfImg:
            return 300;
        case bearImg:
            return 350;
        case snakeImg:
            return 400;
        case eagleImg:
            return 500;
        case tigerImg:
            return 600;
        case crocodileImg:
            return 700;
        case elephantImg:
            return 800;
    }
}

// for debuging, do not have to call it
function debugSprites() {
    // for debuging
    mother.headSprite.debug = true;
    mother.motherSprite.debug = true;

    for (var i = 0; i < collectionsGroup.length; i++) {
        collectionsGroup[i].debug = true;
    }
    for (var i = 0; i < enemyGroup.length; i++) {
        enemyGroup[i].debug = true;
    }
    for (var i = 0; i < obstacleGroup.length; i++) {
        obstacleGroup[i].debug = true;
    }
}

function enemyBehaviors() {
    for (var i = 0; i < enemyGroup.length; i++) {
        fill(209, 32, 12);
        stroke(0);
        rect(enemyGroup[i].position.x - 40, enemyGroup[i].position.y - 50, enemyGroup[i].health / 10, 10);

        if (!isFight) {
            enemyGroup[i].velocity.y = 5;
        } else {
            enemyGroup[i].velocity.y = 0;
        }
        if (enemyGroup[i] != null) {
            if (enemyGroup[i].position.y > height + 100) {
                enemyGroup[i].remove();
            }
        }

        // battle
        if (enemyGroup[i] != null) {
            if (mother.headSprite.overlap(enemyGroup[i])) {
                countForDamaged++;
                if (countForDamaged == 10) {
                    savedChicksNum--;
                    countForDamaged = 0;
                    if (savedChicks[savedChicks.length - 1] == null) {
                        return;
                    }
                    savedChicks[savedChicks.length - 1].savedChickSprite.remove();
                    savedChicks.splice(savedChicks.length - 1, 1);

                }
                if (enemyGroup[i].health <= 0) {
                    enemyGroup[i].remove();
                }
            }
        }
    }

}

function collectionBehaviors() {
    // remove collection after it go over the screen 
    for (var j = 0; j < collectionsGroup.length; j++) {
        if (!isFight) {
            collectionsGroup[j].velocity.y = 5;
        } else {
            collectionsGroup[j].velocity.y = 0;
        }
        if (collectionsGroup[j].position.y > height + 100) {
            collectionsGroup[j].remove();
        }
    }
}

function obstacleBehaviors() {
    for (var k = 0; k < obstacleGroup.length; k++) {
        if (!isFight) {
            obstacleGroup[k].velocity.y = 5;
        } else {
            obstacleGroup[k].velocity.y = 0;
        }
        if (obstacleGroup[k].position.y > height + 200) {
            obstacleGroup[k].remove();
        }
    }
}

function objectsBehaviors() {
    // debugSprites()
    enemyBehaviors()
    collectionBehaviors()
    obstacleBehaviors()
    enemyGroup.overlap(collectionsGroup, removeSprite);
    obstacleGroup.overlap(collectionsGroup, removeSprite);

}

// callback function for overlaping 
function removeSprite(e, c) {
    c.remove();
}

function drawParticles() {
    fill(255, 255, 255, 220);
    noStroke();

    var mousePos = createVector(mouseX, mouseY);

    for (var i = 0; i < particles.length; i++) {
        var pos = particles[i][0];
        var speed = particles[i][1];
        var randSize = 3 + random(4);
        ellipse(pos.x, pos.y, randSize, randSize);
        if (!isFight) {
            pos.y += 6;
        }
        pos.add(speed);

        var distToMouse = mousePos.dist(pos);

        if (distToMouse < repelDist) {
            var repel = createVector(pos.x - mousePos.x, pos.y - mousePos.y);
            var distFrac = (repelDist - distToMouse) / repelDist
            repel.setMag(50 * distFrac * distFrac);
            pos.add(repel);
        }

        if (pos.x > width) {
            pos.x -= width;
            pos.y += random(height / 10) - height / 20;
        } else if (pos.x < 0) {
            pos.x += width;
            pos.y += random(height / 10) - height / 20;
        }

        if (pos.y > height) {
            pos.y -= height;
            pos.x += random(width / 10) - width / 20;
        } else if (pos.y < 0) {
            pos.y += height;
            pos.x += random(width / 10) - width / 20;
        }
    }
    particleBreakDistance = min(particleBreakDistance + 1, width / 12);
}

function textAnimation() {
    //text animation
    if (textColorState == "Transparent") {
        transparencyBG += 3;
        if (transparencyBG >= 220) {
            textColorState = "Solid";
        }
    } else if (textColorState == "Solid") {
        transparencyBG -= 2;
        if (transparencyBG <= 0) {
            textColorState = "Transparent";
        }
    }
}

function drawGameStartMenu() {

    //Title
    fill(255);
    textFont("fantasy");
    textSize(40);
    textAlign(CENTER);
    textStyle(BOLD);
    text("A Tragedy\nof\nLittle Chicks", 200, 150)
    fill(255, 255, 255, transparencyBG);
    textSize(20);
    text("Tap to start", 200, 400);

}

function drawUI() {

    if (score < 100) {
        fill(255, transparencyBG);
        noStroke();
        textAlign(CENTER);
        textStyle(BOLD);
        textFont("monospace", 15);
        text("when encountering an enemy\npress mouse to attack it!!!!!", 200, 200);
    }


    if (!isPause) {
        //pause menu
        fill(255);
        stroke(0);
        rect(20, 20, 8, 25);
        rect(32, 20, 8, 25);
    } else {
        image(playImg, 10, 10, 40, 40);
    }

    // score and hp
    fill(15, 167, 255, 200);
    noStroke();
    rect(-50, 550, 700, 100);
    image(chickImg, 20, 553, 35, 41);
    textSize(25);
    fill(255);
    textAlign(CENTER);
    textStyle(BOLD);
    stroke(2);
    text(" x " + savedChicks.length, 75, 582);
    score = int(millis() / 100) - startDelay;
    text("Score: " + score, 300, 582);
}

function drawGameOverMenu() {
    textAlign(CENTER);
    textFont("fantasy");
    textStyle(BOLD);
    textSize(40);
    text("╥_╥", 200, 100)
    text("Score\n" + score, 200, 300);
    textSize(16);
    text("The poor chicks were all eaten by bad animals\n \nBut at least,\nyou help chicks to survive a little more longer!", 200, 170);
    textSize(20);
    fill(255, 255, 255, transparencyBG);
    text("Press any key to try again!", 200, 400);
}

function lerpBackgroundColor() {


    if (transitionStart > -1) {
        var elapsedTime = millis() - transitionStart;

        if (elapsedTime > transitionDuration) {
            bgColor = bgTargetColor
            // make the stransitionStart to be null 
            transitionStart = -1;
        }
        var t = elapsedTime / transitionDuration;
        bgColor = lerpColor(bgColor, bgTargetColor, t);
    }

    if (frameCount % 600 == 0) {
        transitionStart = millis();
        bgStartColor = bgColor;
        bgTargetColor = color(random(255), random(255), random(255));
    }
}

function mainGameLoop() {
    textAnimation()
    background(bgColor);
    //instruction

    lerpBackgroundColor();
    drawParticles();
    if (gameState == "GameOver") {
        drawGameOverMenu();
    }
    if (savedChicksNum < 0) {
        gameState = "GameOver";
    }

    if (gameState == "GameMenu") {
        drawGameStartMenu();
    }


    if (gameState == "Playing") {
        mother.update();

        //if no arrow input set mother's velocity to 0
        var xc = constrain(mouseX, 20, 380);
        mother.motherSprite.velocity.x = (xc - mother.motherSprite.position.x) * 0.08;
        mother.headSprite.position.x = mother.motherSprite.position.x;
        mother.headSprite.position.y = mother.motherSprite.position.y - 20;

        // make the children follow mother with easing
        for (var i = 0; i < savedChicks.length; i++) {
            if (savedChicks[i].savedChickSprite.collide(enemyGroup)) {
                easing = 0.1;
            } else {
                easing = 0.5;
            }
            if (savedChicks != null) {
                savedChicks[i].savedChickSprite.position.y = 335 + 30 * i;
            }
            if (i == 0) {
                savedChicks[i].savedChickSprite.velocity.x = (mother.motherSprite.position.x - savedChicks[i].savedChickSprite.position.x) * easing;
            } else {
                savedChicks[i].savedChickSprite.velocity.x = (savedChicks[i - 1].savedChickSprite.position.x - savedChicks[i].savedChickSprite.position.x) * easing;
            }
            savedChicks[i].update();
        }
        objectsBehaviors();
        // Draw all sprites on the screen
        drawSprites();

        if (isFight) {
            animation(fightingAnim, mother.motherSprite.position.x, mother.motherSprite.position.y - 30);
        }
        drawUI();

    }
}

function draw() {
    mainGameLoop();
}

function mousePressed() {
    if (gameState == "GameMenu") {
        gameState = "Playing";
        menuBGM.stop();
        gameBGM.setVolume(0.1);
        gameBGM.loop();
        startDelay = int(millis() / 100);
    }
    if (gameState == "Playing") {
        if (mouseX >= 10 && mouseX <= 50 && mouseY >= 10 && mouseY <= 50) {
            isPause = !isPause;
            if (isPause == false) {
                loop();
                gameBGM.play();
            } else {
                noLoop();
                gameBGM.pause();
            }
        }

        if (isPause == false) {
            for (var i = 0; i < enemyGroup.length; i++) {
                if (enemyGroup[i] != null) {
                    if (mother.headSprite.overlap(enemyGroup[i])) {
                        enemyGroup[i].health -= motherDamage;
                        fightingSound.play();
                        fightingSound.setVolume(0.1);
                    }
                }
            }
        }
    }
}

function keyPressed() {
    print(score);
    if (gameState == "GameOver") {
        clear();
        startGame();
    }
}
//---------------Objects---------------//
function Mother(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.motherSprite = createSprite(this.x, this.y, 50, 50);
    this.motherSprite.addImage(motherImg);
    this.motherSprite.scale = this.size;

    this.headSprite = createSprite(this.x, this.y, 30, 10);
    this.headSprite.setCollider("rectangle");
    this.headSprite.visible = false;
    this.positionMother = function () {

        this.motherSprite.position.y = 300;
        var offset = 20;
        if (this.motherSprite.position.x > width - offset) {
            this.motherSprite.position.x = width - offset;
        } else if (this.motherSprite.position.x < offset) {
            this.motherSprite.position.x = offset;
        }
    }
    this.update = function () {
        this.motherSprite.overlap(collectionsGroup, this.addIntoCollection);
        this.motherSprite.collide(obstacleGroup);
        this.motherSprite.collide(enemyGroup);

        if (this.headSprite.collide(enemyGroup)) {
            isFight = true;
            translate(random(canvasShakeAmplitude), random(canvasShakeAmplitude));
        } else {
            isFight = false;
            mapGenerators();
        }

        this.positionMother();
        this.lookDir();
        var t = savedChicksNum / 20;
        if (t >= 1) {
            t = 1;
        }
        var numColor = lerpColor(color(0, 255, 255), color(255, 0, 0), t);
        fill(numColor);
        textSize(20);
        stroke(0);
        textAlign(CENTER);

        text(String(savedChicks.length), this.motherSprite.position.x, this.motherSprite.position.y - 30);



    }
    // make the mother look at mouse moving direction
    this.lookDir = function () {
        if (mouseX >= mother.x) {
            this.motherSprite.mirrorX(1);
        } else {
            this.motherSprite.mirrorX(-1);
        }
    }
    // a callback function for motherSprite overlap with collectionsGroup
    this.addIntoCollection = function (collector, collected) {
        savedChicksNum++;
        collectSound.setVolume(0.01);
        collectSound.play();
        collected.remove();
        savedChicks.push(new SavedChicks(mother.motherSprite.position.x, 335 + 30 * savedChicks.length, 1.3));
    }

}

function SavedChicks(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.savedChickSprite = createSprite(this.x, this.y);
    this.savedChickSprite.addImage(childImg);
    this.savedChickSprite.scale = this.size;


    this.positionChick = function () {
        this.savedChickSprite.position = createVector(this.x, this.y);
        this.savedChickSprite.setCollider("circle");
    }
    this.update = function () {
        // savedChick update
        //this.savedChickSprite.debug = true;
        this.savedChickSprite.collide(enemyGroup);
        this.savedChickSprite.collide(obstacleGroup);

    }
}

function Collections(x, y) {
    this.x = x;
    this.y = y;
    this.collectionSprite = createSprite(this.x, this.y);
    this.collectionSprite.addImage(childImg);
    this.collectionSprite.setCollider("circle");
    collectionsGroup.add(this.collectionSprite);
}
