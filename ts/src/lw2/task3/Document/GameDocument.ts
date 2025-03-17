import combinations from '../config/combinations.json'
import elements from '../config/elements.json'
import {GameEvent} from './DocumentEvent'
import {IDocumentListener} from './IDocumentListener'

type ElementId = string

type Element = {
	id: ElementId,
	name: string,
	image: string,
}

type Combination = {
	id: ElementId,
	elements: [ElementId, ElementId],
	results: ElementId[],
}

class GameDocument {
	private listeners: IDocumentListener[] = []
	private studiedElements: Set<ElementId> = new Set(['fire', 'water', 'earth', 'air'])

	combine(firstElement: ElementId, secondElement: ElementId): string[] | undefined {
		if (!this.studiedElements.has(firstElement) || !this.studiedElements.has(secondElement)) {
			throw new Error('Cannot combine not studied elements')
		}

		const foundCombination = (combinations as Combination[]).find(combination => (
			(combination.elements[0] === firstElement && combination.elements[1] === secondElement)
			|| (combination.elements[0] === secondElement && combination.elements[1] === firstElement)
		))

		if (!foundCombination) {
			this.notifyListeners({
				type: 'INVALID_COMBINATION',
				data: {attemptedElements: [firstElement, secondElement]},
			})
			return undefined
		}

		const newNotStudiedElements: ElementId[] = []
		const newStudiedElements: ElementId[] = []
		foundCombination.results.forEach(newElement => {
			if (this.studiedElements.has(newElement)) {
				newStudiedElements.push(newElement)
			}
			else {
				newNotStudiedElements.push(newElement)
			}
			this.studiedElements.add(newElement)
		})

		if (newStudiedElements.length) {
			this.notifyListeners({
				type: 'STUDIED_ELEMENT_CREATED',
				data: {elementIds: newStudiedElements},
			})
		}

		if (newNotStudiedElements.length) {
			this.notifyListeners({
				type: 'NEW_ELEMENT_CREATED',
				data: {newElementIds: newNotStudiedElements},
			})
		}

		if (this.isAllElementsOpened()) {
			this.notifyListeners({
				type: 'ALL_ELEMENTS_OPENED',
			})
		}

		return [...newNotStudiedElements, ...newStudiedElements]
	}

	getElement(elementId: ElementId): Element {
		const element = (elements as Element[]).find(e => e.id === elementId)

		if (!element) {
			throw new Error('Element not found')
		}

		if (!this.studiedElements.has(elementId)) {
			throw new Error('Cannot get not studied element')
		}

		return element
	}

	listStudiedElements(): ElementId[] {
		return [...this.studiedElements]
	}

	addListener(listener: IDocumentListener) {
		this.listeners.push(listener)
	}

	isAllElementsOpened(): boolean {
		const allElementIds = elements.map(e => e.id)
		const differenceA_B = allElementIds.filter(id => !this.studiedElements.has(id))
		const differenceB_A = [...this.studiedElements].filter(id => !allElementIds.includes(id))
		return [...differenceA_B, ...differenceB_A].length === 0
	}

	private notifyListeners(event: GameEvent) {
		this.listeners.forEach(listener => listener.updateOnChange(event))
	}
}

export {
	GameDocument,
}

export type {
	Element as AlchemyElement,
	ElementId,
}