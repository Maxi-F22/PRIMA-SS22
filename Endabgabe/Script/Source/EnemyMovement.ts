namespace Script {
	ƒ.Project.registerScriptNamespace(Script);  // Register the namespace to FUDGE for serialization

	export class EnemyMovement extends ƒ.ComponentScript {
		// Register the script as component for use in the editor via drag&drop
		public static readonly iSubclass: number = ƒ.Component.registerSubclass(EnemyMovement);
		// Properties may be mutated by users in the editor via the automatically created user interface

		constructor() {
			super();

			// Don't start when running in editor
			if (ƒ.Project.mode == ƒ.MODE.EDITOR)
				return;

			// Listen to this component being added to or removed from a node
			this.addEventListener(ƒ.EVENT.COMPONENT_ADD, this.hndEvent);
      this.addEventListener(ƒ.EVENT.COMPONENT_REMOVE, this.hndEvent);
		}

		// Activate the functions of this component as response to events
		private hndEvent = (_event: Event): void => {
			switch (_event.type) {
				case ƒ.EVENT.COMPONENT_ADD:
					this.node.addEventListener(ƒ.EVENT.RENDER_PREPARE, this.addMovement);
					break;
				case ƒ.EVENT.COMPONENT_REMOVE:
					this.removeEventListener(ƒ.EVENT.COMPONENT_ADD, this.hndEvent);
					this.node.removeEventListener(ƒ.EVENT.RENDER_PREPARE, this.addMovement);
					break;
			}
		}

		private addMovement = (_event: Event): void => {
			let cmpEnemyRigid: ƒ.ComponentRigidbody = this.node.getComponent(ƒ.ComponentRigidbody);
			cmpEnemyRigid.applyForce(new ƒ.Vector3(Math.cos((enemyRot * Math.PI)/700) * 400, 0, Math.sin((enemyRot * Math.PI)/700) * 400));
		}
	}
}