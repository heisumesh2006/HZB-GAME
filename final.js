function Actor(ctx, startPosition, canvas, camera, collisionHandler, resources) {
    var _this = this;

    this._init = function () {
        this.camera = camera;
        this.canvas = canvas;
        this.dynamicUp = 0;
        this.collisionHandler = collisionHandler;
        this.frameIndex = 0;

        this.tickCount = 0;
        this.ticksPerFrame = 10;
        this.noOfFrames = 4;

        this.spriteWidth = 380;
        this.actorHeight = 153;
        this.actorWidth = this.spriteWidth / this.noOfFrames;
        this.spriteHeight = 335;
        this.position = startPosition;
        this.speed = 5;
        this.ctx = ctx;
        this.commands = {};
        this.commands['M'] = false;
        this.commands['O'] = false;
        this.gravity = 0.1;
        this.faceSide = 'right';
        this.jetPackUsable = true;
        this.maxHealth = 600;
        this.maxJetFuel = 600;
        this.health = this.maxHealth;
        this.jetFuel = this.maxJetFuel;
        this.velocity = 0;
        this.noOfLifes = 3;
        this.mousePos = startPosition;
        this.resources = resources;

        this.score = 0;
        this.kills = 0;

        this.weapon = new Weapon(this.ctx, this.collisionHandler, 'shyame', this.resources);

        this.characterHead = new Image();
        this.noOfLifesImage = new Image();
        this.statusIconsImage = new Image();
        this.characterHead.src = 'images/character/head.png';
        this.noOfLifesImage.src = 'images/no_of_lifes.PNG';
        this.statusIconsImage.src = 'images/status_icons.png';
    };

    this.move = function () {

        if (!_this.commands['O'])
            _this.step();
        if (_this.jetFuel < _this.maxJetFuel)
            _this.jetFuel += 0.5;
        if (_this.health < _this.maxHealth && _this._health > 0)
            _this.health += 0.2;
    };

    this.step = function () {

        if (_this.jetFuel < 0) {

            _this.jetPackUsable = false;
        } else if (_this.jetFuel > 50) {

            _this.jetPackUsable = true;
        }

        if (_this.commands['W'] && _this.jetPackUsable) {
            _this._drawActorWithJetPack();
            _this.frameIndex = 0;

            _this.jetFuel -= 3;
        } else if (_this.commands['G'] && !(_this.commands['A'] || _this.commands['D'])) {

            _this.frameIndex = 0;
            _this._drawActor();
        } else {
            _this.tickCount += 1;
            if (_this.tickCount > _this.ticksPerFrame) {
                _this.tickCount = 0;

                // If the current frame index is in range
                _this.frameIndex = (_this.frameIndex + 1) % _this.noOfFrames;
            }
            _this._drawActor();
        }
        if (_this.commands['W'] && _this.jetPackUsable) {
            if (_this.position.y > (_this.speed)) {
                _this.position.y -= _this.speed;
                _this.dynamicUp += _this.speed;
                _this.canvas.style.marginBottom = this.dynamicUp + 'px';
            }
        }
        if (_this.commands['S']) {
            if (_this.position.y < _this.ctx.canvas.height - _this.actorHeight) {
                if (_this.collisionHandler.hasReachedGround(_this)) {
                    _this.commands['G'] = true;
                } else {
                    _this.position.y += _this.speed;
                    _this.dynamicUp -= _this.speed;
                    _this.canvas.style.marginBottom = this.dynamicUp + 'px';
                }
            }
        }
        if (_this.commands['D'] && !_this.collisionHandler.pushingAgainstWall(_this, 'D')) {
            if (_this.position.x < _this.ctx.canvas.width - _this.actorWidth - _this.speed) {
                _this.position.x += _this.speed;
            }
        }
        if (_this.commands['A'] && !_this.collisionHandler.pushingAgainstWall(_this, 'A')) {
            if (_this.position.x > (_this.speed)) {
                _this.position.x -= _this.speed;
            }
        }
        if (!_this.commands['W'] || !_this.jetPackUsable) {

            _this._fall();
        }
    };

    this.setFaceDirection = function (side) {

        _this.faceSide = side;
    };

    this._fall = function () {

        if (_this.collisionHandler.hasReachedGround(_this)) {
            _this.commands['G'] = true;
            _this.velocity = 0;
            return;
        }
        _this.velocity += _this.gravity;
        _this.position.y += _this.velocity;
    };

    this._drawActorWithJetPack = function () {

        _this.ctx.drawImage(
            _this.resources.getImage('character_sprite1_' + _this.faceSide),
            _this.frameIndex * _this.spriteWidth / _this.noOfFrames, //start position of actor in sprite
            _this.actorHeight, //offset for second row
            _this.spriteWidth / (_this.noOfFrames), //width of actor
            (_this.spriteHeight - _this.actorHeight), //height of actor with jet pack
            _this.position.x, //position to place the actor in canvas
            _this.position.y,
            _this.spriteWidth / _this.noOfFrames, //actor height and width in canvas
            (_this.spriteHeight - _this.actorHeight));
    };

    this._drawActor = function () {

        _this.ctx.drawImage(
            _this.resources.getImage('character_sprite1_' + _this.faceSide),
            _this.frameIndex * _this.spriteWidth / _this.noOfFrames,
            0,
            _this.spriteWidth / (_this.noOfFrames),
            _this.actorHeight,
            _this.position.x, //position to place the actor in canvas
            _this.position.y,
            _this.spriteWidth / _this.noOfFrames, //actor height and width in canvas
            _this.actorHeight);
    };

    this._drawShyameStatus = function () {

        this._jetFuelStatus();
        this._health();
        this._statusBox();
        this._drawNoOfLifesRemaining();
    };

    this._drawNoOfLifesRemaining = function () {

        var marginLeft = Math.abs(parseInt(_this.ctx.canvas.style.marginLeft));
        marginLeft = isNaN(marginLeft) ? 0 : marginLeft;
        _this.ctx.drawImage(_this.characterHead, 0, 0, 62, 62, marginLeft + 1050, 40, 62, 62);
        _this.ctx.drawImage(_this.noOfLifesImage, 0, this.noOfLifes * 35 - 35, 80, 35, marginLeft + 1120, 50, 80, 35);
    };

    this._statusBox = function () {

        _this.ctx.beginPath();
        var marginLeft = Math.abs(parseInt(_this.ctx.canvas.style.marginLeft));
        if (isNaN(marginLeft)) {
            marginLeft = 0;
        }
        _this.ctx.moveTo(marginLeft + 60, 30);
        _this.ctx.lineTo(marginLeft + 60, 140);
        _this.ctx.lineTo(marginLeft + 60 + _this.maxJetFuel / 3.5, 140);
        _this.ctx.lineTo(marginLeft + 60 + _this.maxJetFuel / 2.5, 100);
        _this.ctx.lineTo(marginLeft + 60 + _this.maxJetFuel / 2.5, 30);
        _this.ctx.lineTo(marginLeft + 52.5, 30);
        _this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        _this.ctx.stroke();
        _this.ctx.closePath();

        _this.ctx.drawImage(_this.statusIconsImage, 0, 0, 35, 90, marginLeft + 70, 50, 25, 68);
        // _this.ctx.drawImage(_this.statusIconsImage, 0, 90, 35, 30, marginLeft + 250, 45, 35, 30);
    };

    this._jetFuelStatus = function () {

        _this.ctx.beginPath();
        _this.ctx.lineWidth = 15;
        var marginLeft = Math.abs(parseInt(_this.ctx.canvas.style.marginLeft));
        if (isNaN(marginLeft)) {
            marginLeft = 0;
        }
        _this.ctx.moveTo(marginLeft + 100, 100);
        _this.ctx.lineTo(marginLeft + (_this.jetFuel / 4) + 100, 100);
        _this.ctx.strokeStyle = '#0000ff';
        _this.ctx.stroke();
    };

    this._health = function () {

        _this.ctx.beginPath();
        _this.ctx.lineWidth = 15;
        var marginLeft = Math.abs(parseInt(_this.ctx.canvas.style.marginLeft));
        if (isNaN(marginLeft)) {
            marginLeft = 0;
        }
        _this.ctx.moveTo(marginLeft + 100, 60);
        _this.ctx.lineTo(marginLeft + (_this.health / 4) + 100, 60);
        _this.ctx.strokeStyle = '#ce00ce';
        _this.ctx.stroke();
    };

    this.drawWeapon = function () {

        var weaponTipPositionX, weaponTipPositionY, weaponBackPositionX, weaponBackPositionY;

        var pat;
        if (_this.faceSide == 'left') {
            weaponBackPositionX = _this.position.x + _this.weapon.offset.x + 25;
            weaponBackPositionY = _this.position.y + _this.weapon.offset.y + 15;
            pat = _this.ctx.createPattern(_this.weapon.weaponImageLeft, 'no-repeat');
        } else {
            weaponBackPositionX = _this.position.x + _this.weapon.offset.x + 5;
            weaponBackPositionY = _this.position.y + _this.weapon.offset.y + 15;
            pat = _this.ctx.createPattern(_this.weapon.weaponImageRight, 'no-repeat');
        }

        var length = 100;

        var vectorX = _this.mousePos.x - weaponBackPositionX;
        var vectorY = _this.mousePos.y - weaponBackPositionY;

        var distance = Util.calculateDistance(weaponBackPositionX, weaponBackPositionY, _this.mousePos.x, _this.mousePos.y);
        vectorX = vectorX / distance;
        vectorY = vectorY / distance;

        if (_this.faceSide == 'left') {

            vectorX = -Math.abs(vectorX);
        }

        weaponTipPositionX = weaponBackPositionX + vectorX * length;
        weaponTipPositionY = weaponBackPositionY + vectorY * length;

        var slope = (weaponBackPositionY - weaponTipPositionY) / (weaponBackPositionX - weaponTipPositionX);

        _this.ctx.save();

        _this.ctx.beginPath();
        _this.ctx.lineWidth = 3;
        if (_this.faceSide == 'left') {
            _this.ctx.translate(weaponTipPositionX, weaponTipPositionY);
        } else {
            _this.ctx.translate(weaponBackPositionX, weaponBackPositionY);
        }
        // console.log(weaponBackPositionX);
        // console.log(weaponBackPositionY);
        // console.log(weaponTipPositionX);
        // console.log(weaponTipPositionY);
        _this.ctx.rotate(Math.atan(slope) * 50 * Math.PI / 180);
        _this.ctx.rect(0, 0, 120, 30);
        _this.ctx.fillStyle = pat;
        _this.ctx.fill();
        _this.ctx.closePath();
        _this.ctx.restore();
    };

    /*    this.getPerpendicularToLine = function (l1, l2, l3, l4, length) {
    
            var distX = l3 - l1;
            var distY = l4 - l2;
            var distance = _this.calculateDistance(l3, l4, l1, l2);
    
            var vectorX = distX / distance;
            var vectorY = distY / distance;
    
            var cx = l3 - length * vectorY;
            var cy = l4 + length * vectorX;
    
            return {x: cx, y: cy};
        };*/



    this._updateFaceSide = function () {

        if (_this.mousePos === undefined)
            _this.mousePos = { x: _this.position.x + 500, y: _this.position.y };
        if (_this.mousePos.x >= _this.position.x && _this.faceSide == 'left')
            _this.faceSide = 'right';
        else if (_this.mousePos.x < _this.position.x && _this.faceSide == 'right')
            _this.faceSide = 'left';
    };

    this._init();
}
function Bullet(ctx, startPosition, endPosition, mapArray, gunOffset, actorType) {

    var _this;
    this._init = function () {

        _this = this;
        this.hit = false;
        this.ctx = ctx;
        this.startPosition = startPosition;
        this.endPosition = endPosition;
        this.speed = 20;
        this.gunOffset = gunOffset;
        this.actorType = actorType;
        this.bulletColor = 'red';
        if (this.actorType == 'shyame') {

            this.bulletColor = '#fffb42';
        }
        var vectorX = this.startPosition.x - this.endPosition.x + this.gunOffset.x;
        var vectorY = this.startPosition.y - this.endPosition.y + this.gunOffset.y;
        var distance = this.calculateDistance(_this.startPosition.x + _this.gunOffset.x, _this.startPosition.y + _this.gunOffset.y, _this.endPosition.x, _this.endPosition.y);
        vectorX = -vectorX / distance;
        vectorY = -vectorY / distance;

        this.fromPosition = { x: _this.startPosition.x + _this.gunOffset.x, y: _this.startPosition.y + _this.gunOffset.y };
        this.toPosition = { x: 0, y: 0 };

        this.vector = { x: vectorX, y: vectorY };
    };

    this.fire = function () {

        _this.ctx.beginPath();
        _this.ctx.lineWidth = 5;

        var toPositionX = _this.fromPosition.x + _this.vector.x * _this.speed;
        var toPositionY = _this.fromPosition.y + _this.vector.y * _this.speed;
        _this.toPosition = { x: toPositionX, y: toPositionY };
        _this.ctx.moveTo(_this.fromPosition.x, _this.fromPosition.y);
        _this.ctx.lineTo(_this.toPosition.x, _this.toPosition.y);
        _this.ctx.strokeStyle = _this.bulletColor;
        _this.ctx.stroke();
        _this.ctx.closePath();
        _this.fromPosition = _this.toPosition;
    };

    this.calculateDistance = function (x1, y1, x2, y2) {

        return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    };

    this._init();
}

