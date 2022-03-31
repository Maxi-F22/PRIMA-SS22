namespace Script {
  import ƒ = FudgeCore;
  window.addEventListener("load", init);
  ƒ.Debug.info("Main Program Template running!");



  let viewport: ƒ.Viewport;
  let pacman: ƒ.Node;
  let pacman_moves_allowed: any = {up: true, down: false, right: true, left: false}
  let border_coords: ƒ.Vector3[] = [];
  let move_direction: string = "";
  let direction_change: string = "";
  let speed: number = 1/100;
  let speed_direction: any = {
    up: new ƒ.Vector3(0, speed, 0),
    down: new ƒ.Vector3(0, -speed, 0),
    right: new ƒ.Vector3(speed, 0, 0),
    left: new ƒ.Vector3(-speed, 0, 0),
  };
  let waka_sound: ƒ.ComponentAudio

  let dialog: HTMLDialogElement;
  function init(_event: Event): void {
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

  async function startInteractiveViewport(): Promise<void> {
    // load resources referenced in the link-tag
    await ƒ.Project.loadResourcesFromHTML();
    ƒ.Debug.log("Project:", ƒ.Project.resources);
    // pick the graph to show
    let graph: ƒ.Graph = <ƒ.Graph>ƒ.Project.resources["Graph|2022-03-17T14:08:51.514Z|30434"];
    ƒ.Debug.log("Graph:", graph);
    if (!graph) {
      alert("Nothing to render. Create a graph with at least a mesh, material and probably some light");
      return;
    }
    // setup the viewport
    let cmpCamera: ƒ.ComponentCamera = new ƒ.ComponentCamera();
    let canvas: HTMLCanvasElement = document.querySelector("canvas");
    let viewport: ƒ.Viewport = new ƒ.Viewport();
    viewport.initialize("InteractiveViewport", graph, cmpCamera, canvas);
    ƒ.Debug.log("Viewport:", viewport);
    // setup audio
    ƒ.AudioManager.default.listenTo(graph);
    waka_sound = graph.getChildrenByName("Sound")[0].getComponents(ƒ.ComponentAudio)[1];
    // draw viewport once for immediate feedback
    viewport.draw();
    canvas.dispatchEvent(new CustomEvent("interactiveViewportStarted", { bubbles: true, detail: viewport }));
  }

  document.addEventListener("interactiveViewportStarted", <EventListener>start);

  function start(_event: CustomEvent): void {
    viewport = _event.detail;

    viewport.camera.mtxPivot.translate(new ƒ.Vector3(2.5,2.5,16));
    viewport.camera.mtxPivot.rotateY(180);

    let graph: ƒ.Node = viewport.getBranch();

    pacman = graph.getChildrenByName("Pacman")[0];
    let borders: ƒ.Node[] = graph.getChildrenByName("Grid")[0].getChildrenByName("Borders")[0].getChildren();
    for (let border_types of borders) {
      for (let border of border_types.getChildren()) {
        for (let tile of border.getChildren()) {
          border_coords.push(tile.mtxWorld.translation);
        }
      }
    }
    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start();  // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
  }

  function update(_event: Event): void {
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
    viewport.draw();
  }

  function move(direction: string): void {
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
      if (!waka_sound.isPlaying) {
        waka_sound.play(true);
      }
    }
  }

  function checkHitsWall(direction: string): void {
    let hits_wall: boolean = false;
    let hit_direction: string[] = [];
    let pacman_grid: any = {up: ƒ.Vector3, down: ƒ.Vector3, right: ƒ.Vector3, left: ƒ.Vector3};
    
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
        console.log("Hit Wall: " + hit);
      }
      else if (hits_wall && hit === direction && ((direction === "left" || direction === "right") && pacman.mtxLocal.translation.x % 1 < 0.02)) {
        move_direction = "";
        direction_change = "";
        waka_sound.play(false);
        console.log("Hit Wall: " + hit);
      }
    }

  }
}