import {Block, BlockType} from './Block'

class Map {
	readonly size = 15
	readonly grid: Block[][]

	constructor() {
		this.grid = []

		for (let z = 0; z < this.size; z++) {
			this.grid[z] = []
			for (let x = 0; x < this.size; x++) {
				const type = this.generateBlockType(x, z)
				this.grid[z][x] = new Block(type, x, z)
			}
		}
	}

	private generateBlockType(x: number, z: number): BlockType {
		if (z === 7 && x === 7) {
			return BlockType.Base
		}
		if ((x + z) % 5 === 0) {
			return BlockType.Brick
		}
		if ((x + z) % 7 === 0) {
			return BlockType.Water
		}
		return BlockType.Ground
	}
}

export {
	Map,
}
