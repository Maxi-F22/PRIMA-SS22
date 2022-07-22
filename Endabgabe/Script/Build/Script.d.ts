declare namespace Script {
    class Avatar extends ƒ.Node {
        cntWalk: ƒ.Control;
        cntStrafe: ƒ.Control;
        jumpAllowed: boolean;
        jumpCount: number;
        jumpTimeout: ReturnType<typeof setTimeout>;
        constructor();
        controlWalk(): void;
        controlJump(): void;
        private checkAvatarCollision;
        update(): void;
    }
}
declare namespace Script {
    class Coin extends ƒ.Node {
        constructor();
        private createCoin;
        private coinAnim;
    }
}
declare namespace Script {
    class Enemy extends ƒ.Node {
        constructor();
        private createEnemy;
        update(): void;
        private checkForPlayer;
    }
}
declare namespace Script {
    class EnemyMovement extends ƒ.ComponentScript {
        static readonly iSubclass: number;
        constructor();
        private hndEvent;
        private addMovement;
    }
}
declare namespace Script {
    import ƒAid = FudgeAid;
    enum JOB {
        PATROL = 0,
        LOOK = 1,
        ATTACK = 2
    }
    class EnemyStateMachine extends ƒAid.ComponentStateMachine<JOB> {
        static readonly iSubclass: number;
        private static instructions;
        constructor();
        private hndEvent;
        static get(): ƒAid.StateMachineInstructions<JOB>;
        private static transitDefault;
        private static actPatrol;
        private static actLook;
        private static actAttack;
        private update;
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    class GameState extends ƒ.Mutable {
        lives: number;
        coins: number;
        maxCoins: number;
        constructor(_lives: number, _coins: number, _maxCoins: number);
        protected reduceMutator(_mutator: ƒ.Mutator): void;
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    interface Config {
        liveCount: number;
        enemyCount: number;
        coinCount: number;
        playerSpeed: number;
        [key: string]: number | string | boolean | Config;
    }
    export let playerInvincible: boolean;
    export let enemyRot: number;
    export let gameState: GameState;
    export let mapBorderHigh: number;
    export let mapBorderLow: number;
    export let coinCounter: number;
    export let graph: ƒ.Node;
    export let avatarNode: ƒ.Node;
    export let avatarClass: Avatar;
    export let ground: ƒ.Node;
    export let cmpAvatarRigidBody: ƒ.ComponentRigidbody;
    export let environmentSound: ƒ.ComponentAudio;
    export let winMusic: ƒ.ComponentAudio;
    export let jumpSound: ƒ.ComponentAudio;
    export let collectCoinSound: ƒ.ComponentAudio;
    export let starSound: ƒ.ComponentAudio;
    export let config: Config;
    export function getPos(_yValue: number): ƒ.Vector3;
    export {};
}
