import {GameEvent} from '../Document/GameEvent'
import {IDocumentListener} from '../Document/IDocumentListener'
import {Color, TetrisDocument, TileData} from '../Document/TetrisDocument'
import {Renderer} from './Renderer'

class TetraminoField implements IDocumentListener {
	private readonly boardOffsetX: number
	private readonly boardOffsetY: number
	private readonly boardWidth: number
	private readonly boardHeight: number

	private field: TileData[][] = []
	private readonly WORLD_COLOR: Color = {r: 0, g: 0, b: 0}
	private readonly BORDER_COLOR: Color = {r: 255, g: 255, b: 255}

	constructor(
		private readonly gameDocument: TetrisDocument,
		private readonly renderer: Renderer,
	) {
		gameDocument.addListener(this)
		const size = gameDocument.getSize()
		const worldWidth = size.cols + 8 // учитываем панель
		this.boardWidth = size.cols
		this.boardHeight = size.rows
		this.boardOffsetX = -worldWidth / 2
		this.boardOffsetY = -size.rows / 2
	}

	render() {
		const field = this.field
		for (let y = 0; y < field.length; y++) {
			// @ts-expect-error
			for (let x = 0; x < field[y].length; x++) {
				// @ts-expect-error
				const cell = field[y][x]
				if (cell?.tile) {
					const {color} = cell.tile
					this.renderer.drawColoredQuad({x: x + this.boardOffsetX, y: y + this.boardOffsetY}, {width: 1, height: 1}, color)
				}
			}
		}
		const currentTiles = this.gameDocument.getCurrentTetraminoTiles()
		currentTiles.forEach(tileData => {
			if (tileData.tile) {
				const {color, x, y} = tileData.tile
				this.renderer.drawColoredQuad({x: x + this.boardOffsetX, y: y + this.boardOffsetY}, {width: 1, height: 1}, color)
			}
		})
		this.drawBorders()
	}

	notify(event: GameEvent) {
		if (event.type === 'tetraminoFieldUpdated') {
			this.field = this.gameDocument.getField()
			this.render()
		}
	}

	private drawBorders() {
		this.renderer.drawBorder(this.boardOffsetX, this.boardOffsetY, this.boardWidth, this.boardHeight, this.BORDER_COLOR)
		this.renderer.drawBorder(this.boardOffsetX - 0.1, this.boardOffsetY - 0.1, this.boardWidth + 0.2, this.boardHeight + 0.2, this.WORLD_COLOR, 2)
	}
}

export {TetraminoField}
