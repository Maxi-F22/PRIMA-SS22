declare namespace Script {
    import ƒ = FudgeCore;
    class GameState extends ƒ.Mutable {
        battery: number;
        constructor();
        protected reduceMutator(_mutator: ƒ.Mutator): void;
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    let ground: ƒ.Node;
}
declare namespace Script {
    import ƒ = FudgeCore;
    class SetToGroundMesh extends ƒ.ComponentScript {
        static readonly iSubclass: number;
        constructor();
        hndEvent: (_event: Event) => void;
        setPos: (_event: Event) => void;
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    class SlenderManMove extends ƒ.ComponentScript {
        static readonly iSubclass: number;
        private timeToChange;
        private direction;
        constructor();
        hndEvent: (_event: Event) => void;
        move: (_event: Event) => void;
    }
}
