import {AlchemyElement} from '../Document/GameDocument'
import {BaseView} from './BaseView'

type Position = {
	x: string,
	y: string,
}

class DraggableElement implements BaseView {
	private readonly element: HTMLElement
	private offsetX = 0
	private offsetY = 0
	private isDragging = false

	constructor(
		private readonly alchemyElement: AlchemyElement,
		position?: Position,
	) {
		this.element = this.createElement(position)
		this.initDragEvents()
	}

	getComponent() {
		return this.element
	}

	private createElement(position?: Position) {
		const img = document.createElement('img')
		img.src = this.alchemyElement.image
		img.alt = this.alchemyElement.name
		const identifier = Date.now() + Math.floor(Math.random() * 1000)
		img.id = `element-${identifier}`
		img.className = 'draggable-element'
		img.setAttribute('data-alchemy-id', this.alchemyElement.id)
		img.style.position = 'absolute'
		img.style.left = position?.x ?? '0px'
		img.style.top = position?.y ?? '0px'
		img.style.width = '40px'
		img.style.height = '40px'
		return img
	}

	private initDragEvents() {
		this.element.addEventListener('mousedown', (e: MouseEvent) => {
			e.preventDefault()
			this.isDragging = true
			const rect = this.element.getBoundingClientRect()

			this.offsetX = e.clientX - rect.left
			this.offsetY = e.clientY - rect.top
			document.addEventListener('mousemove', this.onMouseMove)
			document.addEventListener('mouseup', this.onMouseUp)
		})
	}

	private onMouseMove = (e: MouseEvent) => {
		if (!this.isDragging) {
			return
		}

		const parent = this.element.closest('.elements-grid') as HTMLElement
		if (!parent) {
			return
		}
		const parentRect = parent.getBoundingClientRect()
		const elementRect = this.element.getBoundingClientRect()
		let newX = e.clientX - parentRect.left - this.offsetX
		let newY = e.clientY - parentRect.top - this.offsetY

		newX = Math.max(0, Math.min(newX, parentRect.width - elementRect.width))
		newY = Math.max(0, Math.min(newY, parentRect.height - elementRect.height))
		this.element.style.left = `${newX}px`
		this.element.style.top = `${newY}px`
	}

	private onMouseUp = () => {
		if (!this.isDragging) {
			return
		}
		this.isDragging = false
		document.removeEventListener('mousemove', this.onMouseMove)
		document.removeEventListener('mouseup', this.onMouseUp)

		const dropEvent = new CustomEvent('elementDropped', {bubbles: true, detail: {}})
		this.element.dispatchEvent(dropEvent)
	}
}

export {
	DraggableElement,
}

export type {
	Position,
}
