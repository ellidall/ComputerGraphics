import {Block, BlockType, convertBlockTypeToNumber} from '../block/Block'

class Map {
	readonly grid: Block[][]

	constructor(mapData: BlockType[][]) {
		this.grid = []

		for (let z = 0; z < mapData.length; z++) {
			this.grid[z] = []
			for (let x = 0; x < mapData[z]!.length; x++) {
				const type = mapData[z]![x]
				this.grid[z]![x] = new Block(type!, x, z)
			}
		}
	}

	getGrid(): Block[][] {
		return this.grid
	}

	isWall(x: number, z: number): boolean {
		const gridX = Math.floor(x)
		const gridZ = Math.floor(z)
		// console.log({gridX, gridZ})
		return convertBlockTypeToNumber(this.grid[gridZ]?.[gridX]!.type!) !== 0
	}
}

export {
	Map,
}
