"use strict";
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization
    class CustomComponentScript extends ƒ.ComponentScript {
        // Register the script as component for use in the editor via drag&drop
        static iSubclass = ƒ.Component.registerSubclass(CustomComponentScript);
        // Properties may be mutated by users in the editor via the automatically created user interface
        message = "CustomComponentScript added to ";
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
                    ƒ.Debug.log(this.message, this.node);
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
    }
    Script.CustomComponentScript = CustomComponentScript;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    var ƒAid = FudgeAid;
    window.addEventListener("load", init);
    ƒ.Debug.info("Main Program Template running!");
    let viewport;
    let pacman;
    let ghosts = {
        pinky: new ƒ.Node("pinky"),
        blinky: new ƒ.Node("blinky"),
        inky: new ƒ.Node("inky"),
        clyde: new ƒ.Node("clyde"),
    };
    let pacman_moves_allowed = { up: true, down: false, right: true, left: false };
    let border_coords = [];
    let move_direction = "";
    let direction_change = "";
    let ghost_direction_change = "";
    let speed = 1 / 60;
    let speed_direction = {
        up: new ƒ.Vector3(0, speed, 0),
        down: new ƒ.Vector3(0, -speed, 0),
        right: new ƒ.Vector3(speed, 0, 0),
        left: new ƒ.Vector3(-speed, 0, 0),
    };
    let sprite_direction = {
        up: new ƒ.Vector3(0, 0, 90),
        down: new ƒ.Vector3(0, 0, 270),
        right: new ƒ.Vector3(0, 0, 0),
        left: new ƒ.Vector3(0, 180, 0),
    };
    let waka_sound;
    let dialog;
    let animations;
    let spriteNode;
    function init(_event) {
        dialog = document.querySelector("dialog");
        dialog.querySelector("h1").textContent = document.title;
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
        // setup sprites
        await loadSprites();
        spriteNode = new ƒAid.NodeSprite("Sprite");
        spriteNode.addComponent(new ƒ.ComponentTransform(new ƒ.Matrix4x4()));
        spriteNode.setAnimation(animations["chew"]);
        spriteNode.setFrameDirection(1);
        spriteNode.mtxLocal.translateZ(0.6);
        spriteNode.framerate = 30;
        ƒ.Debug.log("Project:", ƒ.Project.resources);
        // pick the graph to show
        let graph = ƒ.Project.resources["Graph|2022-03-17T14:08:51.514Z|30434"];
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
        waka_sound = graph.getChildrenByName("Sound")[0].getComponents(ƒ.ComponentAudio)[1];
        // draw viewport once for immediate feedback
        viewport.draw();
        canvas.dispatchEvent(new CustomEvent("interactiveViewportStarted", { bubbles: true, detail: viewport }));
    }
    document.addEventListener("interactiveViewportStarted", start);
    function start(_event) {
        viewport = _event.detail;
        viewport.camera.mtxPivot.translate(new ƒ.Vector3(2.5, 2.5, 16));
        viewport.camera.mtxPivot.rotateY(180);
        let graph = viewport.getBranch();
        pacman = graph.getChildrenByName("Pacman")[0];
        let borders = graph.getChildrenByName("Grid")[0].getChildrenByName("Borders")[0].getChildren();
        for (let border_types of borders) {
            for (let border of border_types.getChildren()) {
                for (let tile of border.getChildren()) {
                    border_coords.push(tile.mtxWorld.translation);
                }
            }
        }
        ghosts.pinky = createGhost("pinky");
        ghosts.blinky = createGhost("blinky");
        ghosts.inky = createGhost("inky");
        ghosts.clyde = createGhost("clyde");
        graph.addChild(ghosts.pinky);
        // graph.addChild(ghosts.blinky);
        // graph.addChild(ghosts.inky);
        // graph.addChild(ghosts.clyde);
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        ƒ.Loop.start(); // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
    }
    function update(_event) {
        // ƒ.Physics.simulate();  // if physics is included and used
        if (pacman_moves_allowed.up && ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_UP, ƒ.KEYBOARD_CODE.W])) {
            move_direction = "up";
            console.log("Button Pressed: UP");
        }
        if (pacman_moves_allowed.down && ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_DOWN, ƒ.KEYBOARD_CODE.S])) {
            move_direction = "down";
            console.log("Button Pressed: DOWN");
        }
        if (pacman_moves_allowed.right && ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_RIGHT, ƒ.KEYBOARD_CODE.D])) {
            move_direction = "right";
            console.log("Button Pressed: RIGHT");
        }
        if (pacman_moves_allowed.left && ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_LEFT, ƒ.KEYBOARD_CODE.A])) {
            move_direction = "left";
            console.log("Button Pressed: LEFT");
        }
        // if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.SPACE])) {
        //   move_direction = "";
        //   direction_change = "";
        // }
        move(move_direction);
        moveGhost("pinky");
        // moveGhost("blinky");
        // moveGhost("inky");
        // moveGhost("clyde");
        viewport.draw();
    }
    function move(direction) {
        if (direction !== "") {
            if (direction !== "" && (direction === "up" || direction === "down") && pacman.mtxLocal.translation.x % 1 < 0.02) {
                direction_change = direction;
            }
            else if (direction !== "" && (direction === "left" || direction === "right") && pacman.mtxLocal.translation.y % 1 < 0.02) {
                direction_change = direction;
            }
            checkHitsWall(direction);
        }
        if (direction_change !== "") {
            pacman.mtxLocal.translate(speed_direction[direction_change]);
            spriteNode.mtxLocal.recycle();
            spriteNode.mtxLocal.translateZ(0.6);
            spriteNode.mtxLocal.rotation = sprite_direction[direction_change];
            if (pacman.findChild(spriteNode) === -1) {
                pacman.mtxLocal.translateZ(-0.5);
                pacman.addChild(spriteNode);
            }
            if (!waka_sound.isPlaying) {
                waka_sound.play(true);
            }
        }
    }
    function checkHitsWall(direction) {
        let hits_wall = false;
        let hit_direction = [];
        let pacman_grid = { up: ƒ.Vector3, down: ƒ.Vector3, right: ƒ.Vector3, left: ƒ.Vector3 };
        pacman_grid.up = new ƒ.Vector3(Math.round(pacman.mtxLocal.translation.x), Math.round(pacman.mtxLocal.translation.y) + 1, 0);
        pacman_grid.down = new ƒ.Vector3(Math.round(pacman.mtxLocal.translation.x), Math.round(pacman.mtxLocal.translation.y) - 1, 0);
        pacman_grid.right = new ƒ.Vector3(Math.round(pacman.mtxLocal.translation.x) + 1, Math.round(pacman.mtxLocal.translation.y), 0);
        pacman_grid.left = new ƒ.Vector3(Math.round(pacman.mtxLocal.translation.x) - 1, Math.round(pacman.mtxLocal.translation.y), 0);
        pacman_moves_allowed.up = true;
        pacman_moves_allowed.down = true;
        pacman_moves_allowed.right = true;
        pacman_moves_allowed.left = true;
        for (let border of border_coords) {
            if (border.equals(pacman_grid.up)) {
                hits_wall = true;
                hit_direction.push("up");
                pacman_moves_allowed.up = false;
            }
            if (border.equals(pacman_grid.down)) {
                hits_wall = true;
                hit_direction.push("down");
                pacman_moves_allowed.down = false;
            }
            if (border.equals(pacman_grid.right)) {
                hits_wall = true;
                hit_direction.push("right");
                pacman_moves_allowed.right = false;
            }
            if (border.equals(pacman_grid.left)) {
                hits_wall = true;
                hit_direction.push("left");
                pacman_moves_allowed.left = false;
            }
        }
        for (let hit of hit_direction) {
            if (hits_wall && hit === direction && ((direction === "up" || direction === "down") && pacman.mtxLocal.translation.y % 1 < 0.02)) {
                move_direction = "";
                direction_change = "";
                waka_sound.play(false);
                pacman.removeChild(spriteNode);
                pacman.mtxLocal.translateZ(0.5);
                console.log("Hit Wall: " + hit);
            }
            else if (hits_wall && hit === direction && ((direction === "left" || direction === "right") && pacman.mtxLocal.translation.x % 1 < 0.02)) {
                move_direction = "";
                direction_change = "";
                waka_sound.play(false);
                pacman.removeChild(spriteNode);
                pacman.mtxLocal.translateZ(0.5);
                console.log("Hit Wall: " + hit);
            }
        }
    }
    async function loadSprites() {
        let imgSpriteSheet = new ƒ.TextureImage();
        await imgSpriteSheet.load("Sprites/pacmans.png");
        let spriteSheet = new ƒ.CoatTextured(ƒ.Color.CSS("white"), imgSpriteSheet);
        generateSprites(spriteSheet);
    }
    function generateSprites(_spritesheet) {
        animations = {};
        let name = "chew";
        let sprite = new ƒAid.SpriteSheetAnimation(name, _spritesheet);
        sprite.generateByGrid(ƒ.Rectangle.GET(0, 0, 64, 64), 14, 64, ƒ.ORIGIN2D.CENTER, ƒ.Vector2.X(64));
        animations[name] = sprite;
    }
    function createGhost(ghost) {
        let node = new ƒ.Node("Ghost");
        let mesh = new ƒ.MeshSphere();
        let material = new ƒ.Material("MaterialGhost", ƒ.ShaderLit, new ƒ.CoatColored());
        let cmpMesh = new ƒ.ComponentMesh(mesh);
        let cmpMaterial = new ƒ.ComponentMaterial(material);
        let cmpTransform = new ƒ.ComponentTransform();
        node.addComponent(cmpMesh);
        node.addComponent(cmpMaterial);
        node.addComponent(cmpTransform);
        switch (ghost) {
            case "pinky":
                cmpMaterial.clrPrimary = new ƒ.Color(1, 0.72, 1, 1);
                node.mtxLocal.translateX(5);
                node.mtxLocal.translateY(5);
                node.mtxLocal.translateZ(0.05);
                break;
            case "blinky":
                cmpMaterial.clrPrimary = new ƒ.Color(1, 0, 0, 1);
                node.mtxLocal.translateX(4);
                node.mtxLocal.translateY(5);
                node.mtxLocal.translateZ(0.05);
                break;
            case "inky":
                cmpMaterial.clrPrimary = new ƒ.Color(0, 1, 1, 1);
                node.mtxLocal.translateX(3);
                node.mtxLocal.translateY(5);
                node.mtxLocal.translateZ(0.05);
                break;
            case "clyde":
                cmpMaterial.clrPrimary = new ƒ.Color(1, 0.72, 0.32, 1);
                node.mtxLocal.translateX(2);
                node.mtxLocal.translateY(5);
                node.mtxLocal.translateZ(0.05);
                break;
        }
        node.mtxLocal.scaleX(0.9);
        node.mtxLocal.scaleY(0.9);
        return node;
    }
    function moveGhost(ghost) {
        let move = Math.floor(Math.random() * 3);
        let direction = "";
        if (move === 0) {
            direction = "up";
        }
        else if (move === 1) {
            direction = "down";
        }
        else if (move === 2) {
            direction = "right";
        }
        else if (move === 3) {
            direction = "left";
        }
        // if (direction !== "") {
        //   if (direction !== "" && (direction === "up" || direction === "down") && ghosts[ghost].mtxLocal.translation.x % 1 < 0.02) {
        //     ghost_direction_change = direction;
        //   }
        //   else if (direction !== "" && (direction === "left" || direction === "right") && ghosts[ghost].mtxLocal.translation.y % 1 < 0.02) {
        //     ghost_direction_change = direction;
        //   }
        // }
        if (ghost_direction_change !== "") {
            ghosts[ghost].mtxLocal.translate(speed_direction[ghost_direction_change]);
        }
    }
    function checkHitsWallGhost(direction, ghost) {
        let hits_wall = false;
        let hit_direction = [];
        let pacman_grid = { up: ƒ.Vector3, down: ƒ.Vector3, right: ƒ.Vector3, left: ƒ.Vector3 };
        pacman_grid.up = new ƒ.Vector3(Math.round(ghosts[ghost].mtxLocal.translation.x), Math.round(ghosts[ghost].mtxLocal.translation.y) + 1, 0);
        pacman_grid.down = new ƒ.Vector3(Math.round(ghosts[ghost].mtxLocal.translation.x), Math.round(ghosts[ghost].mtxLocal.translation.y) - 1, 0);
        pacman_grid.right = new ƒ.Vector3(Math.round(ghosts[ghost].mtxLocal.translation.x) + 1, Math.round(ghosts[ghost].mtxLocal.translation.y), 0);
        pacman_grid.left = new ƒ.Vector3(Math.round(ghosts[ghost].mtxLocal.translation.x) - 1, Math.round(ghosts[ghost].mtxLocal.translation.y), 0);
        for (let border of border_coords) {
            if (border.equals(pacman_grid.up)) {
                hits_wall = true;
                hit_direction.push("up");
            }
            if (border.equals(pacman_grid.down)) {
                hits_wall = true;
                hit_direction.push("down");
            }
            if (border.equals(pacman_grid.right)) {
                hits_wall = true;
                hit_direction.push("right");
            }
            if (border.equals(pacman_grid.left)) {
                hits_wall = true;
                hit_direction.push("left");
            }
        }
        for (let hit of hit_direction) {
            if (hits_wall && hit === direction && ((direction === "up" || direction === "down") && ghosts[ghost].mtxLocal.translation.y % 1 < 0.02)) {
                ghost_direction_change = "";
            }
            else if (hits_wall && hit === direction && ((direction === "left" || direction === "right") && ghosts[ghost].mtxLocal.translation.x % 1 < 0.02)) {
                ghost_direction_change = "";
            }
        }
    }
})(Script || (Script = {}));
//# sourceMappingURL=Script.js.map