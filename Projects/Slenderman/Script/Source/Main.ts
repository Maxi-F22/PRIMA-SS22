namespace Script {
  import ƒ = FudgeCore;
  ƒ.Debug.info("Main Program Template running!");

  export let ground: ƒ.Node;
  let viewport: ƒ.Viewport;
  let avatar: ƒ.Node;
  let cmpCamera: ƒ.ComponentCamera;
  let cmpLight: ƒ.ComponentLight;
  let speedRotY: number = -0.1;
  let speedRotX: number = 0.1;
  let rotationX: number = 0;
  let cntWalk: ƒ.Control = new ƒ.Control("cntWalk", 6, ƒ.CONTROL_TYPE.PROPORTIONAL);
  // cntWalk.setDelay(500);
  document.addEventListener("interactiveViewportStarted", <EventListener>start);



  function start(_event: CustomEvent): void {
    viewport = _event.detail;
    let graph: ƒ.Node = viewport.getBranch();
    avatar = graph.getChildrenByName("Avatar")[0];
    cmpCamera = avatar.getChild(0).getComponent(ƒ.ComponentCamera);
    cmpLight = avatar.getChild(1).getComponent(ƒ.ComponentLight);
    ground = graph.getChildrenByName("Environment")[0].getChildrenByName("Ground")[0];
    viewport.camera = cmpCamera;
    
    let canvas: HTMLCanvasElement = viewport.getCanvas();
    canvas.addEventListener("pointermove", hndPointerMove);
    canvas.requestPointerLock();

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start();  // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
  }

  function update(_event: Event): void {
    ƒ.Physics.simulate();  // if physics is included and used
    controlWalk();
    controlStrave();
    setToGround();
    viewport.draw();
    ƒ.AudioManager.default.update();
  }

  function controlWalk(): void {
    let inputWalk: number = ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.W], [ƒ.KEYBOARD_CODE.S]);
    cntWalk.setInput(inputWalk);
    avatar.mtxLocal.translateZ(cntWalk.getOutput() * ƒ.Loop.timeFrameGame / 1000);
  }

  function controlStrave(): void {
    let inputStrave: number = ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.A], [ƒ.KEYBOARD_CODE.D]);
    cntWalk.setInput(inputStrave);
    avatar.mtxLocal.translateX(cntWalk.getOutput() * ƒ.Loop.timeFrameGame / 1000);
  }

  function setToGround() {
    let cmpGroundMesh: ƒ.ComponentMesh = ground.getComponent(ƒ.ComponentMesh);
    let terrain: ƒ.MeshTerrain = <ƒ.MeshTerrain>cmpGroundMesh.mesh;
    let terrainInfo = terrain.getTerrainInfo(avatar.mtxLocal.translation, cmpGroundMesh.mtxWorld);
    let distance: number = terrainInfo.distance;
    avatar.mtxLocal.translateY(-distance);
  }

  function hndPointerMove(_event: PointerEvent): void {
    avatar.mtxLocal.rotateY(_event.movementX * speedRotY);
    rotationX += (_event.movementY * speedRotX);
    rotationX = Math.min(80, Math.max(-80, rotationX));
    cmpCamera.mtxPivot.rotation = ƒ.Vector3.X(rotationX);
    cmpLight.mtxPivot.rotation = ƒ.Vector3.X(rotationX);
  }
}