function Camera(ctx, shyame) {

    var _this;
    this._init = function () {

        _this = this;
        this.ctx = ctx;
        this.shyame = shyame;
        this.canvasMarginLeft = 0;
        this.cameraSpeed = _this.shyame.actor.speed;
    };

    this.move = function () {

        // console.log(_this.shyame.actor.position.x);
        // console.log(_this.canvasMarginLeft );
        var diffCurrPos = _this.shyame.actor.position.x - Math.abs(_this.canvasMarginLeft);
        if (diffCurrPos != 600) {
            if (diffCurrPos > 600) {

                _this.moveRight();
            } else {
                _this.moveLeft();
            }
        }
    };

    this.moveRight = function () {

        // console.log('camera is moving right');
        // console.log(_this.ground.groundOffsets.x);
        if (_this.canvasMarginLeft <= 0 && _this.canvasMarginLeft >= -2635.0001)
            _this.canvasMarginLeft -= _this.cameraSpeed;
        _this.ctx.canvas.style.marginLeft = _this.canvasMarginLeft + 'px';
    };

    this.moveLeft = function () {

        // console.log('camera is moving left');
        // console.log(_this.ground.groundOffsets.x);
        if (_this.canvasMarginLeft < -_this.cameraSpeed && _this.canvasMarginLeft >= (-2635 - _this.cameraSpeed))
            _this.canvasMarginLeft += _this.cameraSpeed;
        _this.ctx.canvas.style.marginLeft = _this.canvasMarginLeft + 'px';
    };

    this._init();
};

