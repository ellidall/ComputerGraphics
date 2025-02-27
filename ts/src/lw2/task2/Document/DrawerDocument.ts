import {IDocumentListener} from './IDocumentListener'

class DrawerDocument {
	private readonly DEFAULT_WIDTH = 1920
	private readonly DEFAULT_HEIGHT = 1024

	private width = this.DEFAULT_WIDTH
	private height = this.DEFAULT_HEIGHT
	private imageBitmap: ImageBitmap | null = null
	private listeners: IDocumentListener[] = []

	setSize(width: number, height: number) {
		this.width = width
		this.height = height
		this.notifyListeners()
	}

	loadImage(imageBitmap: ImageBitmap) {
		this.imageBitmap = imageBitmap
		const scale = Math.min(
			this.DEFAULT_WIDTH / this.imageBitmap.width,
			this.DEFAULT_HEIGHT / this.imageBitmap.height,
		)
		const w = this.imageBitmap.width * scale
		const h = this.imageBitmap.height * scale
		this.setSize(w, h)
	}

	clear() {
		this.imageBitmap = null
		this.setSize(this.DEFAULT_WIDTH, this.DEFAULT_HEIGHT)
	}

	getWidth(): number {
		return this.width
	}

	getHeight(): number {
		return this.height
	}

	getImageBitmap(): ImageBitmap | null {
		return this.imageBitmap
	}

	addListener(listener: IDocumentListener) {
		this.listeners.push(listener)
	}

	private notifyListeners() {
		this.listeners.forEach(listener => listener.notify())
	}
}

export {DrawerDocument}