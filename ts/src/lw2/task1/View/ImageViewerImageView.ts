import {IDocumentListener} from '../Document/IDocumentListener'
import {ImageData} from '../Document/ImageData'
import {ImageViewerDocument} from '../Document/ImageViewerDocument'

class ImageViewerImageView implements IDocumentListener {
	private readonly canvas: HTMLCanvasElement
	private readonly ctx: CanvasRenderingContext2D
	private currentImage?: ImageData

	constructor(
		imageDocument: ImageViewerDocument,
	) {
		this.canvas = document.createElement('canvas')
		const ctx = this.canvas.getContext('2d')
		if (!ctx) {
			throw new Error('Cannot initialize context')
		}
		this.ctx = ctx
		this.initCanvas()
		imageDocument.addListener(this)
		window.addEventListener('resize', () => this.redraw())
	}

	notify(changedImage?: ImageData) {
		this.currentImage = changedImage
		this.redraw()
	}

	private initCanvas() {
		this.canvas.style.cssText = `
            position: fixed;
            top: 30px;
            left: 0;
            right: 0;
            bottom: 0;
        `
		document.body.append(this.canvas)
	}

	private redraw() {
		const width = window.innerWidth
		const height = window.innerHeight - 30

		this.canvas.width = width
		this.canvas.height = height

		this.ctx.fillStyle = '#ffffff'
		this.ctx.fillRect(0, 0, width, height)
		this.drawCheckerboard()

		if (this.currentImage) {
			const scale = Math.min(
				width / this.currentImage.getWidth(),
				height / this.currentImage.getHeight(),
			)
			const w = this.currentImage.getWidth() * scale
			const h = this.currentImage.getHeight() * scale
			const x = (width - w) / 2
			const y = (height - h) / 2

			this.ctx.drawImage(this.currentImage.getBitmap(), x, y, w, h)
		}
	}

	private drawCheckerboard() {
		const size = 12
		for (let y = 0; y < this.canvas.height; y += size) {
			for (let x = 0; x < this.canvas.width; x += size) {
				this.ctx.fillStyle = (Math.floor(x / size) % 2 === (Math.floor(y / size) % 2))
					? '#cccccc'
					: '#ffffff'
				this.ctx.fillRect(x, y, size, size)
			}
		}
	}
}

export {
	ImageViewerImageView,
}