import {GameEvent} from './GameEvent'
import {IDocumentListener} from './IDocumentListener'
import {Tetramino, TETRAMINO_TYPE} from './Tetramino'

type Color = {
	r: number,
	g: number,
	b: number,
}

type Tile = {
	color: Color,
	x: number,
	y: number,
}

type TileData = {
	tile?: Tile,
}

enum HORIZONTAL_DIRECTION {
	LEFT = 'left',
	RIGHT = 'right',
}

enum VERTICAL_DIRECTION {
	DOWN = 'down',
}

type DIRECTION = HORIZONTAL_DIRECTION | VERTICAL_DIRECTION

type ScoreData = {
	score: number,
	level: number,
	clearedLines: number,
}

// TODO подобрать лучшее название
class TetrisDocument {
	private field: TileData[][] = []
	private currentTetramino: Tetramino = new Tetramino(TETRAMINO_TYPE.I)
	private nextTetramino: Tetramino = new Tetramino(TETRAMINO_TYPE.I)
	private listeners: IDocumentListener[] = []

	private readonly DEFAULT_SCORE = 0
	private readonly DEFAULT_LEVEL = 1
	private readonly DEFAULT_CLEARED_LINES = 0
	private readonly DEFAULT_LINES_TO_LEVEL_UP = 3
	private readonly DEFAULT_DROP_SPEED = 600//todo задать лучшее название
	private readonly MAX_DROP_SPEED = 1000//todo задать лучшее название
	private readonly DROP_ACCELERATION_PER_LEVEL = 100//todo задать лучшее название
	private readonly LINES_TO_LEVEL_UP_INCREMENT = 3
	private readonly CLEARED_LINES_BONUS_MULTYPLIER = 10//todo задать лучшее название
	private readonly BONUS_FOR_FIX = 50 //todo задать лучшее название

	private timerId?: number
	private score = this.DEFAULT_SCORE
	private level = this.DEFAULT_LEVEL
	private clearedLines = this.DEFAULT_CLEARED_LINES
	private linesToLevelUp = this.DEFAULT_LINES_TO_LEVEL_UP
	private dropSpeed = this.DEFAULT_DROP_SPEED
	private gameOver = false
	private paused = false

	constructor(
		private readonly rows: number,
		private readonly cols: number,
	) {
		this.startGame()
	}

	getSize() {
		return {
			rows: this.rows,
			cols: this.cols,
		}
	}

	addListener(listener: IDocumentListener) {
		this.listeners.push(listener)
	}

	rotateCurrentTetramino() { //todo задать tetromino
		const rotated = this.currentTetramino.getRotatedVersion()
		if (this.canRotate(rotated)) {
			this.currentTetramino.rotate()
			this.notify({type: 'tetraminoFieldUpdated'})
		}
	}

	lowerTetramino() {
		this.moveCurrentTetraminoImpl(VERTICAL_DIRECTION.DOWN)
	}

	moveCurrentTetramino(direction: HORIZONTAL_DIRECTION) {
		this.moveCurrentTetraminoImpl(direction)
	}


	getLinesToLevelUp() {
		return this.linesToLevelUp
	}

	getScoreData(): ScoreData {
		return {
			score: this.score,
			level: this.level,
			clearedLines: this.clearedLines,
		}
	}

	getNextTetraminoTiles(): TileData[] {
		return this.getTetraminoTileData(this.nextTetramino, false)
	}

	getCurrentTetraminoTiles(): TileData[] {
		return this.getTetraminoTileData(this.currentTetramino)
	}

	getField() {
		return this.field
	}

	restartGame() {
		this.startGame()
	}

	// todo вместо использования таймера внедрить интерфейс таймера, чтобы можно было управлять паузой и так далее
	pause() {
		if (this.timerId !== undefined) {
			clearTimeout(this.timerId)
			this.timerId = undefined
		}
		this.paused = true
	}

	resume() {
		if (this.paused) {
			this.paused = false
			this.gameTickHandler()
		}
	}

	private startGame() {
		if (this.timerId !== undefined) {
			clearTimeout(this.timerId)
			this.timerId = undefined
		}
		this.field = this.createEmptyField()
		this.dropSpeed = this.DEFAULT_DROP_SPEED
		this.gameOver = false
		this.currentTetramino = this.generateTetramino()
		this.nextTetramino = this.generateTetramino()
		this.notify({type: 'tetraminoFieldUpdated'})
		this.notify({type: 'nextTetramino', data: {newTiles: this.getTetraminoTileData(this.nextTetramino, false)}})
		this.updateScore(this.DEFAULT_SCORE, this.DEFAULT_LEVEL, this.DEFAULT_LINES_TO_LEVEL_UP, this.DEFAULT_CLEARED_LINES)
		this.gameTickHandler()
	}

