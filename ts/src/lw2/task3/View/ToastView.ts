import {GameEvent} from '../Document/DocumentEvent'
import {GameDocument} from '../Document/GameDocument'
import {IDocumentListener} from '../Document/IDocumentListener'
import {BaseView} from './BaseView'

class ToastView implements BaseView, IDocumentListener {
	private readonly element: HTMLElement

	constructor(
		private readonly appDocument: GameDocument,
	) {
		this.element = document.createElement('div')
		this.element.className = 'toast-container'
	}

	updateOnChange(event: GameEvent) {
		switch (event.type) {
			case 'NEW_ELEMENT_CREATED':
				const newNames = event.data.newElementIds
					.map(id => this.getElementName(id)).join(', ')

				if (event.data.newElementIds.length === 1) {
					this.showMessage(`Открыт новый элемент: ${newNames}!`)
				}
				else {
					this.showMessage(`Открыты новые элементы: ${newNames}!`)
				}
				this.playSound('/sounds/new_element.mp3')
				break

			case 'STUDIED_ELEMENT_CREATED':
				const existingNames = event.data.elementIds
					.map(id => this.getElementName(id)).join(', ')
				this.showMessage(`Повторное создание: ${existingNames}`)
				this.playSound('/sounds/studied_element.mp3')
				break

			case 'INVALID_COMBINATION':
				const attempted = event.data.attemptedElements
					.map(id => this.getElementName(id)).join(' + ')
				this.showMessage(`Недопустимая комбинация: ${attempted}`, 'error')
				this.playSound('/sounds/error.mp3')
				break

			case 'ALL_ELEMENTS_OPENED':
				this.showMessage(`Победа, открыты все элементы!`)
				this.playSound('/sounds/win.mp3')
				break
		}
	}

	getComponent() {
		return this.element
	}

	private showMessage(message: string, type: 'info' | 'error' = 'info') {
		const toast = document.createElement('div')
		toast.className = `toast ${type}`
		toast.textContent = message

		this.element.appendChild(toast)
		setTimeout(() => toast.remove(), 3000)
	}


	private getElementName(elementId: string): string {
		return this.appDocument.getElement(elementId).name
	}

	private playSound(soundUrl: string): void {
		const audio = new Audio(soundUrl)
		audio.play().catch(error => {
			console.error('Ошибка воспроизведения звука:', error)
		})
	}
}

export {ToastView}