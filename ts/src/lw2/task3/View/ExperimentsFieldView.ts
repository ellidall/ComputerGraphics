import {GameDocument, ElementId} from '../Document/GameDocument'
import {BaseView} from './BaseView'
import {DraggableElement, Position} from './DraggableElement'

class ExperimentsFieldView implements BaseView {
	private readonly element: HTMLElement
	private deleteZone: HTMLElement

	constructor(private appDocument: GameDocument) {
		this.deleteZone = this.createDeleteZone()
		this.element = this.createContainer()
		const grid = this.element.querySelector('.elements-grid')
		grid?.addEventListener('elementDropped', this.onElementDropped.bind(this))
	}

	addElementToField(elementId: ElementId, position?: Position) {
		const alchemyElement = this.appDocument.getElement(elementId)
		const draggable = new DraggableElement(alchemyElement, position)
		const grid = this.element.querySelector('.elements-grid')
		grid?.appendChild(draggable.getComponent())
	}

	removeElement(domId: string) {
		this.element.querySelector(`#${domId}`)?.remove()
	}

	getComponent() {
		return this.element
	}

	private createContainer(): HTMLElement {
		const container = document.createElement('div')
		container.className = 'experiments-field'
		container.innerHTML = `
      		<div
      			class="elements-grid"
      			style="position: relative; width: 100%; height: 966px;"
            >
			</div>
      		${this.deleteZone.outerHTML}
    	`
		return container
	}

	private createDeleteZone(): HTMLElement {
		const zone = document.createElement('div')
		zone.className = 'delete-zone'
		zone.innerHTML = '🗑️'
		return zone
	}

	private isIntersecting(rect1: DOMRect, rect2: DOMRect): boolean {
		return !(
			rect2.left > rect1.right
			|| rect2.right < rect1.left
			|| rect2.top > rect1.bottom
			|| rect2.bottom < rect1.top
		)
	}

	private onElementDropped(e: Event) {
		const droppedEl = e.target as HTMLElement
		const droppedRect = droppedEl.getBoundingClientRect()

		const deleteZone = this.element.querySelector('.delete-zone') as HTMLElement
		if (deleteZone) {
			const deleteRect = deleteZone.getBoundingClientRect()
			if (this.isIntersecting(droppedRect, deleteRect)) {
				this.removeElement(droppedEl.id)
				return
			}
		}

		const grid = this.element.querySelector('.elements-grid')
		if (!grid) {
			return
		}
		const draggableEls = grid.querySelectorAll('.draggable-element')
		for (const otherEl of Array.from(draggableEls)) {
			if (otherEl === droppedEl) {
				continue
			}
			const otherRect = otherEl.getBoundingClientRect()
			if (this.isIntersecting(droppedRect, otherRect)) {
				const firstAlchemyId = droppedEl.getAttribute('data-alchemy-id')
				const secondAlchemyId = otherEl.getAttribute('data-alchemy-id')
				if (firstAlchemyId && secondAlchemyId) {
					const result = this.appDocument.combine(firstAlchemyId, secondAlchemyId)
					if (result) {
						this.removeElement(droppedEl.id)
						this.removeElement(otherEl.id)
						result.forEach(newElementId => {
							this.addElementToField(
								newElementId,
								{
									x: droppedEl.style.left,
									y: droppedEl.style.top,
								},
							)
						})
					}
				}
				break
			}
		}
	}
}

export {ExperimentsFieldView}