function CollisionHandler(ctx, camera, mapArray) {

    var _this;
    this._init = function () {

        _this = this;
        this.ctx = ctx;
        this.camera = camera;
        this.mapArray = mapArray;
    };

    this.hasReachedGround = function (actor) {

        var y = Math.round((actor.position.y + actor.actorHeight) / TILE_SIZE) - 1;
        var x = Math.round((actor.position.x + actor.actorWidth) / TILE_SIZE) - 2;

        if (_this.mapArray[y] !== undefined) {
            if (_this.mapArray[y][x] !== undefined) {
                if (_this.mapArray[y][x].tileType == 1) {
                    return true;
                }
            }
            if (_this.mapArray[y][x] !== undefined) {
                if (_this.mapArray[y][x].tileType == 4) {
                    return true;
                }
            }
        }

        return false;
    };

    this.pushingAgainstWall = function (actor, direction) {

        var fromY = Math.round((actor.position.y) / TILE_SIZE) - 1;
        var x;
        if (direction == 'D')
            x = Math.round((actor.position.x + actor.actorWidth) / TILE_SIZE);
        else if (direction == 'A')
            x = Math.round(actor.position.x / TILE_SIZE);
        x = x - 3;
        var toY = Math.round((actor.position.y + actor.actorHeight) / TILE_SIZE) - 1;

        for (var i = fromY; i < toY; i++) {
            if (_this.mapArray[i] !== undefined) {
                if (_this.mapArray[i][x] !== undefined) {
                    if (_this.mapArray[i][x].tileType == 1 || _this.mapArray[i][x].tileType == 2 || _this.mapArray[i][x].tileType == 4) {
                        return true;
                    }
                    if (_this.mapArray[i][x + 2] !== undefined)
                        if (_this.mapArray[i][x + 2].tileType == 3 || _this.mapArray[i][x + 2].tileType == 5)
                            return true;
                }
            }
        }

        return false;
    };

    this.objectIsOutBound = function (position) {

        var y = Math.round(position.y / TILE_SIZE);
        var x = Math.round(position.x / TILE_SIZE);

        if (_this.mapArray[y] !== undefined) {
            if (_this.mapArray[y][x] !== undefined) {
                if (_this.mapArray[y][x].tileType == 1 || _this.mapArray[y][x].tileType == 4 || _this.mapArray[y][x].tileType == 2) {
                    return true;
                }
            }
        }
        return false;
    };

    this._init();
}
var TILE_SIZE = 32;

