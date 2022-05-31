"use strict";
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Debug.info("Main Program Template running!");
    let viewport;
    let avatar;
    let bird;
    let cmpCamera;
    let cmpLight;
    let speedRotY = -0.1;
    let speedRotX = 0.1;
    let rotationX = 0;
    let cntWalk = new ƒ.Control("cntWalk", 6, 0 /* PROPORTIONAL */);
    // cntWalk.setDelay(500);
    document.addEventListener("interactiveViewportStarted", start);
    function start(_event) {
        viewport = _event.detail;
        let graph = viewport.getBranch();
        avatar = graph.getChildrenByName("Avatar")[0];
        bird = graph.getChildrenByName("Environment")[0].getChildrenByName("Bird")[0];
        cmpCamera = avatar.getChild(0).getComponent(ƒ.ComponentCamera);
        cmpLight = avatar.getChild(1).getComponent(ƒ.ComponentLight);
        Script.ground = graph.getChildrenByName("Environment")[0].getChildrenByName("Ground")[0];
        viewport.camera = cmpCamera;
        let canvas = viewport.getCanvas();
        canvas.addEventListener("pointermove", hndPointerMove);
        canvas.requestPointerLock();
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        ƒ.Loop.start(); // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
        initAnim();
        document.body.addEventListener("change", initAnim);
    }
    function update(_event) {
        ƒ.Physics.simulate(); // if physics is included and used
        controlWalk();
        controlStrave();
        setToGround();
        viewport.draw();
        ƒ.AudioManager.default.update();
    }
    function controlWalk() {
        let inputWalk = ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.W], [ƒ.KEYBOARD_CODE.S]);
        cntWalk.setInput(inputWalk);
        avatar.mtxLocal.translateZ(cntWalk.getOutput() * ƒ.Loop.timeFrameGame / 1000);
    }
    function controlStrave() {
        let inputStrave = ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.A], [ƒ.KEYBOARD_CODE.D]);
        cntWalk.setInput(inputStrave);
        avatar.mtxLocal.translateX(cntWalk.getOutput() * ƒ.Loop.timeFrameGame / 1000);
    }
    function setToGround() {
        let cmpGroundMesh = Script.ground.getComponent(ƒ.ComponentMesh);
        let terrain = cmpGroundMesh.mesh;
        let terrainInfo = terrain.getTerrainInfo(avatar.mtxLocal.translation, cmpGroundMesh.mtxWorld);
        let distance = terrainInfo.distance;
        avatar.mtxLocal.translateY(-distance);
    }
    function hndPointerMove(_event) {
        avatar.mtxLocal.rotateY(_event.movementX * speedRotY);
        rotationX += (_event.movementY * speedRotX);
        rotationX = Math.min(80, Math.max(-80, rotationX));
        cmpCamera.mtxPivot.rotation = ƒ.Vector3.X(rotationX);
        cmpLight.mtxPivot.rotation = ƒ.Vector3.X(rotationX);
    }
    function initAnim() {
        let animseq = new ƒ.AnimationSequence();
        animseq.addKey(new ƒ.AnimationKey(0, 5));
        animseq.addKey(new ƒ.AnimationKey(6000, -5));
        animseq.addKey(new ƒ.AnimationKey(12000, 5));
        let animStructure = {
            components: {
                ComponentTransform: [
                    {
                        "ƒ.ComponentTransform": {
                            mtxLocal: {
                                translation: {
                                    x: animseq,
                                    z: animseq
                                }
                            }
                        }
                    }
                ]
            }
        };
        let animation = new ƒ.Animation("testAnimation", animStructure, 60);
        let cmpAnimator = new ƒ.ComponentAnimator(animation, ƒ.ANIMATION_PLAYMODE.LOOP, ƒ.ANIMATION_PLAYBACK.FRAMEBASED);
        cmpAnimator.scale = 1;
        if (bird.getComponent(ƒ.ComponentAnimator)) {
            bird.removeComponent(bird.getComponent(ƒ.ComponentAnimator));
        }
        bird.addComponent(cmpAnimator);
        cmpAnimator.activate(true);
    }
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization
    class SetToGroundMesh extends ƒ.ComponentScript {
        // Register the script as component for use in the editor via drag&drop
        static iSubclass = ƒ.Component.registerSubclass(SetToGroundMesh);
        // Properties may be mutated by users in the editor via the automatically created user interface
        constructor() {
            super();
            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            // Listen to this component being added to or removed from a node
            this.addEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
            this.addEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
            this.addEventListener("nodeDeserialized" /* NODE_DESERIALIZED */, this.hndEvent);
        }
        // Activate the functions of this component as response to events
        hndEvent = (_event) => {
            switch (_event.type) {
                case "componentAdd" /* COMPONENT_ADD */:
                    this.node.addEventListener("renderPrepare" /* RENDER_PREPARE */, this.setPos);
                    break;
                case "componentRemove" /* COMPONENT_REMOVE */:
                    this.removeEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
                    this.removeEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
                    break;
                case "nodeDeserialized" /* NODE_DESERIALIZED */:
                    // if deserialized the node is now fully reconstructed and access to all its components and children is possible
                    break;
            }
        };
        setPos = (_event) => {
            if (Script.ground) {
                let cmpGroundMesh = Script.ground.getComponent(ƒ.ComponentMesh);
                let terrain = cmpGroundMesh.mesh;
                let terrainInfo = terrain.getTerrainInfo(this.node.mtxLocal.translation, cmpGroundMesh.mtxWorld);
                let distance = terrainInfo.distance;
                if (this.node.name === "SlenderInstance") {
                    this.node.mtxLocal.translateY(0.5 + (-distance));
                }
                else {
                    this.node.mtxLocal.translateY(-distance);
                }
            }
        };
    }
    Script.SetToGroundMesh = SetToGroundMesh;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization
    class SlenderManMove extends ƒ.ComponentScript {
        // Register the script as component for use in the editor via drag&drop
        static iSubclass = ƒ.Component.registerSubclass(SlenderManMove);
        // Properties may be mutated by users in the editor via the automatically created user interface
        timeToChange = 0;
        direction = ƒ.Vector3.ZERO();
        constructor() {
            super();
            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            // Listen to this component being added to or removed from a node
            this.addEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
            this.addEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
            this.addEventListener("nodeDeserialized" /* NODE_DESERIALIZED */, this.hndEvent);
        }
        // Activate the functions of this component as response to events
        hndEvent = (_event) => {
            switch (_event.type) {
                case "componentAdd" /* COMPONENT_ADD */:
                    this.node.addEventListener("renderPrepare" /* RENDER_PREPARE */, this.move);
                    break;
                case "componentRemove" /* COMPONENT_REMOVE */:
                    this.removeEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
                    this.removeEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
                    break;
                case "nodeDeserialized" /* NODE_DESERIALIZED */:
                    // if deserialized the node is now fully reconstructed and access to all its components and children is possible
                    break;
            }
        };
        move = (_event) => {
            if (this.node.mtxLocal.translation.x > 10 || this.node.mtxLocal.translation.x < -10 || this.node.mtxLocal.translation.z > 10 || this.node.mtxLocal.translation.z < -10) {
                return;
            }
            this.node.mtxLocal.translate(ƒ.Vector3.SCALE(this.direction, ƒ.Loop.timeFrameGame / 500));
            this.node.mtxLocal.translateY(0.5);
            if (this.timeToChange > ƒ.Time.game.get()) {
                return;
            }
            this.timeToChange = ƒ.Time.game.get() + 3000;
            this.direction = ƒ.Random.default.getVector3(new ƒ.Vector3(-1, 0, -1), new ƒ.Vector3(1, 0, 1));
        };
    }
    Script.SlenderManMove = SlenderManMove;
})(Script || (Script = {}));
//# sourceMappingURL=Script.js.map