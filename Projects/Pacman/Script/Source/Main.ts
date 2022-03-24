namespace Script {
  import ƒ = FudgeCore;
  ƒ.Debug.info("Main Program Template running!");

  let viewport: ƒ.Viewport;
  let pacman: ƒ.Node;
  let borders: ƒ.Node[];
  let move_direction: string = "";
  let direction_change: string = "";
  let speed: number = 1/100;
  let speed_direction: any = {
    up: new ƒ.Vector3(0, speed, 0),
    down: new ƒ.Vector3(0, -speed, 0),
    right: new ƒ.Vector3(speed, 0, 0),
    left: new ƒ.Vector3(-speed, 0, 0),
  };

  document.addEventListener("interactiveViewportStarted", <EventListener>start);

  function start(_event: CustomEvent): void {
    viewport = _event.detail;
    let graph: ƒ.Node = viewport.getBranch();

    pacman = graph.getChildrenByName("Pacman")[0];
    borders = graph.getChildrenByName("Grid")[0].getChildrenByName("Borders")[0].getChildren();
    for (let border_types of borders) {
      for (let border of border_types.getChildren()) {
        console.log(border.mtxLocal.translation);
      }
    }
    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start();  // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
  }

  function update(_event: Event): void {
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

  function move(direction: string): void {
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
}