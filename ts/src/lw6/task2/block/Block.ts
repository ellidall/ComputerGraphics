enum BlockType {
    Ground,
    Brick,
    Water,
    Armor,
    Ice,
    Tree,
    Base,
}

const convertBlockTypeToNumber = (type: BlockType): number => {
    switch (type) {
        case BlockType.Ground:
            return 0
        case BlockType.Brick:
            return 1
        case BlockType.Water:
            return 2
        case BlockType.Armor:
            return 3
        case BlockType.Ice:
            return 4
        case BlockType.Tree:
            return 5
        case BlockType.Base:
            return 6
    }
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
    convertBlockTypeToNumber,
}
