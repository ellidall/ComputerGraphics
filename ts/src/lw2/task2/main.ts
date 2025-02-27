import {DrawerDocument} from './Document/DrawerDocument'
import {DrawerAppView} from './View/DrawerAppView'

class App {
	private readonly appDocument: DrawerDocument

	constructor() {
		this.appDocument = new DrawerDocument()
		new DrawerAppView(this.appDocument)
	}
}

new App()

export {
}