	private gameTickHandler() {
		if (this.gameOver || this.paused) {
			return
		}
		this.lowerTetramino()
		this.timerId = window.setTimeout(() => this.gameTickHandler(), this.dropSpeed)
	}

	private isTetraminoLies() {
		for (const block of this.currentTetramino.getBlocks()) {
			const xUnderBlock = this.currentTetramino.getPosition().x + block.x
			const yUnderBlock = this.currentTetramino.getPosition().y + block.y - 1
			if (yUnderBlock < 0) {
				return true
			}
			if (this.field[yUnderBlock]?.[xUnderBlock]?.tile !== undefined) {
				return true
			}
		}
		return false
	}

	private createEmptyField(): TileData[][] {
		const field: TileData[][] = []
		for (let y = 0; y < this.rows; y++) {
			const row: TileData[] = []
			for (let x = 0; x < this.cols; x++) {
				row.push({})
			}
			field.push(row)
		}
		return field
	}

	private generateTetramino(): Tetramino {
		const types = Object.values(TETRAMINO_TYPE)
		const randomType = types[Math.floor(Math.random() * types.length)]
		if (!randomType) {
			throw new Error('Ошибка при генерации тетрамино')
		}
		return new Tetramino(randomType)
	}

	private getColorForTetramino(type: TETRAMINO_TYPE): Color {
		switch (type) {
			case TETRAMINO_TYPE.I:
				return {r: 0, g: 255, b: 255}
			case TETRAMINO_TYPE.O:
				return {r: 255, g: 255, b: 0}
			case TETRAMINO_TYPE.T:
				return {r: 128, g: 0, b: 128}
			case TETRAMINO_TYPE.S:
				return {r: 0, g: 255, b: 0}
			case TETRAMINO_TYPE.Z:
				return {r: 255, g: 0, b: 0}
			case TETRAMINO_TYPE.J:
				return {r: 0, g: 0, b: 255}
			case TETRAMINO_TYPE.L:
				return {r: 255, g: 165, b: 0}
			default:
				return {r: 255, g: 255, b: 255}
		}
	}

	private moveCurrentTetraminoImpl(direction: DIRECTION) {
		const {dx, dy} = this.parseDirection(direction)
		if (this.canMove(this.currentTetramino, dx, dy)) {
			this.currentTetramino.move(dx, dy)
			this.notify({type: 'tetraminoFieldUpdated'})
		}
		else if (this.isTetraminoLies()) {
			this.fixTetramino()
			this.spawnNextTetramino()
		}
	}

	private getTetraminoTileData(tetramino: Tetramino, withOffset = true): TileData[] {
		const blocks = tetramino.getBlocks()
		const color = this.getColorForTetramino(tetramino.getType())
		return blocks.map(block => ({
			tile: {
				color,
				x: (withOffset ? tetramino.getPosition().x : 0) + block.x,
				y: (withOffset ? tetramino.getPosition().y : 0) + block.y,
			},
		}))
	}

	private canSpawn(tetramino: Tetramino): boolean {
		for (const block of tetramino.getBlocks()) {
			const x = tetramino.getPosition().x + block.x
			const y = tetramino.getPosition().y + block.y
			if (this.field[y]?.[x]?.tile !== undefined) {
				return false
			}
		}
		return true
	}

	private canMove(tetramino: Tetramino, dx: number, dy: number): boolean {
		for (const block of tetramino.getBlocks()) {
			const newX = tetramino.getPosition().x + block.x + dx
			const newY = tetramino.getPosition().y + block.y + dy
			if (newX < 0 || newX >= this.cols || newY < 0) {
				return false
			}
			if (this.field[newY]?.[newX]?.tile !== undefined) {
				return false
			}
		}
		return true
	}

	private canRotate(rotated: Tetramino): boolean {
		for (const block of rotated.getBlocks()) {
			const x = rotated.getPosition().x + block.x
			const y = rotated.getPosition().y + block.y
			if (x < 0 || x >= this.cols || y < 0 || y >= this.rows) {
				return false
			}
			if (this.field[y]?.[x]?.tile !== undefined) {
				return false
			}
		}
		return true
	}

