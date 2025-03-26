import {GameEvent} from '../Document/GameEvent'
import {HORIZONTAL_DIRECTION, TetrisDocument} from '../Document/TetrisDocument'
import {NextTetraminoView} from './NextTetraminoView'
import {Renderer} from './Renderer'
import {ScoreView} from './ScoreView'
import {soundManager} from './SoundManager'
import {TetraminoField} from './TetraminoField'

class TetrisGame {
	private readonly gameDocument: TetrisDocument
	private nextTetraminoView: NextTetraminoView
	private scoreView: ScoreView
	private tetraminoField: TetraminoField
	private readonly renderer: Renderer
	private overlay: HTMLDivElement
	private overlayText?: HTMLDivElement
	private overlayButton?: HTMLButtonElement
	private isGameActive = true
	private isPaused = false

	constructor(
		gl: WebGLRenderingContext,
		program: WebGLProgram,
	) {
		this.gameDocument = new TetrisDocument(20, 10)
		this.renderer = new Renderer(gl, program)
		this.nextTetraminoView = new NextTetraminoView(this.gameDocument, this.renderer)
		this.scoreView = new ScoreView(gl, this.gameDocument, this.renderer)
		this.tetraminoField = new TetraminoField(this.gameDocument, this.renderer)
		this.overlay = this.createOverlay()
		this.gameDocument.addListener(this)
		soundManager.play('main_theme')
		window.addEventListener('keydown', this.handleKeyDown)
	}

	render() {
		this.nextTetraminoView.render()
		this.scoreView.render()
		this.tetraminoField.render()
	}

	notify(event: GameEvent) {
		if (event.type === 'gameOver') {
			this.handleGameOver()
		}
		if (event.type === 'someTetraminoFixed') {
			soundManager.play('fix')
		}
	}

	private createOverlay(): HTMLDivElement {
		const overlay = document.createElement('div')
		overlay.style.position = 'fixed'
		overlay.style.top = '0'
		overlay.style.left = '0'
		overlay.style.width = '100%'
		overlay.style.height = '100%'
		overlay.style.backgroundColor = 'rgba(0,0,0,0.7)'
		overlay.style.display = 'none'
		overlay.style.flexDirection = 'column'
		overlay.style.justifyContent = 'center'
		overlay.style.alignItems = 'center'
		overlay.style.color = 'white'

		const text = document.createElement('div')
		text.style.fontSize = '48px'
		text.style.marginBottom = '20px'
		overlay.appendChild(text)
		this.overlayText = text

		const button = document.createElement('button')
		button.style.fontSize = '24px'
		overlay.appendChild(button)
		this.overlayButton = button

		document.body.appendChild(overlay)
		return overlay
	}

	private handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'p' || e.key === 'Escape') {
			this.togglePause()
			return
		}
		if (!this.isGameActive || this.isPaused) {
			return
		}

		switch (e.key) {
			case 'ArrowUp':
				this.gameDocument.rotateCurrentTetramino()
				soundManager.play('move')
				break
			case 'ArrowLeft':
				this.gameDocument.moveCurrentTetramino(HORIZONTAL_DIRECTION.LEFT)
				soundManager.play('move')
				break
			case 'ArrowRight':
				this.gameDocument.moveCurrentTetramino(HORIZONTAL_DIRECTION.RIGHT)
				soundManager.play('move')
				break
			case 'ArrowDown':
				this.gameDocument.lowerTetramino()
				soundManager.play('move')
				break
			default:
				break
		}
	}

	private togglePause() {
		if (this.isPaused) {
			this.isPaused = false
			this.overlay.style.display = 'none'
			soundManager.play('main_theme')
			this.gameDocument.resume()

		}
		else {
			this.isPaused = true
			soundManager.stop('main_theme')
			this.gameDocument.pause()
			if (this.overlayText) {
				this.overlayText.textContent = 'Paused'
			}
			if (this.overlayButton) {
				this.overlayButton.textContent = 'Resume'
				this.overlayButton.onclick = () => this.togglePause()
			}
			this.overlay.style.display = 'flex'
		}
	}

	private handleGameOver() {
		this.isGameActive = false
		soundManager.stop('main_theme')
		soundManager.play('game_over')
		if (this.overlayText) {
			this.overlayText.textContent = 'Game Over!'
		}
		if (this.overlayButton) {
			this.overlayButton.textContent = 'New Game'
			this.overlayButton.onclick = () => this.restartGame()
		}
		this.overlay.style.display = 'flex'
	}

	private restartGame() {
		this.overlay.style.display = 'none'
		this.gameDocument.restartGame()
		this.isGameActive = true
		soundManager.play('main_theme')
	}
}

export {
	TetrisGame,
}
