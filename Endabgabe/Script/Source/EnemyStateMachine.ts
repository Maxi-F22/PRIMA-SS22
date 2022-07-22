namespace Script {
    import ƒAid = FudgeAid;
    export enum JOB {
        PATROL, LOOK, ATTACK
    }
    ƒ.Project.registerScriptNamespace(Script);
    export class EnemyStateMachine extends ƒAid.ComponentStateMachine<JOB> {
        public static readonly iSubclass: number = ƒ.Component.registerSubclass(EnemyStateMachine);
        private static instructions: ƒAid.StateMachineInstructions<JOB> = EnemyStateMachine.get();

        constructor() {
            super();
            this.instructions = EnemyStateMachine.instructions;

            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;

            this.addEventListener(ƒ.EVENT.COMPONENT_ADD, this.hndEvent);

        }

        private hndEvent = (_event: Event): void => {
            switch (_event.type) {
                case ƒ.EVENT.COMPONENT_ADD:
                    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, this.update);
                    this.transit(JOB.PATROL);
                    break;
            }
        }

        public static get(): ƒAid.StateMachineInstructions<JOB> {
            let setup: ƒAid.StateMachineInstructions<JOB> = new ƒAid.StateMachineInstructions();
            setup.transitDefault = EnemyStateMachine.transitDefault;
            setup.setAction(JOB.PATROL, <ƒ.General>this.actPatrol);
            setup.setAction(JOB.LOOK, <ƒ.General>this.actLook);
            setup.setAction(JOB.ATTACK, <ƒ.General>this.actAttack);

            return setup;
        }

        private static transitDefault(_machine: EnemyStateMachine): void {}

        private static actPatrol(_machine: EnemyStateMachine): void {
            if (!_machine.node.getComponent(EnemyMovement)) {
                _machine.node.addComponent(new EnemyMovement);
            }
        }

        private static actLook(_machine: EnemyStateMachine): void {
            if (_machine.node.getComponent(EnemyMovement)) {
                let cmpEnemyMovement: EnemyMovement = _machine.node.getComponent(EnemyMovement);
                _machine.node.removeComponent(cmpEnemyMovement);
            }
            let cmpEnemyRigidBody: ƒ.ComponentRigidbody = _machine.node.getComponent(ƒ.ComponentRigidbody);
            cmpEnemyRigidBody.setVelocity(new ƒ.Vector3(0,0,0));
            cmpEnemyRigidBody.setRotation(new ƒ.Vector3(-(_machine.node.mtxLocal.translation.x - avatarNode.mtxLocal.translation.x), 0, -(_machine.node.mtxLocal.translation.z - avatarNode.mtxLocal.translation.z)));
        }

        private static actAttack(_machine: EnemyStateMachine): void {
            if (_machine.node.getComponent(EnemyMovement)) {
                let cmpEnemyMovement: EnemyMovement = _machine.node.getComponent(EnemyMovement);
                _machine.node.removeComponent(cmpEnemyMovement);
            }
            let cmpEnemyRigidBody: ƒ.ComponentRigidbody = _machine.node.getComponent(ƒ.ComponentRigidbody);
            cmpEnemyRigidBody.setVelocity(new ƒ.Vector3(-(_machine.node.mtxLocal.translation.x - avatarNode.mtxLocal.translation.x), 0, -(_machine.node.mtxLocal.translation.z - avatarNode.mtxLocal.translation.z)));
        }

        private update = (_event: Event): void => {
            this.act();
        }

    }
}