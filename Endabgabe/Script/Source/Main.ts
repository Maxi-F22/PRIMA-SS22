namespace Script {
  import ƒ = FudgeCore;

  window.addEventListener("load", init);
  ƒ.Debug.info("Main Program Template running!");

  interface Config {
    liveCount: number;
    enemyCount: number;
    coinCount: number;
    playerSpeed: number;
    [key: string]: number | string | boolean | Config;
  }

  let playerLives: number;


  export let playerInvincible: boolean = false;
  
  export let enemyRot: number = 0;
  export let gameState: GameState;
  export let mapBorderHigh: number = 25;
  export let mapBorderLow: number = -25;
  export let coinCounter: number = 0;
  export let graph: ƒ.Node;
  let viewport: ƒ.Viewport;
  export let avatarNode: ƒ.Node;
  export let avatarClass: Avatar;
  let enemyClassArray: Enemy[] = [];
  export let ground: ƒ.Node;
  export let cmpAvatarRigidBody: ƒ.ComponentRigidbody;
  let cmpCamera: ƒ.ComponentCamera;
  let camTransportCmp: ƒ.ComponentTransform;
  let speedRotY: number = -0.1;
  let speedRotX: number = 0.1;
  let rotationX: number = 0;
  let rotationY: number = 0;

  
  export let environmentSound: ƒ.ComponentAudio;
  export let winMusic: ƒ.ComponentAudio;
  export let jumpSound: ƒ.ComponentAudio;
  export let collectCoinSound: ƒ.ComponentAudio;
  export let starSound: ƒ.ComponentAudio;

  export let config: Config;

  let dialog: HTMLDialogElement;

  function init(_event: Event): void {
    dialog = document.querySelector("dialog");
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
    let graph: ƒ.Graph = <ƒ.Graph>ƒ.Project.resources["Graph|2022-07-19T14:38:32.088Z|43601"];
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
    // draw viewport once for immediate feedback
    viewport.draw();
    canvas.dispatchEvent(new CustomEvent("interactiveViewportStarted", { bubbles: true, detail: viewport }));
  }

  document.addEventListener("interactiveViewportStarted", <EventListener><unknown>start);

  async function start(_event: CustomEvent): Promise<void> {
    viewport = _event.detail;

    let response: Response = await fetch("config.json");
    config = await response.json();
    playerLives = config["liveCount"];
    gameState = new GameState(playerLives, coinCounter, config["coinCount"]);

    graph = viewport.getBranch();
    avatarClass = new Avatar();
    avatarNode = graph.getChildrenByName("Avatar")[0];
    ƒ.AudioManager.default.listenWith(avatarNode.getComponent(ƒ.ComponentAudioListener));

    jumpSound = avatarNode.getChildrenByName("Sounds")[0].getComponents(ƒ.ComponentAudio)[0];
    environmentSound = avatarNode.getChildrenByName("Sounds")[0].getComponents(ƒ.ComponentAudio)[1];
    winMusic = avatarNode.getChildrenByName("Sounds")[0].getComponents(ƒ.ComponentAudio)[2];
    collectCoinSound = avatarNode.getChildrenByName("Sounds")[0].getComponents(ƒ.ComponentAudio)[3];
    starSound = avatarNode.getChildrenByName("Sounds")[0].getComponents(ƒ.ComponentAudio)[4];

    cmpAvatarRigidBody = avatarNode.getComponent(ƒ.ComponentRigidbody);
    ground = graph.getChildrenByName("Environment")[0].getChildrenByName("Ground")[0];
    cmpCamera = avatarNode.getChildrenByName("Camera")[0].getComponent(ƒ.ComponentCamera);
    camTransportCmp = avatarNode.getChildrenByName("Camera")[0].getComponent(ƒ.ComponentTransform);
    viewport.camera = cmpCamera;

    let canvas: HTMLCanvasElement = viewport.getCanvas();
    canvas.addEventListener("pointermove", hndPointerMove);
    canvas.requestPointerLock();

    for (let i: number = 1; i <= config["enemyCount"]; i++) {
      let cmpSoundEnemy: ƒ.ComponentAudio = new ƒ.ComponentAudio(graph.getChildrenByName("Sound")[0].getComponents(ƒ.ComponentAudio)[0].getAudio());
      cmpSoundEnemy.volume = 0.15;
      cmpSoundEnemy.loop = true;
      let enemy: Enemy = new Enemy();
      enemy.name = "Enemy" + i;
      enemy.addComponent(new EnemyMovement);
      enemy.addComponent(new EnemyStateMachine);
      enemy.addComponent(cmpSoundEnemy);
      enemy.getComponent(ƒ.ComponentAudio).play(true);
      enemyClassArray.push(enemy);
      graph.getChildrenByName("Entities")[0].getChildrenByName("Enemies")[0].addChild(enemy);
      
    }

    for (let i: number = 1; i <= config["coinCount"]; i++) {
      let coin: Coin = new Coin();
      graph.getChildrenByName("Collectibles")[0].getChildrenByName("Coins")[0].addChild(coin);
    }

    graph.addEventListener("playerHit", PlayerHit);
    graph.addEventListener("allCoinsCollected", CollectedAllCoins);
    graph.addEventListener("endGame", EndGame);

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start();  // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
  }

  function update(_event: Event): void {
    ƒ.Physics.simulate();  // if physics is included and used
    avatarClass.update();
    for (let i: number = 0; i < enemyClassArray.length; i++) {
      enemyClassArray[i].update();
    }
    enemyRot += 5;
    viewport.draw();
    ƒ.AudioManager.default.update();
  }

  function hndPointerMove(_event: PointerEvent): void {
    rotationY += (_event.movementX * speedRotY);
    rotationX += (_event.movementY * speedRotX);
    rotationX = Math.min(10, Math.max(-15, rotationX));
    cmpAvatarRigidBody.setRotation(new ƒ.Vector3(0, rotationY, 0));
    camTransportCmp.mtxLocal.rotation = new ƒ.Vector3((rotationX), 0, 0);
  }

  function PlayerHit(_event: CustomEvent): void {
    playerInvincible = true;
    avatarNode.getComponent(ƒ.ComponentMaterial).clrPrimary = new ƒ.Color(0.5, 0.5, 0.5, 1);
    setTimeout(() => { playerInvincible = false; avatarNode.getComponent(ƒ.ComponentMaterial).clrPrimary = new ƒ.Color(1, 1, 1, 1); }, 3000);
    if (playerLives > 1) {
      playerLives -= 1;
      gameState.lives = playerLives;
      cmpAvatarRigidBody.setPosition(new ƒ.Vector3(0,1,0));
    }
    else {
      graph.dispatchEvent(new CustomEvent("endGame", {detail: "dead"}));
    }
  }

  function CollectedAllCoins(_event: CustomEvent): void {
    environmentSound.play(false);
    winMusic.play(true);
    let doorNode: ƒ.Node = graph.getChildrenByName("Environment")[0].getChildrenByName("StarPlatform")[0].getChildrenByName("Door")[0];
    let animseq: ƒ.AnimationSequence = new ƒ.AnimationSequence();
    animseq.addKey(new ƒ.AnimationKey(0, 0));
    animseq.addKey(new ƒ.AnimationKey(8000, 5));

    let animStructure: ƒ.AnimationStructure = {
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

    let animation: ƒ.Animation = new ƒ.Animation("doorAnimation", animStructure, 60);
    let cmpAnimator: ƒ.ComponentAnimator = new ƒ.ComponentAnimator(animation, ƒ.ANIMATION_PLAYMODE.PLAYONCE, ƒ.ANIMATION_PLAYBACK.FRAMEBASED);
    cmpAnimator.scale = 1;
    doorNode.addComponent(cmpAnimator);
    cmpAnimator.activate(true);
  }

  function EndGame(_event: CustomEvent): void {
    environmentSound.play(false);
    winMusic.play(false);
    for (let i: number = 0; i < enemyClassArray.length; i++) {
      if(enemyClassArray[i].getComponent(ƒ.ComponentAudio)) {
        enemyClassArray[i].getComponent(ƒ.ComponentAudio).play(false);
      }
    }
    ƒ.Loop.removeEventListener(ƒ.EVENT.LOOP_FRAME, update);
    let canvas: HTMLCanvasElement = document.querySelector("canvas");
    canvas.style.display = "none";
    let vuiDiv: HTMLDivElement = document.querySelector("#vui");
    vuiDiv.style.display = "none";
    if (_event.detail === "win") {
      starSound.play(true);
      let winDiv: HTMLDivElement = document.querySelector("#win");
      winDiv.style.display = "block";
    }
    else if (_event.detail === "dead") {
      let deadDiv: HTMLDivElement = document.querySelector("#dead");
      deadDiv.style.display = "block";
    }
    
  }

  export function getPos(_yValue: number): ƒ.Vector3 {
    return new ƒ.Vector3(Math.floor(Math.random() * (mapBorderHigh - mapBorderLow + 1)) + mapBorderLow, _yValue, Math.floor(Math.random() * (mapBorderHigh - mapBorderLow + 1)) + mapBorderLow);
  }
}