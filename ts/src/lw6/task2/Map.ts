import { Block, BlockType } from './Block'

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
}

export {
	Map,
}
