import {ElementId, GameDocument} from '../Document/GameDocument'
import {BaseView} from './BaseView'
import {ExperimentsFieldView} from './ExperimentsFieldView'
import {StudiedElementsView} from './StudiedElementsView'
import {ToastView} from './ToastView'

class AlchemyAppView implements BaseView {
	private readonly element: HTMLElement
	private experimentsView: ExperimentsFieldView

	constructor(appDocument: GameDocument) {
		const studiedView = new StudiedElementsView(appDocument, element => this.addElement(element))
		this.experimentsView = new ExperimentsFieldView(appDocument)
		const toastView = new ToastView(appDocument)

		appDocument.addListener(toastView)

		this.element = document.createElement('div')
		this.element.className = 'app-container'
		this.element.innerHTML = `
      		<div class="left-panel"></div>
      		<div class="right-panel"></div>
      		<div class="toast-wrapper"></div>
    	`

		this.element.querySelector('.left-panel')?.appendChild(studiedView.getComponent())
		this.element.querySelector('.right-panel')?.appendChild(this.experimentsView.getComponent())
		this.element.querySelector('.toast-wrapper')?.appendChild(toastView.getComponent())
	}

	getComponent() {
		return this.element
	}

	private addElement(element: ElementId) {
		this.experimentsView.addElementToField(element)
	}
}

export {
	AlchemyAppView,
}