function Game(canvas, resources) {

    var _this;
    this._init = function () {

        _this = this;
        this.resources = resources;
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');
        this.messageBox = document.getElementById('messageBox');
        this.ground = new TileGround(this.ctx);
        this.collisionHandler = new CollisionHandler(this.ctx, this.camera, this.ground.mapArray);
        this.gameBullets = [];
        this.shyame = new Shyame(this.ctx, { x: 600, y: 200 }, this.canvas, this.camera, this.collisionHandler, this.resources);
        this.camera = new Camera(this.ctx, this.shyame);
        this.robotUnits = {};

        this.introAudio = this.resources.getAudio('intro');
        this.introAudio.play();

        var randomNoOfRobotUnits = 6;
        this.robotUnitsGenerateInterval = setInterval(
            function () {
                if (Object.size(_this.robotUnits) < randomNoOfRobotUnits)
                    _this.generateRobotUnit();
            }, 3000
        );

        this.addControls();

        this.gameAnimationFrame = requestAnimationFrame(this.drawGame);
    };

    this.showEnemyDirection = function () {

        var offsetY = 100;
        var directionCount = 0;
        for (var i = 0; i < Object.size(_this.robotUnits); i++) {

            // console.log(Object.size(_this.gameBullets));
            // console.log(Object.size(_this.shyame.actor.gameBullets));
            // console.log(Object.size(_this.robotUnits[i].gameBullets));

            var distX = _this.robotUnits[i].position.x - _this.shyame.actor.position.x;
            var distY = _this.robotUnits[i].position.y - _this.shyame.actor.position.y;
            var cOffset = 200;
            var distance = Util.calculateDistance(_this.robotUnits[i].position.x, _this.robotUnits[i].position.y, _this.shyame.actor.position.x, _this.shyame.actor.position.y);
            if (distance < 600 || directionCount == 2) {
                directionCount = 0;
                break;
            }
            var vectorX = distX / distance;
            var vectorY = distY / distance;

            var tBaseX = _this.shyame.actor.position.x + vectorX * cOffset;
            var tBaseY = _this.shyame.actor.position.y + vectorY * cOffset;
            var tDistance = Util.calculateDistance(_this.robotUnits[i].position.x, _this.robotUnits[i].position.y, tBaseX, tBaseY);

            var tDistX = _this.robotUnits[i].position.x - tBaseX;
            var tDistY = _this.robotUnits[i].position.y - tBaseY;
            var tVectorX = tDistX / tDistance;
            var tVectorY = tDistY / tDistance;
            var tOffset = 20;

            var xPerp = tOffset * tVectorX;
            var yPerp = tOffset * tVectorY;

            var cx = tBaseX - yPerp;
            var cy = tBaseY + xPerp;
            var dx = tBaseX + yPerp;
            var dy = tBaseY - xPerp;

            _this.ctx.beginPath();
            _this.ctx.lineWidth = 3;

            _this.ctx.moveTo(tBaseX + tVectorX * tOffset, tBaseY + tVectorY * tOffset);
            _this.ctx.lineTo(cx, cy);
            _this.ctx.lineTo(dx, dy);
            _this.ctx.lineTo(tBaseX + tVectorX * tOffset, tBaseY + tVectorY * tOffset);

            _this.ctx.strokeStyle = '#ff0000';
            _this.ctx.stroke();
            _this.ctx.strokeStyle = '#fff';
            _this.ctx.closePath();
            _this.ctx.beginPath();
            // _this.ctx.arc(_this.shyame.actor.position.x, _this.shyame.actor.position.y, cOffset, 0, Math.PI * 2);
            _this.ctx.stroke();
            _this.ctx.closePath();
            directionCount++;
        }
    };

    this.generateRobotUnit = function () {

        var rx = Util.getRandomInt(0, _this.canvas.width / 3);
        var ry = Util.getRandomInt(-_this.canvas.height, 0);
        var robotUnit = new RobotUnit(Object.size(_this.robotUnits), _this.ctx, { x: rx, y: ry }, _this.shyame, _this.robotUnits, _this.ground.mapArray, _this.collisionHandler, _this, _this.resources);
        _this.robotUnits[Object.size(_this.robotUnits)] = robotUnit;
    };

    this.drawRobotUnits = function () {

        for (var i = 0; i < Object.size(_this.robotUnits); i++) {
            _this.robotUnits[i].move();
            _this.robotUnits[i].drawWeapon();
            _this.robotUnits[i].drawHealthOverHead();
        }
    };

    this.drawGame = function () {

        _this.gameAnimationFrame = requestAnimationFrame(_this.drawGame);
        _this.ctx.clearRect(0, 0, _this.ctx.canvas.width, _this.ctx.canvas.height);
        _this.ground.drawGround();
        _this.camera.move();
        _this.drawRobotUnits();
        _this.showEnemyDirection();
        _this.shyame.actor.move();
        _this.shyame.actor.drawWeapon();
        _this.shyame.actor._drawShyameStatus();
        _this.drawFire();
        _this.checkShot();
    };

    this.drawFire = function () {

        var refreshedGameBullets = {};
        var count = 0;
        if (Object.size(_this.gameBullets) > 0) {
            // console.log(_this.gameBullets);
        }
        for (var i in _this.gameBullets) {

            if (_this.gameBullets[i].toPosition.x > _this.ctx.canvas.width
                || _this.gameBullets[i].toPosition.y > _this.ctx.canvas.height
                || _this.gameBullets[i].toPosition.x < 0
                || _this.gameBullets[i].toPosition.y < 0
                || _this.collisionHandler.objectIsOutBound(_this.gameBullets[i].toPosition)) {

                _this.gameBullets[i] = null;
            } else if (!_this.gameBullets[i].hit) {
                refreshedGameBullets[count] = _this.gameBullets[i];
                _this.gameBullets[i].fire();
                count += 1;
            }
        }

        _this.gameBullets = refreshedGameBullets;
    };

    this.checkShot = function () {

        if (_this.shyame.actor.health == 0) {

            if (_this.shyame.actor.noOfLifes > 1) {
                _this.respawn();
            } else {
                _this.gameOver();
            }
        }
        var refreshedBullets = {};
        var refreshedBulletsCount = 0;
        for (var i = 0; i < Object.size(_this.gameBullets); i++) {
            if (_this.gameBullets[i].actorType == 'shyame') {
                var refreshedRobotUnitsCount = 0;
                var refreshedRobotUnits = {};
                for (var j = 0; j < Object.size(_this.robotUnits); j++) {
                    if (_this.rectCircleColliding(_this.gameBullets[i], _this.robotUnits[j])) {

                        _this.gameBullets[i].hit = true;
                        _this.robotUnits[j].hitCount += 1;
                        if (_this.robotUnits[j].hitCount == _this.robotUnits[j].maxRobotHit) {
                            _this.shyame.actor.score += 100;
                            _this.shyame.actor.kills += 1;
                            _this.robotUnits[j].death();
                            // delete _this.robotUnits[j];
                        } else {
                            refreshedRobotUnits[refreshedRobotUnitsCount] = _this.robotUnits[j];
                            refreshedRobotUnitsCount += 1;
                        }
                        for (j = j + 1; j < Object.size(_this.robotUnits); j++) {

                            refreshedRobotUnits[refreshedRobotUnitsCount] = _this.robotUnits[j];
                            refreshedRobotUnitsCount += 1;
                        }
                        break;
                    } else {
                        refreshedRobotUnits[refreshedRobotUnitsCount] = _this.robotUnits[j];
                        refreshedRobotUnitsCount += 1;
                    }
                }
                _this.robotUnits = refreshedRobotUnits;
            } else if (_this.gameBullets[i].actorType == 'robot-unit') {

                if (_this.rectCircleColliding(_this.gameBullets[i], _this.shyame.actor)) {

                    if (_this.shyame.actor.health >= 50) {

                        _this.shyame.actor.health -= 50;
                    } else if (_this.shyame.actor.health > 0) {

                        _this.shyame.actor.health = 0;
                    }

                    _this.gameBullets[i].hit = true;
                }
            }
            if (!refreshedBullets.hasOwnProperty(i) && !_this.gameBullets[i].hit) {
                refreshedBullets[refreshedBulletsCount] = _this.gameBullets[i];
                refreshedBulletsCount += 1;
            }
        }
        _this.gameBullets = refreshedBullets;
    };

    // returns true if the actor and bullet are colliding
    this.rectCircleColliding = function (bullet, actor) {
        var distX = Math.abs(bullet.toPosition.x - actor.position.x - actor.actorWidth / 2);
        var distY = Math.abs(bullet.toPosition.y - actor.position.y - actor.actorHeight / 2);

        if (distX > (actor.actorWidth / 2 + 5)) {
            return false;
        }
        if (distY > (actor.actorHeight / 2 + 5)) {
            return false;
        }
        if (distX <= (actor.actorWidth / 2)) {
            return true;
        }
        if (distY <= (actor.actorHeight / 2)) {
            return true;
        }

        var dx = distX - actor.actorWidth / 2;
        var dy = distY - actor.actorHeight / 2;
        return (dx * dx + dy * dy <= 25);
    };

    this.respawn = function () {

        _this.respawnTime = 6;
        _this.pauseGame();
        _this.messageBox.style.opacity = 1;
        document.getElementById('score').innerHTML = _this.shyame.actor.score;
        document.getElementById('kills').innerHTML = _this.shyame.actor.kills;
        document.getElementById('respawn-value').innerHTML = _this.respawnTime;

        _this.respawnInterval = setInterval(function () {

            if (_this.respawnTime == 0) {

                _this.resumeGame();
                _this.shyame.actor.noOfLifes -= 1;
                _this.shyame.actor.health = _this.shyame.actor.maxHealth;
                clearInterval(_this.respawnInterval);
            } else {
                _this.respawnTime -= 1;
                document.getElementById('respawn-value').innerHTML = _this.respawnTime;
            }
        }, 1000);

        _this.shyame.actor.position = { x: 1400, y: 10 };
    };

    this.pauseGame = function () {

        cancelAnimationFrame(_this.gameAnimationFrame);
    };

    this.resumeGame = function () {

        _this.messageBox.style.opacity = 0;
        _this.gameAnimationFrame = requestAnimationFrame(_this.drawGame);
    };

    this.gameOver = function () {

        _this.messageBox.style.opacity = 1;
        document.getElementById('messageHeading').innerHTML = 'GAME OVER';
        document.getElementById('score').innerHTML = _this.shyame.actor.score;
        document.getElementById('kills').innerHTML = _this.shyame.actor.kills;
        document.getElementById('respawn').innerHTML = '';
        document.getElementById('retryButton').style.display = 'block';

        _this.pauseGame();
        _this.removeControls();
        _this.messageBox.style.opacity = 1;
        // _this._init();
    };

    this.addMovements = function (e) {

        _this.shyame.actor.commands['G'] = false;
        _this.shyame.actor.commands['O'] = false;
        switch (e.which) {

            case 87:
                _this.shyame.actor.commands['W'] = true;
                break;
            case 83:
                _this.shyame.actor.commands['S'] = true;
                break;
            case 68:
                _this.shyame.actor.commands['D'] = true;
                break;
            case 65:
                _this.shyame.actor.commands['A'] = true;
                break;
        }
    };

    this.removeMovements = function (e) {

        switch (e.which) {

            case 87:
                _this.shyame.actor.commands['W'] = false;
                break;
            case 83:
                _this.shyame.actor.commands['S'] = false;
                break;
            case 68:
                _this.shyame.actor.commands['D'] = false;
                break;
            case 65:
                _this.shyame.actor.commands['A'] = false;
                break;
        }
    };

    this.updateFaceSideEvent = function (e) {

        _this.shyame.actor.mousePos = _this.getMousePos(_this.canvas, e);
        _this.shyame.actor._updateFaceSide();
    };

    this.fireBulletEvent = function (e) {

        _this.resources.getAudio('gun_shot').currentTime = 0;
        _this.gameBullets[Object.size(_this.gameBullets)] = _this.shyame.actor.weapon.fireBullet(_this.shyame.actor.position, _this.getMousePos(_this.canvas, e));
        _this.resources.getAudio('gun_shot').play();
    };

    this.addControls = function () {

        document.addEventListener('keydown', _this.addMovements);
        document.addEventListener('keyup', _this.removeMovements);
        document.addEventListener('mousemove', _this.updateFaceSideEvent);
        document.addEventListener('click', _this.fireBulletEvent);
    };

    this.removeControls = function () {

        document.removeEventListener('keydown', _this.addMovements);
        document.removeEventListener('keyup', _this.removeMovements);
        document.removeEventListener('mousemove', _this.updateFaceSideEvent);
        document.removeEventListener('click', _this.fireBulletEvent);
    };

    this.getMousePos = function (canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }

    this._init();
}

