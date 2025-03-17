import {GameEvent} from './DocumentEvent'

type IDocumentListener = {
	updateOnChange: (event: GameEvent) => void,
}

export type {
	IDocumentListener,
}