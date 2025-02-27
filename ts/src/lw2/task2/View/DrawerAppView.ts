import {DrawerDocument} from '../Document/DrawerDocument'
import {DrawerCanvasView} from './DrawerCanvasView'
import {DrawerHelpView} from './DrawerHelpView'
import {DrawerMenuView} from './DrawerMenuView'

class DrawerAppView {
	private canvasView: DrawerCanvasView

	constructor(
		readonly appDocument: DrawerDocument,
	) {
		const helpView = new DrawerHelpView()
		this.canvasView = new DrawerCanvasView(appDocument)
		new DrawerMenuView(appDocument, helpView, this.canvasView, color => this.onBrashColorChange(color))
	}

	private onBrashColorChange(color: string) {
		this.canvasView.setBrashColor(color)
	}
}

export {DrawerAppView}