function Preload() {

    var _this;
    this._init = function () {

        _this = this;
        this.canvasWrapper = document.getElementsByClassName('wrapper')[0];
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');

        this.splashImage = new Image();
        this.splashImage.src = 'images/splash.png';

        this.splashImage.onload = function () {

            _this.ctx.drawImage(_this.splashImage, 0, 0, _this.canvasWrapper.clientWidth, _this.canvasWrapper.clientHeight);
        };

        this.splashAudio = new Audio('audio/splash.aac');
        this.splashAudio.play();

        this.resources = new Resources();

        this.resources.addImage('character_sprite1_left', 'images/character/character_sprite1_left.png');
        this.resources.addImage('character_sprite1_right', 'images/character/character_sprite1_right.png');

        this.resources.addImage('Enemy-1-left', 'images/character/Enemy-1-left.png');
        this.resources.addImage('Enemy-1-right', 'images/character/Enemy-1-right.png');

        this.resources.addImage('hand_with_gun', 'images/hand_with_gun.png');
        this.resources.addImage('hand_with_gun_left', 'images/hand_with_gun_left.png');
        this.resources.addImage('enemy_gun', 'images/enemy_gun.PNG');
        this.resources.addImage('enemy_gun_left', 'images/enemy_gun_left.PNG');

        this.resources.addAudio('intro', 'audio/intro.mp3');
        this.resources.addAudio('background_music', 'audio/background_music.mp3');
        this.resources.addAudio('gun_shot', 'audio/gun_shot.mp3');

        this.preloadInterval = setInterval(function () {
            if (_this.resources.imageLoadedCount == Object.size(_this.resources.images)) {
                _this.splashAudio.pause();
                delete _this.splashAudio;
                clearInterval(_this.preloadInterval);
                new Game(_this.canvas, _this.resources);
            } else {
                // console.log('here');
            }
        }, 5000);
    }

    this._init();
}

