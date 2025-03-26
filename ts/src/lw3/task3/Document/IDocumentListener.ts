import {GameEvent} from './GameEvent'

type IDocumentListener = {
	notify: (event: GameEvent) => void,
}

export type {
	IDocumentListener,
}
