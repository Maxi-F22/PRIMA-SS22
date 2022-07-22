"use strict";
var Script;
(function (Script) {
    class Avatar extends ƒ.Node {
        cntWalk = new ƒ.Control("cntWalk", 6, 0 /* PROPORTIONAL */);
        cntStrafe = new ƒ.Control("cntWalk", 6, 0 /* PROPORTIONAL */);
        jumpAllowed = true;
        jumpCount = 0;
        jumpTimeout;
        constructor() {
            super("Avatar");
        }
        controlWalk() {
            let inputWalk = ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.W], [ƒ.KEYBOARD_CODE.S]);
            let inputStrave = ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.A], [ƒ.KEYBOARD_CODE.D]);
            if ((inputWalk || inputStrave) && this.jumpAllowed) {
                this.cntStrafe.setInput(inputStrave);
                this.cntWalk.setInput(inputWalk);
                let velocityVector;
                velocityVector = new ƒ.Vector3((this.cntStrafe.getOutput() * ƒ.Loop.timeFrameGame / 15) * Script.config["playerSpeed"], 0, (this.cntWalk.getOutput() * ƒ.Loop.timeFrameGame / 15) * Script.config["playerSpeed"]);
                velocityVector.transform(Script.avatarNode.mtxLocal, false);
                Script.cmpAvatarRigidBody.setVelocity(velocityVector);
            }
            else if (!inputWalk && !inputStrave && this.jumpAllowed) {
                Script.cmpAvatarRigidBody.setVelocity(new ƒ.Vector3(0, 0, 0));
            }
        }
        controlJump() {
            if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.SPACE]) && this.jumpAllowed) {
                Script.jumpSound.play(true);
                this.jumpAllowed = false;
                let impulsPower = 0;
                switch (this.jumpCount) {
                    case 0:
                        impulsPower = 6;
                        break;
                    case 1:
                        impulsPower = 8;
                        break;
                    case 2:
                        impulsPower = 10;
                        break;
                    default:
                        break;
                }
                Script.cmpAvatarRigidBody.applyLinearImpulse(new ƒ.Vector3(0, impulsPower, 0));
                if (this.jumpCount >= 2) {
                    this.jumpCount = 0;
                }
                else {
                    this.jumpCount += 1;
                }
                if (this.jumpTimeout) {
                    clearTimeout(this.jumpTimeout);
                }
                this.jumpTimeout = setTimeout(() => { this.jumpCount = 0; }, 2000);
            }
        }
        checkAvatarCollision() {
            Script.cmpAvatarRigidBody.setAngularVelocity(new ƒ.Vector3(0, 0, 0));
            Script.cmpAvatarRigidBody.addEventListener("ColliderEnteredCollision" /* COLLISION_ENTER */, (_event) => {
                if (_event.cmpRigidbody.node.name.includes("Enemy")) {
                    if (_event.collisionPoint.y >= 1) {
                        if (_event.cmpRigidbody.node.getParent()) {
                            _event.cmpRigidbody.node.getParent().removeChild(_event.cmpRigidbody.node);
                        }
                    }
                    else if (_event.collisionPoint.y < 1) {
                        if (!Script.playerInvincible) {
                            Script.graph.dispatchEvent(new CustomEvent("playerHit"));
                        }
                    }
                }
                else if (_event.cmpRigidbody.node.name.includes("Coin")) {
                    if (_event.cmpRigidbody.node.getParent()) {
                        Script.collectCoinSound.play(true);
                        _event.cmpRigidbody.node.getParent().removeChild(_event.cmpRigidbody.node);
                        Script.coinCounter += 1;
                        Script.gameState.coins = Script.coinCounter;
                        if (Script.coinCounter === Script.config["coinCount"]) {
                            Script.graph.dispatchEvent(new CustomEvent("allCoinsCollected"));
                        }
                    }
                }
                else if (_event.cmpRigidbody.node.name.includes("Ground") || _event.cmpRigidbody.node.name.includes("Platform")) {
                    this.jumpAllowed = true;
                }
                else if (_event.cmpRigidbody.node.name.includes("Star")) {
                    Script.graph.dispatchEvent(new CustomEvent("endGame", { detail: "win" }));
                }
            });
            if (Script.avatarNode.mtxLocal.translation.y < -10) {
                if (!Script.playerInvincible) {
                    Script.graph.dispatchEvent(new CustomEvent("playerHit"));
                }
            }
        }
        update() {
            this.controlWalk();
            this.controlJump();
            this.checkAvatarCollision();
        }
    }
    Script.Avatar = Avatar;
})(Script || (Script = {}));
var Script;
(function (Script) {
    class Coin extends ƒ.Node {
        constructor() {
            super("Coin");
            this.createCoin();
        }
        async createCoin() {
            let coinMesh = new ƒ.MeshCube();
            let coinMat = new ƒ.Material("CoinMat", ƒ.ShaderGouraud, new ƒ.CoatRemissive());
            let cmpCoinMat = new ƒ.ComponentMaterial(coinMat);
            cmpCoinMat.clrPrimary = new ƒ.Color(1, 1, 0, 1);
            let cmpCoinRigid = new ƒ.ComponentRigidbody();
            cmpCoinRigid.mass = 0;
            cmpCoinRigid.typeBody = 2;
            this.addComponent(new ƒ.ComponentMesh(coinMesh));
            this.addComponent(cmpCoinMat);
            this.addComponent(new ƒ.ComponentTransform());
            this.addComponent(cmpCoinRigid);
            this.mtxLocal.translation = Script.getPos(Math.floor(Math.random() * (5 - 2 + 2)) + 2);
            this.mtxLocal.scale(new ƒ.Vector3(0.2, 0.5, 0.5));
            this.coinAnim();
        }
        coinAnim() {
            let animseq = new ƒ.AnimationSequence();
            animseq.addKey(new ƒ.AnimationKey(0, 0));
            animseq.addKey(new ƒ.AnimationKey(8000, 360));
            let animStructure = {
                components: {
                    ComponentTransform: [
                        {
                            "ƒ.ComponentTransform": {
                                mtxLocal: {
                                    rotation: {
                                        y: animseq
                                    }
                                }
                            }
                        }
                    ]
                }
            };
            let animation = new ƒ.Animation("coinAnimation", animStructure, 60);
            let cmpAnimator = new ƒ.ComponentAnimator(animation, ƒ.ANIMATION_PLAYMODE.LOOP, ƒ.ANIMATION_PLAYBACK.FRAMEBASED);
            cmpAnimator.scale = 1;
            this.addComponent(cmpAnimator);
            cmpAnimator.activate(true);
        }
    }
    Script.Coin = Coin;
})(Script || (Script = {}));
var Script;
(function (Script) {
    class Enemy extends ƒ.Node {
        constructor() {
            super("Enemy");
            this.createEnemy();
        }
        async createEnemy() {
            let enemyMesh = new ƒ.MeshCube();
            let enemyMat = new ƒ.Material("EnemyMat", ƒ.ShaderGouraud, new ƒ.CoatRemissive());
            let cmpEnemyMat = new ƒ.ComponentMaterial(enemyMat);
            cmpEnemyMat.clrPrimary = new ƒ.Color(0.6, 0.3, 0.1, 1);
            let cmpEnemyRigid = new ƒ.ComponentRigidbody();
            cmpEnemyRigid.mass = 100;
            this.addComponent(new ƒ.ComponentMesh(enemyMesh));
            this.addComponent(cmpEnemyMat);
            this.addComponent(new ƒ.ComponentTransform());
            this.addComponent(cmpEnemyRigid);
            this.mtxLocal.translation = Script.getPos(1);
        }
        update() {
            this.checkForPlayer();
        }
        checkForPlayer() {
            if (this.mtxLocal.translation.getDistance(Script.avatarNode.mtxLocal.translation) <= 10 && this.mtxLocal.translation.getDistance(Script.avatarNode.mtxLocal.translation) > 5) {
                this.getComponent(Script.EnemyStateMachine).transit(Script.JOB.LOOK);
            }
            else if (this.mtxLocal.translation.getDistance(Script.avatarNode.mtxLocal.translation) <= 5) {
                this.getComponent(Script.EnemyStateMachine).transit(Script.JOB.ATTACK);
            }
            else {
                this.getComponent(Script.EnemyStateMachine).transit(Script.JOB.PATROL);
            }
        }
    }
    Script.Enemy = Enemy;
})(Script || (Script = {}));
var Script;
(function (Script) {
    ƒ.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization
    class EnemyMovement extends ƒ.ComponentScript {
        // Register the script as component for use in the editor via drag&drop
        static iSubclass = ƒ.Component.registerSubclass(EnemyMovement);
        // Properties may be mutated by users in the editor via the automatically created user interface
        constructor() {
            super();
            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            // Listen to this component being added to or removed from a node
            this.addEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
            this.addEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
        }
        // Activate the functions of this component as response to events
        hndEvent = (_event) => {
            switch (_event.type) {
                case "componentAdd" /* COMPONENT_ADD */:
                    this.node.addEventListener("renderPrepare" /* RENDER_PREPARE */, this.addMovement);
                    break;
                case "componentRemove" /* COMPONENT_REMOVE */:
                    this.removeEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
                    this.node.removeEventListener("renderPrepare" /* RENDER_PREPARE */, this.addMovement);
                    break;
            }
        };
        addMovement = (_event) => {
            let cmpEnemyRigid = this.node.getComponent(ƒ.ComponentRigidbody);
            cmpEnemyRigid.applyForce(new ƒ.Vector3(Math.cos((Script.enemyRot * Math.PI) / 700) * 400, 0, Math.sin((Script.enemyRot * Math.PI) / 700) * 400));
        };
    }
    Script.EnemyMovement = EnemyMovement;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒAid = FudgeAid;
    let JOB;
    (function (JOB) {
        JOB[JOB["PATROL"] = 0] = "PATROL";
        JOB[JOB["LOOK"] = 1] = "LOOK";
        JOB[JOB["ATTACK"] = 2] = "ATTACK";
    })(JOB = Script.JOB || (Script.JOB = {}));
    ƒ.Project.registerScriptNamespace(Script);
    class EnemyStateMachine extends ƒAid.ComponentStateMachine {
        static iSubclass = ƒ.Component.registerSubclass(EnemyStateMachine);
        static instructions = EnemyStateMachine.get();
        constructor() {
            super();
            this.instructions = EnemyStateMachine.instructions;
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            this.addEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
        }
        hndEvent = (_event) => {
            switch (_event.type) {
                case "componentAdd" /* COMPONENT_ADD */:
                    ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, this.update);
                    this.transit(JOB.PATROL);
                    break;
            }
        };
        static get() {
            let setup = new ƒAid.StateMachineInstructions();
            setup.transitDefault = EnemyStateMachine.transitDefault;
            setup.setAction(JOB.PATROL, this.actPatrol);
            setup.setAction(JOB.LOOK, this.actLook);
            setup.setAction(JOB.ATTACK, this.actAttack);
            return setup;
        }
        static transitDefault(_machine) { }
        static actPatrol(_machine) {
            if (!_machine.node.getComponent(Script.EnemyMovement)) {
                _machine.node.addComponent(new Script.EnemyMovement);
            }
        }
        static actLook(_machine) {
            if (_machine.node.getComponent(Script.EnemyMovement)) {
                let cmpEnemyMovement = _machine.node.getComponent(Script.EnemyMovement);
                _machine.node.removeComponent(cmpEnemyMovement);
            }
            let cmpEnemyRigidBody = _machine.node.getComponent(ƒ.ComponentRigidbody);
            cmpEnemyRigidBody.setVelocity(new ƒ.Vector3(0, 0, 0));
            cmpEnemyRigidBody.setRotation(new ƒ.Vector3(-(_machine.node.mtxLocal.translation.x - Script.avatarNode.mtxLocal.translation.x), 0, -(_machine.node.mtxLocal.translation.z - Script.avatarNode.mtxLocal.translation.z)));
        }
        static actAttack(_machine) {
            if (_machine.node.getComponent(Script.EnemyMovement)) {
                let cmpEnemyMovement = _machine.node.getComponent(Script.EnemyMovement);
                _machine.node.removeComponent(cmpEnemyMovement);
            }
            let cmpEnemyRigidBody = _machine.node.getComponent(ƒ.ComponentRigidbody);
            cmpEnemyRigidBody.setVelocity(new ƒ.Vector3(-(_machine.node.mtxLocal.translation.x - Script.avatarNode.mtxLocal.translation.x), 0, -(_machine.node.mtxLocal.translation.z - Script.avatarNode.mtxLocal.translation.z)));
        }
        update = (_event) => {
            this.act();
        };
    }
    Script.EnemyStateMachine = EnemyStateMachine;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    var ƒUi = FudgeUserInterface;
    class GameState extends ƒ.Mutable {
        lives = 0;
        coins = 0;
        maxCoins = 0;
        constructor(_lives, _coins, _maxCoins) {
            super();
            let domVui = document.querySelector("div#vui");
            domVui.style.display = "block";
            console.log(new ƒUi.Controller(this, domVui));
            this.lives = _lives;
            this.coins = _coins;
            this.maxCoins = _maxCoins;
        }
        reduceMutator(_mutator) { }
    }
    Script.GameState = GameState;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    window.addEventListener("load", init);
    ƒ.Debug.info("Main Program Template running!");
    let playerLives;
    Script.playerInvincible = false;
    Script.enemyRot = 0;
    Script.mapBorderHigh = 25;
    Script.mapBorderLow = -25;
    Script.coinCounter = 0;
    let viewport;
    let enemyClassArray = [];
    let cmpCamera;
    let camTransportCmp;
    let speedRotY = -0.1;
    let speedRotX = 0.1;
    let rotationX = 0;
    let rotationY = 0;
    let dialog;
    function init(_event) {
        dialog = document.querySelector("dialog");
        dialog.addEventListener("click", function (_event) {
            // @ts-ignore until HTMLDialog is implemented by all browsers and available in dom.d.ts
            dialog.close();
            startInteractiveViewport();
        });
        //@ts-ignore
        dialog.showModal();
    }
    async function startInteractiveViewport() {
        // load resources referenced in the link-tag
        await ƒ.Project.loadResourcesFromHTML();
        ƒ.Debug.log("Project:", ƒ.Project.resources);
        // pick the graph to show
        let graph = ƒ.Project.resources["Graph|2022-07-19T14:38:32.088Z|43601"];
        ƒ.Debug.log("Graph:", graph);
        if (!graph) {
            alert("Nothing to render. Create a graph with at least a mesh, material and probably some light");
            return;
        }
        // setup the viewport
        let cmpCamera = new ƒ.ComponentCamera();
        let canvas = document.querySelector("canvas");
        let viewport = new ƒ.Viewport();
        viewport.initialize("InteractiveViewport", graph, cmpCamera, canvas);
        ƒ.Debug.log("Viewport:", viewport);
        // setup audio
        ƒ.AudioManager.default.listenTo(graph);
        // draw viewport once for immediate feedback
        viewport.draw();
        canvas.dispatchEvent(new CustomEvent("interactiveViewportStarted", { bubbles: true, detail: viewport }));
    }
    document.addEventListener("interactiveViewportStarted", start);
    async function start(_event) {
        viewport = _event.detail;
        let response = await fetch("config.json");
        Script.config = await response.json();
        playerLives = Script.config["liveCount"];
        Script.gameState = new Script.GameState(playerLives, Script.coinCounter, Script.config["coinCount"]);
        Script.graph = viewport.getBranch();
        Script.avatarClass = new Script.Avatar();
        Script.avatarNode = Script.graph.getChildrenByName("Avatar")[0];
        ƒ.AudioManager.default.listenWith(Script.avatarNode.getComponent(ƒ.ComponentAudioListener));
        Script.jumpSound = Script.avatarNode.getChildrenByName("Sounds")[0].getComponents(ƒ.ComponentAudio)[0];
        Script.environmentSound = Script.avatarNode.getChildrenByName("Sounds")[0].getComponents(ƒ.ComponentAudio)[1];
        Script.winMusic = Script.avatarNode.getChildrenByName("Sounds")[0].getComponents(ƒ.ComponentAudio)[2];
        Script.collectCoinSound = Script.avatarNode.getChildrenByName("Sounds")[0].getComponents(ƒ.ComponentAudio)[3];
        Script.starSound = Script.avatarNode.getChildrenByName("Sounds")[0].getComponents(ƒ.ComponentAudio)[4];
        Script.cmpAvatarRigidBody = Script.avatarNode.getComponent(ƒ.ComponentRigidbody);
        Script.ground = Script.graph.getChildrenByName("Environment")[0].getChildrenByName("Ground")[0];
        cmpCamera = Script.avatarNode.getChildrenByName("Camera")[0].getComponent(ƒ.ComponentCamera);
        camTransportCmp = Script.avatarNode.getChildrenByName("Camera")[0].getComponent(ƒ.ComponentTransform);
        viewport.camera = cmpCamera;
        let canvas = viewport.getCanvas();
        canvas.addEventListener("pointermove", hndPointerMove);
        canvas.requestPointerLock();
        for (let i = 1; i <= Script.config["enemyCount"]; i++) {
            let cmpSoundEnemy = new ƒ.ComponentAudio(Script.graph.getChildrenByName("Sound")[0].getComponents(ƒ.ComponentAudio)[0].getAudio());
            cmpSoundEnemy.volume = 0.15;
            cmpSoundEnemy.loop = true;
            let enemy = new Script.Enemy();
            enemy.name = "Enemy" + i;
            enemy.addComponent(new Script.EnemyMovement);
            enemy.addComponent(new Script.EnemyStateMachine);
            enemy.addComponent(cmpSoundEnemy);
            enemy.getComponent(ƒ.ComponentAudio).play(true);
            enemyClassArray.push(enemy);
            Script.graph.getChildrenByName("Entities")[0].getChildrenByName("Enemies")[0].addChild(enemy);
        }
        for (let i = 1; i <= Script.config["coinCount"]; i++) {
            let coin = new Script.Coin();
            Script.graph.getChildrenByName("Collectibles")[0].getChildrenByName("Coins")[0].addChild(coin);
        }
        Script.graph.addEventListener("playerHit", PlayerHit);
        Script.graph.addEventListener("allCoinsCollected", CollectedAllCoins);
        Script.graph.addEventListener("endGame", EndGame);
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        ƒ.Loop.start(); // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
    }
    function update(_event) {
        ƒ.Physics.simulate(); // if physics is included and used
        Script.avatarClass.update();
        for (let i = 0; i < enemyClassArray.length; i++) {
            enemyClassArray[i].update();
        }
        Script.enemyRot += 5;
        viewport.draw();
        ƒ.AudioManager.default.update();
    }
    function hndPointerMove(_event) {
        rotationY += (_event.movementX * speedRotY);
        rotationX += (_event.movementY * speedRotX);
        rotationX = Math.min(10, Math.max(-15, rotationX));
        Script.cmpAvatarRigidBody.setRotation(new ƒ.Vector3(0, rotationY, 0));
        camTransportCmp.mtxLocal.rotation = new ƒ.Vector3((rotationX), 0, 0);
    }
    function PlayerHit(_event) {
        Script.playerInvincible = true;
        Script.avatarNode.getComponent(ƒ.ComponentMaterial).clrPrimary = new ƒ.Color(0.5, 0.5, 0.5, 1);
        setTimeout(() => { Script.playerInvincible = false; Script.avatarNode.getComponent(ƒ.ComponentMaterial).clrPrimary = new ƒ.Color(1, 1, 1, 1); }, 3000);
        if (playerLives > 1) {
            playerLives -= 1;
            Script.gameState.lives = playerLives;
            Script.cmpAvatarRigidBody.setPosition(new ƒ.Vector3(0, 1, 0));
        }
        else {
            Script.graph.dispatchEvent(new CustomEvent("endGame", { detail: "dead" }));
        }
    }
    function CollectedAllCoins(_event) {
        Script.environmentSound.play(false);
        Script.winMusic.play(true);
        let doorNode = Script.graph.getChildrenByName("Environment")[0].getChildrenByName("StarPlatform")[0].getChildrenByName("Door")[0];
        let animseq = new ƒ.AnimationSequence();
        animseq.addKey(new ƒ.AnimationKey(0, 0));
        animseq.addKey(new ƒ.AnimationKey(8000, 5));
        let animStructure = {
            components: {
                ComponentTransform: [
                    {
                        "ƒ.ComponentTransform": {
                            mtxLocal: {
                                translation: {
                                    z: animseq
                                }
                            }
                        }
                    }
                ]
            }
        };
        let animation = new ƒ.Animation("doorAnimation", animStructure, 60);
        let cmpAnimator = new ƒ.ComponentAnimator(animation, ƒ.ANIMATION_PLAYMODE.PLAYONCE, ƒ.ANIMATION_PLAYBACK.FRAMEBASED);
        cmpAnimator.scale = 1;
        doorNode.addComponent(cmpAnimator);
        cmpAnimator.activate(true);
    }
    function EndGame(_event) {
        Script.environmentSound.play(false);
        Script.winMusic.play(false);
        for (let i = 0; i < enemyClassArray.length; i++) {
            if (enemyClassArray[i].getComponent(ƒ.ComponentAudio)) {
                enemyClassArray[i].getComponent(ƒ.ComponentAudio).play(false);
            }
        }
        ƒ.Loop.removeEventListener("loopFrame" /* LOOP_FRAME */, update);
        let canvas = document.querySelector("canvas");
        canvas.style.display = "none";
        let vuiDiv = document.querySelector("#vui");
        vuiDiv.style.display = "none";
        if (_event.detail === "win") {
            Script.starSound.play(true);
            let winDiv = document.querySelector("#win");
            winDiv.style.display = "block";
        }
        else if (_event.detail === "dead") {
            let deadDiv = document.querySelector("#dead");
            deadDiv.style.display = "block";
        }
    }
    function getPos(_yValue) {
        return new ƒ.Vector3(Math.floor(Math.random() * (Script.mapBorderHigh - Script.mapBorderLow + 1)) + Script.mapBorderLow, _yValue, Math.floor(Math.random() * (Script.mapBorderHigh - Script.mapBorderLow + 1)) + Script.mapBorderLow);
    }
    Script.getPos = getPos;
})(Script || (Script = {}));
//# sourceMappingURL=Script.js.map