Object.size = function (obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

window.onload = function () {

    new Preload();
}

function Resources() {

    var _this;

    this._init = function () {

        _this = this;
        this.images = [];
        this.audios = [];
        this.imageLoadedCount = 0;
        this.audioLoadedCount = 0;
    };

    this.addImage = function (name, src) {

        var image = new Image();
        image.onload = function () {

            _this.imageLoadedCount += 1;
        };
        image.src = src;
        _this.images[name] = image;
    };

    this.getImage = function (name) {

        return _this.images[name];
    };

    this.addAudio = function (name, src) {

        var audio = new Audio(src);
        _this.audios[name] = audio;
    };

    this.getAudio = function (name) {

        return _this.audios[name];
    };

    this._init();
}

function RobotUnit(id, ctx, startPosition, shyame, robotUnits, mapArray, collisionHandler, game, resources) {

    var _this;

    this._init = function () {

        _this = this;
        this.mapArray = mapArray;
        this.id = id;
        this.ctx = ctx;
        this.sprite = [];
        this.shyame = shyame;
        this.robotUnits = robotUnits;
        this.game = game;
        this.resources = resources;

        this.collisionHandler = collisionHandler;

        this.safeDistance = 100;

        this.frameIndex = 0;
        this.tickCount = 0;
        this.ticksPerFrame = 1;

        this.noOfFrames = 1;
        this.spriteWidth = 120;
        this.actorHeight = 110;
        this.actorWidth = this.spriteWidth / this.noOfFrames;
        this.spriteHeight = 220;
        this.position = { x: startPosition.x, y: startPosition.y };
        this.moveId = false;
        this.speed = 2;
        this.ctx = ctx;
        this.bounceDistance = 10;
        this.commands = {};
        this.commands['M'] = false;
        this.commandsCount = {};
        this.executingCommands = {};
        this.executingCommands['A'] = false;
        this.executingCommands['S'] = false;
        this.executingCommands['D'] = false;
        this.executingCommands['F'] = false;
        this.commandsCount['A'] = 0;
        this.commandsCount['S'] = 0;
        this.commandsCount['D'] = 0;
        this.commandsCount['W'] = 0;
        this.gravity = 1;
        this.faceSide = 'right';
        this.sideChange = true;
        this.hitCount = 0;
        this.maxRobotHit = Util.getRandomInt(2, 5);

        this.maxSafeDistance = 700;
        this.minSafeDistance = 400;

        this.weapon = new Weapon(this.ctx, this.collisionHandler, 'robot-unit', this.resources);

        var bulletsFireInterval = Util.getRandomInt(2, 5);

        this.aiInterval = setInterval(function () {

            _this.safeDistance = Util.getRandomInt(_this.minSafeDistance, _this.maxSafeDistance);
            _this.speed = Util.getRandomInt(0.25, 2.25);

            _this.moveRight = _this.shyame.actor.position.x < _this.position.x;

            var positionToFireX = _this.shyame.actor.position.x + _this.shyame.actor.actorWidth / 2;
            var positionToFireY = _this.shyame.actor.position.y + _this.shyame.actor.actorHeight / 2;

            var distanceToShyame = Util.calculateDistance(positionToFireX, positionToFireY, _this.position.x, _this.position.y);
            if (distanceToShyame < _this.maxSafeDistance)
                _this.game.gameBullets[Object.size(_this.gameBullets)] = _this.weapon.fireBullet(_this.position, { x: positionToFireX, y: positionToFireY });

            bulletsFireInterval = Util.getRandomInt(5, 10);
        }, bulletsFireInterval * 1000);
    };

    this.move = function () {

        _this.sideChange = _this.shyame.actor.position.x > _this.position.x;
        if (_this.sideChange)
            _this.faceSide = 'right';
        else
            _this.faceSide = 'left';

        if ((_this.shyame.actor.position.y - _this.position.y) / (_this.shyame.actor.position.x - _this.position.x) > 0) {
            _this.commandsCount['D'] += 1;
        } else {
            _this.commandsCount['A'] += 1;
        }

        if ((_this.shyame.actor.position.y - _this.safeDistance + _this.shyame.actor.actorHeight) > _this.position.y) {
            _this.commandsCount['S'] += 1;
        } else
            _this.commandsCount['W'] += 1;
        _this._stepFilter();
    };

    this.drawHealthOverHead = function () {

        _this.ctx.beginPath();
        var padding = { x: 3, y: 8 };
        var length = 20;
        _this.ctx.lineWidth = 1;
        _this.ctx.moveTo(_this.position.x - padding.x, _this.position.y - padding.y);
        _this.ctx.lineTo(_this.position.x - padding.x, _this.position.y + padding.y);
        _this.ctx.lineTo(_this.position.x + _this.maxRobotHit * length + padding.x, _this.position.y + padding.y);
        _this.ctx.lineTo(_this.position.x + _this.maxRobotHit * length + padding.x, _this.position.y - padding.y);
        _this.ctx.lineTo(_this.position.x - padding.x, _this.position.y - padding.y);
        _this.ctx.strokeStyle = '#fff';
        _this.ctx.stroke();
        _this.ctx.closePath();

        _this.ctx.beginPath();
        _this.ctx.lineWidth = 8;

        _this.ctx.moveTo(_this.position.x, _this.position.y);
        _this.ctx.lineTo(_this.position.x + (_this.maxRobotHit - _this.hitCount) * length, _this.position.y);
        _this.ctx.strokeStyle = '#2daf00';
        _this.ctx.stroke();
        _this.ctx.closePath();
    };

    this._stepFilter = function () {

        for (var c in _this.commandsCount) {

            if (_this.commandsCount[c] > _this.bounceDistance || _this.executingCommands[c]) {

                _this.commands[c] = true;
                _this.commandsCount[c] -= 1;
                _this.executingCommands[c] = true;
            }
            if (_this.commandsCount[c] == 0)
                _this.executingCommands[c] = false;
        }

        _this.step();
    };

    this.step = function () {

        if (_this.commands['W']) {
            _this.frameIndex = 0;
            _this._drawActorWithJetPack();
        } else if (_this.commands['G'] && !(_this.commands['A'] || _this.commands['D'])) {

            _this.frameIndex = 0;
            _this._drawActor();
        } else {
            _this.tickCount += 1;
            if (_this.tickCount > _this.ticksPerFrame) {
                _this.tickCount = 0;

                // If the current frame index is in range
                _this.frameIndex = (_this.frameIndex + 1) % _this.noOfFrames;
            }
            _this._drawActor();
        }
        if (_this.commands['W']) {
            if (_this.position.y > (_this.speed))
                _this.position.y -= _this.speed;
        }
        if (_this.commands['S']) {
            if (_this.position.y < _this.ctx.canvas.height - _this.actorHeight) {
                var stop = false;
                if (_this.collisionHandler.hasReachedGround(_this)) {
                    _this.commands['G'] = true;
                    stop = true;
                }
                if (!stop)
                    _this.position.y += _this.speed;
            }
        }
        if (_this.commands['D'] && !_this.collisionHandler.pushingAgainstWall(_this, 'D')) {
            if (_this.position.x < _this.ctx.canvas.width - _this.actorWidth - _this.speed) {
                if (_this.moveRight)
                    _this.position.x -= _this.speed;
                else
                    _this.position.x += _this.speed;
            }
        }
        if (_this.commands['A'] && !_this.collisionHandler.pushingAgainstWall(_this, 'A')) {
            if (_this.position.x > (_this.speed)) {
                if (_this.moveRight)
                    _this.position.x -= _this.speed;
                else
                    _this.position.x += _this.speed;
            }
        }
        _this._stop();
        if (!_this.commands['W']) {

            _this._fall();
        }
    };

    this.setFaceDirection = function (side) {

        _this.faceSide = side;
    };

    this._fall = function () {

        var y = Math.round((_this.position.y + _this.actorHeight) / TILE_SIZE) - 1;
        var x = Math.round((_this.position.x + _this.actorHeight) / TILE_SIZE) - 1;

        // console.log('y = ' + y + ', x = ' + x);
        if (_this.mapArray[y] !== undefined) {
            if (_this.mapArray[y][x] !== undefined) {
                if (_this.mapArray[y][x].tileType == 1) {
                    _this.commands['G'] = true;
                    return;
                }
            }
        }
        _this.position.y += _this.gravity;
    };

    this._drawActorWithJetPack = function () {

        _this.ctx.drawImage(
            _this.resources.getImage('Enemy-1-' + _this.faceSide),
            _this.frameIndex * _this.spriteWidth / _this.noOfFrames, //start position of actor in sprite
            _this.actorHeight, //offset for second row
            _this.spriteWidth / (_this.noOfFrames), //width of actor
            (_this.spriteHeight - _this.actorHeight), //height of actor with jet pack
            _this.position.x, //position to place the actor in canvas
            _this.position.y,
            _this.spriteWidth / _this.noOfFrames, //actor height and width in canvas
            (_this.spriteHeight - _this.actorHeight));
    };

    this._drawActor = function () {

        _this.ctx.drawImage(
            _this.resources.getImage('Enemy-1-' + _this.faceSide),
            _this.frameIndex * _this.spriteWidth / _this.noOfFrames,
            0,
            _this.spriteWidth / (_this.noOfFrames),
            _this.actorHeight,
            _this.position.x, //position to place the actor in canvas
            _this.position.y,
            _this.spriteWidth / _this.noOfFrames, //actor height and width in canvas
            _this.actorHeight);
    };

    this.drawWeapon = function () {

        var weaponTipPositionX, weaponTipPositionY, weaponBackPositionX, weaponBackPositionY;

        var pat;
        var weaponImage;
        if (_this.faceSide == 'left') {
            weaponBackPositionX = _this.position.x + _this.weapon.offset.x + 70;
            weaponBackPositionY = _this.position.y + _this.weapon.offset.y - 10;
            pat = _this.ctx.createPattern(_this.weapon.weaponImageLeft, 'no-repeat');
            weaponImage = _this.weapon.weaponImageLeft;
        } else {
            weaponBackPositionX = _this.position.x + _this.weapon.offset.x + 10;
            weaponBackPositionY = _this.position.y + _this.weapon.offset.y;
            pat = _this.ctx.createPattern(_this.weapon.weaponImageRight, 'no-repeat');
            weaponImage = _this.weapon.weaponImageRight;
        }

        var length = 100;

        var vectorX = _this.shyame.actor.position.x - weaponBackPositionX;
        var vectorY = _this.shyame.actor.position.y - weaponBackPositionY;

        var distance = Util.calculateDistance(weaponBackPositionX, weaponBackPositionY, _this.shyame.actor.position.x, _this.shyame.actor.position.y);
        vectorX = vectorX / distance;
        vectorY = vectorY / distance;

        weaponTipPositionX = weaponBackPositionX + vectorX * length;
        weaponTipPositionY = weaponBackPositionY + vectorY * length;

        var slope = (weaponBackPositionY - weaponTipPositionY) / (weaponBackPositionX - weaponTipPositionX);

        _this.ctx.save();

        _this.ctx.beginPath();
        _this.ctx.lineWidth = 3;
        if (_this.faceSide == 'left') {
            _this.ctx.translate(weaponTipPositionX, weaponTipPositionY);
        } else {
            _this.ctx.translate(weaponBackPositionX, weaponBackPositionY);
        }

        _this.ctx.rotate(Math.atan(slope) * 50 * Math.PI / 180);
        _this.ctx.drawImage(weaponImage, 0, 0, 70, 41);
        _this.ctx.closePath();
        _this.ctx.restore();
    };

    this._stop = function () {

        _this.commands['A'] = false;
        _this.commands['S'] = false;
        _this.commands['D'] = false;
        _this.commands['W'] = false;
    };

    this.death = function () {

        clearInterval(_this.aiInterval);
    };

    this._init();
}

function Shyame(ctx, startPosition, canvas, camera, collisionHandler, resources) {

    this._init = function () {
        this.actor = new Actor(ctx, startPosition, canvas, camera, collisionHandler, resources);
    };

    this._init();
}

function TileGround(ctx) {

    var _this;
    this._init = function () {

        _this = this;
        this.ctx = ctx;
        this.totalNoOfTiles = Math.round(this.ctx.canvas.width / TILE_SIZE);
        this.mapArray = [];

        this._createMapPart(Array.apply(null, { length: 8 }).map(Number.call, Number), this.totalNoOfTiles, 0, [], 0);

        this._createMapPart([8], Math.round(this.totalNoOfTiles / 4), 0, [], 0);
        this._createMapPart([8], Math.round(this.totalNoOfTiles / 4), 1, [0, 1], 2);
        this._createMapPart([8], this.totalNoOfTiles / 2, 0, [], 0);

        this._createMapPart([9, 10, 11, 12, 13, 14], Math.round(this.totalNoOfTiles / 4), 0, [], 0);
        this._createMapPart([9, 10, 11, 12, 13, 14], 1, 3, [0, 2], 1);
        this._createMapPart([9, 10, 11, 12, 13, 14], Math.round(this.totalNoOfTiles / 4) - 2, 2, [1, 2], 0);
        this._createMapPart([9, 10, 11, 12, 13, 14], 1, 5, [0, 2], 1);
        this._createMapPart([9, 10, 11, 12, 13, 14], Math.round(this.totalNoOfTiles / 2), 0, [], 0);

        // this._createMapPart([15], Math.round(this.totalNoOfTiles / 6 - this.totalNoOfTiles / 8), 3, [0, 1], 2);

        this._createMapPart([15], Math.round(this.totalNoOfTiles / 4), 1, [0, 1], 2);
        this._createMapPart([15], Math.round(this.totalNoOfTiles / 4), 2, [1, 2], 0);
        this._createMapPart([15], Math.round(this.totalNoOfTiles / 2), 1, [0, 1], 2);

        this._createMapPart([16, 17, 18, 19], this.totalNoOfTiles, 2, [1, 2], 0);

        // console.log(_this.mapArray);
        this._createObstacle({ x: 600, y: 435 }, 205, 125);
        this._createObstacle({ x: 2600, y: 435 }, 205, 125);

        this.grass = new Image();
        this.sand = new Image();
        this.verticalSand = new Image();
        this.verticalSandRight = new Image();
        this.background = new Image();
        this.bigStone = new Image();
        this.tree = new Image();

        this.grass.src = 'images/grass.png';
        this.sand.src = 'images/sand.png';
        this.verticalSand.src = 'images/vertical_sand.png';
        this.verticalSandRight.src = 'images/vertical_sand_right.png';
        this.background.src = 'images/background.png';
        this.bigStone.src = 'images/big_stones.png';
        this.tree.src = 'images/tree.png';
    };

    this._createMapPart = function (rows, noOfColumns, tileType, randomFrames, defaultFrame) {

        var randomFI = defaultFrame;

        for (var i = 0; i < rows.length; i++) {

            if (!_this.mapArray.hasOwnProperty(rows[i]))
                _this.mapArray.push([]);
            for (var j = 0; j < noOfColumns; j++) {

                randomFI = defaultFrame;
                for (var k in randomFrames) {
                    if (_this._getRandomInt(0, 30) == 3) {

                        randomFI = randomFrames[k];
                        break;
                    }
                }
                _this.mapArray[rows[i]].push({ fi: randomFI, tileType: tileType });
            }
        }
    };

    this._createObstacle = function (obstaclePosition, obstacleWidth, obstacleHeight) {

        var fromY = Math.round(obstaclePosition.y / TILE_SIZE) - 2;
        var fromX = Math.round(obstaclePosition.x / TILE_SIZE) - 2;
        var toY = Math.round((obstaclePosition.y + obstacleHeight) / TILE_SIZE) - 3;
        var toX = Math.round((obstaclePosition.x + obstacleWidth) / TILE_SIZE) - 2;

        for (i = fromY; i < toY; i++) {

            for (j = fromX; j < toX; j++) {

                _this.mapArray[i][j].tileType = 4;
                // console.log('y = ' + i + ', x = ' + j);
            }
        }
    };

    this.drawGround = function () {

        this.ctx.drawImage(this.background, 0, 0, 280, 220, 200, 230, 280, 260);
        this.ctx.drawImage(this.tree, 0, 0, 550, 625, 2300, 100, 350, 398);
        this.ctx.drawImage(this.bigStone, 0, 0, 205, 125, 600, 400, 205, 125);  //image, sx, sy, sw, sh, dx, dy, dw, dh
        this.ctx.drawImage(this.bigStone, 0, 0, 205, 125, 2600, 400, 205, 125);  //image, sx, sy, sw, sh, dx, dy, dw, dh
        for (var i = 0; i < _this.mapArray.length; i++) {

            for (var j = 0; j < _this.mapArray[i].length; j++) {

                if (_this.mapArray[i][j].tileType == 1) {

                    _this._drawGrass(_this.mapArray[i][j].fi * 100, { x: j * TILE_SIZE, y: i * TILE_SIZE }, { w: 100, h: 100 }, { w: TILE_SIZE, h: TILE_SIZE });
                } else if (_this.mapArray[i][j].tileType == 2) {

                    _this._drawSand(_this.mapArray[i][j].fi * 100, { x: j * TILE_SIZE, y: i * TILE_SIZE }, { w: 100, h: 100 }, { w: TILE_SIZE, h: TILE_SIZE });
                } else if (_this.mapArray[i][j].tileType == 3) {

                    _this._drawVerticalSand(_this.mapArray[i][j].fi * 44, { x: j * TILE_SIZE, y: i * TILE_SIZE }, { w: 44, h: 44 }, { w: TILE_SIZE, h: TILE_SIZE });
                } else if (_this.mapArray[i][j].tileType == 5) {

                    _this._drawVerticalSandRight(_this.mapArray[i][j].fi * 44, { x: j * TILE_SIZE, y: i * TILE_SIZE }, { w: 44, h: 44 }, { w: TILE_SIZE, h: TILE_SIZE });
                }
            }
        }
    };
    this._drawVerticalSand = function (fi, position, sizeFrom, sizeTo) {

        _this.ctx.drawImage(_this.verticalSand, fi, 0, sizeFrom.w, sizeFrom.h, position.x, position.y, sizeTo.w, sizeTo.h);
    };

    this._drawVerticalSandRight = function (fi, position, sizeFrom, sizeTo) {

        _this.ctx.drawImage(_this.verticalSandRight, fi, 0, sizeFrom.w, sizeFrom.h, position.x, position.y, sizeTo.w, sizeTo.h);
    };

    this._drawSand = function (fi, position, sizeFrom, sizeTo) {

        _this.ctx.drawImage(_this.sand, fi, 0, sizeFrom.w, sizeFrom.h, position.x, position.y, sizeTo.w, sizeTo.h);
    };

    this._drawGrass = function (fi, position, sizeFrom, sizeTo) {

        _this.ctx.drawImage(_this.grass, fi, 0, sizeFrom.w, sizeFrom.h, position.x, position.y, sizeTo.w, sizeTo.h);
    };

    this._getRandomInt = function (min, max) {

        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    this._init();
}

function Util() { }

Util.calculateDistance = function (x1, y1, x2, y2) {

    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
};

Util.getRandomInt = function (min, max) {

    return Math.floor(Math.random() * (max - min + 1)) + min;
};

function Weapon(ctx, collisionHandler, actorType, resources) {

    var _this;
    this._init = function () {

        _this = this;
        this.resources = resources;
        this.ctx = ctx;
        this.collisionHandler = collisionHandler;
        this.offset = { x: 20, y: 60 };

        this.actorType = actorType;
        if (actorType == 'shyame') {

            this.weaponImageRight = this.resources.getImage('hand_with_gun');
            this.weaponImageLeft = this.resources.getImage('hand_with_gun_left');
        } else if (actorType == 'robot-unit') {

            this.weaponImageRight = this.resources.getImage('enemy_gun');
            this.weaponImageLeft = this.resources.getImage('enemy_gun_left');
        }
    };

    this.fireBullet = function (startPosition, endPosition) {

        return new Bullet(_this.ctx, startPosition, endPosition, collisionHandler, _this.offset, _this.actorType);
    };

    this._init();
}