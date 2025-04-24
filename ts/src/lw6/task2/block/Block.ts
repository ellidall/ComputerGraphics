enum BlockType {
    Ground,
    Brick,
    Water,
    Armor,
    Ice,
    Tree,
    Base,
}

class Block {
    constructor(
        public type: BlockType,
        public x: number,
        public z: number,
    ) {
    }

    public static convertToBlockType(number: number): BlockType {
        switch (number) {
            case 0:
                return BlockType.Ground
            case 1:
                return BlockType.Brick
            case 2:
                return BlockType.Water
            case 3:
                return BlockType.Tree
            case 4:
                return BlockType.Base
            default:
                return BlockType.Ground
        }
    }
}

export {
    Block,
    BlockType,
}
