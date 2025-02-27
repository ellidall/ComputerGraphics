import {ImageViewerDocument} from './Document/ImageViewerDocument'
import {ImageViewerAppView} from './View/ImageViewerAppView'

class App {
	private readonly imageDocument: ImageViewerDocument

	constructor() {
		this.imageDocument = new ImageViewerDocument()
		new ImageViewerAppView(this.imageDocument)
	}
}

new App()

export {
}
