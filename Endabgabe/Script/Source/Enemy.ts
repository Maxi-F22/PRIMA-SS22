namespace Script {

	export class Enemy extends ƒ.Node {
		constructor() {
			super("Enemy");
			this.createEnemy();
		}

		private async createEnemy(): Promise<void> {
			let enemyMesh: ƒ.MeshCube = new ƒ.MeshCube();
			let enemyMat: ƒ.Material = new ƒ.Material("EnemyMat", ƒ.ShaderGouraud, new ƒ.CoatRemissive());
			let cmpEnemyMat: ƒ.ComponentMaterial = new ƒ.ComponentMaterial(enemyMat);
			cmpEnemyMat.clrPrimary = new ƒ.Color(0.6, 0.3, 0.1, 1);

			let cmpEnemyRigid: ƒ.ComponentRigidbody = new ƒ.ComponentRigidbody();
			cmpEnemyRigid.mass = 100;

			this.addComponent(new ƒ.ComponentMesh(enemyMesh));
			this.addComponent(cmpEnemyMat);
			this.addComponent(new ƒ.ComponentTransform());
			this.addComponent(cmpEnemyRigid);

			this.mtxLocal.translation = getPos(1);
		}

		public update(): void {
			this.checkForPlayer();
		}

		private checkForPlayer(): void {
			if (this.mtxLocal.translation.getDistance(avatarNode.mtxLocal.translation) <= 10 && this.mtxLocal.translation.getDistance(avatarNode.mtxLocal.translation) > 5) {
				this.getComponent(EnemyStateMachine).transit(JOB.LOOK);
			}
			else if (this.mtxLocal.translation.getDistance(avatarNode.mtxLocal.translation) <= 5) {
				this.getComponent(EnemyStateMachine).transit(JOB.ATTACK);
			}
			else {
				this.getComponent(EnemyStateMachine).transit(JOB.PATROL);
			}
		}
	}
}