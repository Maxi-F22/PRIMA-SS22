namespace Script {

	export class Avatar extends ƒ.Node {
		cntWalk: ƒ.Control = new ƒ.Control("cntWalk", 6, ƒ.CONTROL_TYPE.PROPORTIONAL);
		cntStrafe: ƒ.Control = new ƒ.Control("cntWalk", 6, ƒ.CONTROL_TYPE.PROPORTIONAL);
		jumpAllowed: boolean = true;
		jumpCount: number = 0;
		jumpTimeout: ReturnType<typeof setTimeout>;
		
		constructor() {
			super("Avatar");
		}

    public controlWalk(): void {
			let inputWalk: number = ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.W], [ƒ.KEYBOARD_CODE.S]);
			let inputStrave: number = ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.A], [ƒ.KEYBOARD_CODE.D]);
			if ((inputWalk || inputStrave) && this.jumpAllowed) {
				this.cntStrafe.setInput(inputStrave);
				this.cntWalk.setInput(inputWalk);
				let velocityVector: ƒ.Vector3;
				velocityVector = new ƒ.Vector3((this.cntStrafe.getOutput() * ƒ.Loop.timeFrameGame / 15) * config["playerSpeed"], 0, (this.cntWalk.getOutput() * ƒ.Loop.timeFrameGame / 15) * config["playerSpeed"]);
				velocityVector.transform(avatarNode.mtxLocal, false);
				cmpAvatarRigidBody.setVelocity(velocityVector);
			}
			else if (!inputWalk && !inputStrave && this.jumpAllowed) {
				cmpAvatarRigidBody.setVelocity(new ƒ.Vector3(0,0,0));
			}
		}

		public controlJump(): void {
			if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.SPACE]) && this.jumpAllowed) {
				jumpSound.play(true);
				this.jumpAllowed = false;
				let impulsPower: number = 0;
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
				cmpAvatarRigidBody.applyLinearImpulse(new ƒ.Vector3(0, impulsPower, 0));
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

		private checkAvatarCollision(): void {
			cmpAvatarRigidBody.setAngularVelocity(new ƒ.Vector3(0,0,0));
			cmpAvatarRigidBody.addEventListener(ƒ.EVENT_PHYSICS.COLLISION_ENTER, (_event: ƒ.EventPhysics) => {
				if (_event.cmpRigidbody.node.name.includes("Enemy")) {
					if (_event.collisionPoint.y >= 1) {
						if (_event.cmpRigidbody.node.getParent()) {
							_event.cmpRigidbody.node.getParent().removeChild(_event.cmpRigidbody.node);
						}
					}
					else if (_event.collisionPoint.y < 1) {
						if (!playerInvincible) {
							graph.dispatchEvent(new CustomEvent("playerHit"));
						}
					}
				}
				else if (_event.cmpRigidbody.node.name.includes("Coin")) {
					if (_event.cmpRigidbody.node.getParent()) {
						collectCoinSound.play(true);
						_event.cmpRigidbody.node.getParent().removeChild(_event.cmpRigidbody.node);
						coinCounter += 1;
						gameState.coins = coinCounter;
						if (coinCounter === config["coinCount"]) {
							graph.dispatchEvent(new CustomEvent("allCoinsCollected"));
						}
					}
				}
				else if (_event.cmpRigidbody.node.name.includes("Ground") || _event.cmpRigidbody.node.name.includes("Platform")) {
					this.jumpAllowed = true;
				}
				else if (_event.cmpRigidbody.node.name.includes("Star")) {
					graph.dispatchEvent(new CustomEvent("endGame", {detail: "win"}));
				}
			});
			if (avatarNode.mtxLocal.translation.y < -10) {
				if (!playerInvincible) {
					graph.dispatchEvent(new CustomEvent("playerHit"));
				}
			}
		}

		public update(): void {
			this.controlWalk();
			this.controlJump();
			this.checkAvatarCollision();
		}
	}
}