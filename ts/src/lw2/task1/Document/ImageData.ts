class ImageData {
	private readonly bitmap: ImageBitmap

	constructor(bitmap: ImageBitmap) {
		this.bitmap = bitmap
	}

	getWidth(): number {
		return this.bitmap.width
	}

	getHeight(): number {
		return this.bitmap.height
	}

	getBitmap() {
		return this.bitmap
	}
}

export {
	ImageData,
}