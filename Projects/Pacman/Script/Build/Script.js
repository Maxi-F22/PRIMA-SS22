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
    ƒ.Debug.info("Main Program Template running!");
    let viewport;
    let pacman;
    let borders;
    let move_direction = "";
    let direction_change = "";
    let speed = 1 / 100;
    let speed_direction = {
        up: new ƒ.Vector3(0, speed, 0),
        down: new ƒ.Vector3(0, -speed, 0),
        right: new ƒ.Vector3(speed, 0, 0),
        left: new ƒ.Vector3(-speed, 0, 0),
    };
    document.addEventListener("interactiveViewportStarted", start);
    function start(_event) {
        viewport = _event.detail;
        let graph = viewport.getBranch();
        pacman = graph.getChildrenByName("Pacman")[0];
        borders = graph.getChildrenByName("Grid")[0].getChildrenByName("Borders")[0].getChildren();
        for (let border_types of borders) {
            for (let border of border_types.getChildren()) {
                console.log(border.mtxLocal.translation);
            }
        }
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        ƒ.Loop.start(); // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
    }
    function update(_event) {
        // ƒ.Physics.simulate();  // if physics is included and used
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_UP, ƒ.KEYBOARD_CODE.W])) {
            move_direction = "up";
        }
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_DOWN, ƒ.KEYBOARD_CODE.S])) {
            move_direction = "down";
        }
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_RIGHT, ƒ.KEYBOARD_CODE.D])) {
            move_direction = "right";
        }
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_LEFT, ƒ.KEYBOARD_CODE.A])) {
            move_direction = "left";
        }
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.SPACE])) {
            move_direction = "";
            direction_change = "";
        }
        move(move_direction);
        viewport.draw();
        ƒ.AudioManager.default.update();
    }
    function move(direction) {
        if (direction !== "") {
            if (direction !== "" && (direction === "up" || direction === "down") && pacman.mtxLocal.translation.x % 1 < 0.01) {
                direction_change = direction;
            }
            else if (direction !== "" && (direction === "left" || direction === "right") && pacman.mtxLocal.translation.y % 1 < 0.01) {
                direction_change = direction;
            }
        }
        if (direction_change !== "") {
            pacman.mtxLocal.translate(speed_direction[direction_change]);
        }
    }
})(Script || (Script = {}));
//# sourceMappingURL=Script.js.map