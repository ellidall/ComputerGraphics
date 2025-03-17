import {GameEvent} from '../Document/DocumentEvent'
import {ElementId, GameDocument} from '../Document/GameDocument'
import {IDocumentListener} from '../Document/IDocumentListener'
import {BaseView} from './BaseView'

class StudiedElementsView implements BaseView, IDocumentListener {
	private readonly element: HTMLElement
	private sortOrder: 'default' | 'alphabet' = 'default'

	constructor(
		private appDocument: GameDocument,
		private addElement: (element: ElementId) => void,
	) {
		this.element = this.createContainer()
		this.updateList()
		appDocument.addListener(this)
	}

	updateOnChange(event: GameEvent) {
		if (event.type === 'NEW_ELEMENT_CREATED' || event.type === 'STUDIED_ELEMENT_CREATED') {
			this.updateList()
		}
	}

	getComponent() {
		return this.element
	}

	private createContainer(): HTMLElement {
		const container = document.createElement('div')
		container.className = 'studied-elements'
		container.innerHTML = `
		      <div class="toolbar">
		        <button class="sort-btn">Sort</button>
		      </div>
		      <div class="elements-list"></div>
    	`

		container.querySelector('.sort-btn')?.addEventListener('click', () => {
			this.sortOrder = this.sortOrder === 'default' ? 'alphabet' : 'default'
			this.updateList()
		})

		return container
	}

	private updateList() {
		const list = this.element.querySelector('.elements-list')

		if (!list) {
			return
		}

		list.innerHTML = ''

		const elements = this.appDocument.listStudiedElements()
		if (this.sortOrder === 'alphabet') {
			elements.sort((a, b) =>
				this.appDocument.getElement(a).name.localeCompare(this.appDocument.getElement(b).name))
		}

		elements.forEach(elementId => {
			const element = this.createElementItem(elementId)
			list.appendChild(element)
		})
	}

	private createElementItem(elementId: string): HTMLElement {
		const element = document.createElement('div')
		element.className = 'element-item'
		element.draggable = true
		const alchemyElement = this.appDocument.getElement(elementId)
		element.innerHTML = `
			<div style="display: flex; gap: 5px; align-items: center; cursor: pointer; width: min-content">
	            <img
	                class="studied-element"
	                src="${alchemyElement.image}" 
	                alt="${alchemyElement.name}"
	            >
	            <div>${alchemyElement.name}</div>
            </div>
    	`
		element.addEventListener('click', () => this.addElement(elementId))

		return element
	}
}

export {
	StudiedElementsView,
}