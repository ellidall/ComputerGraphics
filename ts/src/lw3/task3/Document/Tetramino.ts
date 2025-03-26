enum TETRAMINO_TYPE {
	I = 'I',
	O = 'O',
	T = 'T',
	S = 'S',
	Z = 'Z',
	J = 'J',
	L = 'L',
}

type Position = {
	x: number,
	y: number,
}

class Tetramino {
	private orientation = 0
	private position: Position = {x: 0, y: 0}
	private rotations: Position[][]

	constructor(
		private readonly type: TETRAMINO_TYPE,
	) {
		this.rotations = this.initRotations(type)
		this.position = {x: 3, y: 18}
	}

	getBlocks(): Position[] {
		return this.rotations[this.orientation] ?? []
	}

	move(dx: number, dy: number): void {
		this.position.x += dx
		this.position.y += dy
	}

	rotate(): void {
		this.orientation = (this.orientation + 1) % this.rotations.length
	}

	getRotatedVersion(): Tetramino {
		const copy = new Tetramino(this.type)
		copy.setPosition({...this.position})
		copy.orientation = (this.orientation + 1) % this.rotations.length
		copy.rotations = this.rotations
		return copy
	}

	getPosition(): Position {
		return {...this.position}
	}

	setPosition(pos: Position): void {
		this.position = {...pos}
	}

	getType(): TETRAMINO_TYPE {
		return this.type
	}

	private initRotations(type: TETRAMINO_TYPE): Position[][] {
		switch (type) {
			case TETRAMINO_TYPE.I:
				return [
					[{x: -1, y: 0}, {x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}],
					[{x: 1, y: -1}, {x: 1, y: 0}, {x: 1, y: 1}, {x: 1, y: 2}],
				]
			case TETRAMINO_TYPE.O:
				return [
					[{x: 0, y: 0}, {x: 1, y: 0}, {x: 0, y: 1}, {x: 1, y: 1}],
				]
			case TETRAMINO_TYPE.T:
				return [
					[{x: -1, y: 0}, {x: 0, y: 0}, {x: 1, y: 0}, {x: 0, y: 1}],
					[{x: 0, y: -1}, {x: 0, y: 0}, {x: 0, y: 1}, {x: 1, y: 0}],
					[{x: -1, y: 0}, {x: 0, y: 0}, {x: 1, y: 0}, {x: 0, y: -1}],
					[{x: 0, y: -1}, {x: 0, y: 0}, {x: 0, y: 1}, {x: -1, y: 0}],
				]
			case TETRAMINO_TYPE.S:
				return [
					[{x: 0, y: 0}, {x: 1, y: 0}, {x: -1, y: 1}, {x: 0, y: 1}],
					[{x: 0, y: -1}, {x: 0, y: 0}, {x: 1, y: 0}, {x: 1, y: 1}],
				]
			case TETRAMINO_TYPE.Z:
				return [
					[{x: -1, y: 0}, {x: 0, y: 0}, {x: 0, y: 1}, {x: 1, y: 1}],
					[{x: 1, y: -1}, {x: 0, y: 0}, {x: 1, y: 0}, {x: 0, y: 1}],
				]
			case TETRAMINO_TYPE.J:
				return [
					[{x: -1, y: 0}, {x: -1, y: 1}, {x: 0, y: 0}, {x: 1, y: 0}],
					[{x: 0, y: -1}, {x: 0, y: 0}, {x: 0, y: 1}, {x: 1, y: 1}],
					[{x: -1, y: 0}, {x: 0, y: 0}, {x: 1, y: 0}, {x: 1, y: -1}],
					[{x: -1, y: -1}, {x: 0, y: -1}, {x: 0, y: 0}, {x: 0, y: 1}],
				]
			case TETRAMINO_TYPE.L:
				return [
					[{x: -1, y: 0}, {x: 0, y: 0}, {x: 1, y: 0}, {x: 1, y: 1}],
					[{x: 0, y: -1}, {x: 0, y: 0}, {x: 0, y: 1}, {x: 1, y: -1}],
					[{x: -1, y: -1}, {x: -1, y: 0}, {x: 0, y: 0}, {x: 1, y: 0}],
					[{x: -1, y: 1}, {x: 0, y: -1}, {x: 0, y: 0}, {x: 0, y: 1}],
				]
			default:
				return []
		}
	}
}

export type {
	Position,
}
export {
	Tetramino,
	TETRAMINO_TYPE,
}
