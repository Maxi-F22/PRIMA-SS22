namespace Script {

	export class Coin extends ƒ.Node {
		constructor() {
			super("Coin");
			this.createCoin();
		}

		private async createCoin(): Promise<void> {
			let coinMesh: ƒ.MeshCube = new ƒ.MeshCube();
			let coinMat: ƒ.Material = new ƒ.Material("CoinMat", ƒ.ShaderGouraud, new ƒ.CoatRemissive());
			let cmpCoinMat: ƒ.ComponentMaterial = new ƒ.ComponentMaterial(coinMat);
			cmpCoinMat.clrPrimary = new ƒ.Color(1, 1, 0, 1);

			let cmpCoinRigid: ƒ.ComponentRigidbody = new ƒ.ComponentRigidbody();
			cmpCoinRigid.mass = 0;
			cmpCoinRigid.typeBody = 2;

			this.addComponent(new ƒ.ComponentMesh(coinMesh));
			this.addComponent(cmpCoinMat);
			this.addComponent(new ƒ.ComponentTransform());
			this.addComponent(cmpCoinRigid);

			this.mtxLocal.translation = getPos(Math.floor(Math.random() * (5 - 2 + 2)) + 2);
			this.mtxLocal.scale(new ƒ.Vector3(0.2, 0.5, 0.5));
			this.coinAnim();
		}

		private coinAnim(): void {
			let animseq: ƒ.AnimationSequence = new ƒ.AnimationSequence();
			animseq.addKey(new ƒ.AnimationKey(0, 0));
			animseq.addKey(new ƒ.AnimationKey(8000, 360));
	
			let animStructure: ƒ.AnimationStructure = {
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
	
			let animation: ƒ.Animation = new ƒ.Animation("coinAnimation", animStructure, 60);
			let cmpAnimator: ƒ.ComponentAnimator = new ƒ.ComponentAnimator(animation, ƒ.ANIMATION_PLAYMODE.LOOP, ƒ.ANIMATION_PLAYBACK.FRAMEBASED);
			cmpAnimator.scale = 1;
			this.addComponent(cmpAnimator);
			cmpAnimator.activate(true);
		}
	}
}