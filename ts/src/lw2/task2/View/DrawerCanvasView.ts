import {DrawerDocument} from '../Document/DrawerDocument'
import {IDocumentListener} from '../Document/IDocumentListener'

class DrawerCanvasView implements IDocumentListener {
	private readonly canvas: HTMLCanvasElement
	private readonly ctx: CanvasRenderingContext2D
	private isDrawing = false
	private brashColor = '#000000'

	constructor(
		private appDocument: DrawerDocument,
	) {
		this.canvas = document.createElement('canvas')
		this.canvas.style.cssText = `
            position: fixed;
            top: 30px;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: white;
        `
		document.body.append(this.canvas)

		const ctx = this.canvas.getContext('2d')
		if (!ctx) {
			throw new Error('Canvas context not available')
		}
		this.ctx = ctx

		appDocument.addListener(this)

		this.initEventListeners()
		this.updateCanvas()
	}

	notify() {
		this.updateCanvas()
	}

	getCanvas(): HTMLCanvasElement {
		return this.canvas
	}

	setBrashColor(color: string) {
		this.brashColor = color
	}

	private initEventListeners() {
		this.canvas.addEventListener('mousedown', e => this.startDrawing(e))
		this.canvas.addEventListener('mousemove', e => this.draw(e))
		this.canvas.addEventListener('mouseup', () => this.stopDrawing())
		this.canvas.addEventListener('mouseleave', () => this.stopDrawing())
	}

	private updateCanvas() {
		this.canvas.width = this.appDocument.getWidth()
		this.canvas.height = this.appDocument.getHeight()
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

		const image = this.appDocument.getImageBitmap()
		if (image) {
			this.ctx.drawImage(image, 0, 0, this.canvas.width, this.canvas.height)
		}
	}

	private startDrawing(event: MouseEvent) {
		if (event.button !== 0) {
			return
		}
		this.isDrawing = true
		this.ctx.beginPath()
		this.ctx.moveTo(event.clientX, event.clientY - 30)
	}

	private draw(event: MouseEvent) {
		if (!this.isDrawing) {
			return
		}
		this.ctx.lineTo(event.clientX, event.clientY - 30)
		this.ctx.strokeStyle = this.brashColor
		this.ctx.lineWidth = 5
		this.ctx.lineCap = 'round'
		this.ctx.stroke()
	}

	private stopDrawing() {
		this.isDrawing = false
		this.ctx.closePath()
	}
}

export {DrawerCanvasView}