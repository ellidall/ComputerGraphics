import { Block, BlockType } from '../block/Block'

class Map {
	readonly size: number
	readonly grid: Block[][]

	constructor(mapData: BlockType[][]) {
		this.size = mapData.length
		this.grid = []

		for (let z = 0; z < this.size; z++) {
			this.grid[z] = []
			for (let x = 0; x < this.size; x++) {
				const type = mapData[z]![x]
				this.grid[z]![x] = new Block(type!, x, z)
			}
		}
	}

	isMoveValid(newX: number, newZ: number): boolean {
		const gridX = Math.floor(newX);
		const gridZ = Math.floor(newZ);

		if (gridX < 0 || gridZ < 0 || gridX >= this.grid[gridZ]!.length || gridZ >= this.grid.length) {
			return false;
		}

		return this.grid[gridZ]![gridX]!.type === BlockType.Ground;
	}
}

export {
	Map,
}
