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
}

export {
	Block,
	BlockType,
}
