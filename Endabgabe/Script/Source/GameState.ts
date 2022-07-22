namespace Script {
  import ƒ = FudgeCore;
  import ƒUi = FudgeUserInterface;

  export class GameState extends ƒ.Mutable {
    public lives: number = 0;
    public coins: number = 0;
    public maxCoins: number = 0;

    public constructor(_lives: number, _coins: number, _maxCoins: number) {
      super();
      let domVui: HTMLDivElement = document.querySelector("div#vui");
      domVui.style.display = "block";
      console.log(new ƒUi.Controller(this, domVui));
      this.lives = _lives;
      this.coins = _coins;
      this.maxCoins = _maxCoins;
    }

    protected reduceMutator(_mutator: ƒ.Mutator): void { /* */ }
  }
}