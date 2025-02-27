import {IDocumentListener} from './IDocumentListener'
import {ImageData} from './ImageData'

class ImageViewerDocument {
	private currentImage?: ImageData
	private listeners: IDocumentListener[] = []

	setImage(image: ImageData) {
		this.currentImage = image
		this.notifyListeners()
	}

	addListener(listener: IDocumentListener) {
		this.listeners.push(listener)
	}

	private notifyListeners() {
		this.listeners.forEach(listener => listener.notify(this.currentImage))
	}
}


export {
	ImageViewerDocument,
}
