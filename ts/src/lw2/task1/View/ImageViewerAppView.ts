import {ImageViewerDocument} from '../Document/ImageViewerDocument'
import {ImageViewerHelpView} from './ImageViewerHelpView'
import {ImageViewerImageView} from './ImageViewerImageView'
import {ImageViewerMenuView} from './ImageViewerMenuView'

class ImageViewerAppView {
	constructor(
		readonly appDocument: ImageViewerDocument,
	) {
		const helpView = new ImageViewerHelpView()
		new ImageViewerMenuView(appDocument, helpView)
		new ImageViewerImageView(appDocument)
	}
}

export {
	ImageViewerAppView,
}