	private fixTetramino() {
		const tetrominoTiles = this.getTetraminoTileData(this.currentTetramino)
		tetrominoTiles.forEach(tileData => {
			if (tileData.tile) {
				const x = tileData.tile.x
				const y = tileData.tile.y
				if (this.field[y]?.[x] !== undefined) {
					// @ts-expect-error
					this.field[y][x] = {tile: tileData.tile}
				}
			}
		})
		this.updateScore(this.score + this.BONUS_FOR_FIX)
		this.notify({type: 'tetraminoFieldUpdated'})
		this.notify({type: 'someTetraminoFixed'})
		this.clearLines()
	}

	private clearLines() {
		let clearedLines = 0
		for (let y = 0; y < this.rows; y++) {
			// @ts-expect-error
			if (this.field[y].every(cell => cell.tile !== undefined)) {
				for (let row = y; row < this.rows - 1; row++) {
					// @ts-expect-error
					this.field[row] = this.field[row + 1].map(cell => ({...cell}))
				}
				this.field[this.rows - 1] = Array.from({length: this.cols}, () => ({}))
				clearedLines++
				y--
			}
		}
		if (clearedLines) {
			let points
			switch (clearedLines) {
				case 1:
					points = 10
					break
				case 2:
					points = 30
					break
				case 3:
					points = 70
					break
				case 4:
					points = 150
					break
				default:
					points = 200
			}
			this.updateScore(this.score + points, this.level, this.linesToLevelUp, this.clearedLines + clearedLines)
			this.notify({type: 'clearedLines'})
			this.notify({type: 'tetraminoFieldUpdated'})
			this.checkLevelUp()
		}
	}


	private checkLevelUp() {
		if (this.clearedLines >= this.linesToLevelUp) {
			const freeRows = this.field.reduce((count, row) => count + (row.every(cell => cell.tile === undefined) ? 1 : 0), 0)
			const bonus = freeRows * this.CLEARED_LINES_BONUS_MULTYPLIER
			this.dropSpeed = Math.max(this.MAX_DROP_SPEED, this.dropSpeed - this.DROP_ACCELERATION_PER_LEVEL)
			this.updateScore(this.score + bonus, this.level + 1, this.linesToLevelUp + this.LINES_TO_LEVEL_UP_INCREMENT, this.DEFAULT_CLEARED_LINES)
			this.notify({type: 'tetraminoFieldUpdated'})
		}
	}

	private spawnNextTetramino() {
		const currentTetramino = this.nextTetramino

		let spawned = false
		for (let yOffset = 2; yOffset > 0; yOffset--) {
			currentTetramino.setPosition({
				x: Math.floor(this.cols / 2) - 1,
				y: this.rows - yOffset,
			})
			if (this.canSpawn(currentTetramino)) {
				spawned = true
				break
			}
		}

		if (!spawned) {
			this.handleGameOver()
			return
		}

		this.currentTetramino = currentTetramino
		this.nextTetramino = this.generateTetramino()
		this.notify({type: 'nextTetramino', data: {newTiles: this.getTetraminoTileData(this.nextTetramino, false)}})
		if (!this.canMove(this.currentTetramino, 0, 0)) {
			this.handleGameOver()
		}
	}

	private parseDirection(direction: DIRECTION): ({dx: number, dy: number}) {
		let dx = 0
		let dy = 0

		switch (direction) {
			case HORIZONTAL_DIRECTION.RIGHT:
				dx = 1
				break
			case HORIZONTAL_DIRECTION.LEFT:
				dx = -1
				break
			case VERTICAL_DIRECTION.DOWN:
				dy = -1
				break
		}

		return {
			dx, dy,
		}
	}

	private handleGameOver() {
		this.gameOver = true
		this.notify({type: 'gameOver'})
	}

	private updateScore(score?: number, level?: number, linesToLevelUp?: number, clearedLines?: number) {
		if (score !== undefined) {
			this.score = score
		}
		if (level !== undefined) {
			if (level > this.level) {
				this.notify({type: 'levelUp'})
			}
			this.level = level
		}
		if (linesToLevelUp !== undefined) {
			this.linesToLevelUp = linesToLevelUp
		}
		if (clearedLines !== undefined) {
			this.clearedLines = clearedLines
		}
		this.notify({
			type: 'scoreUpdated',
			data: {score: this.score, level: this.level, clearedLines: this.clearedLines},
		})
	}

	private notify(event: GameEvent) {
		this.listeners.forEach(listener => listener.notify(event))
	}
}

export type {
	TileData,
	Color,
	ScoreData,
}

export {
	TetrisDocument,
	HORIZONTAL_DIRECTION,
}
