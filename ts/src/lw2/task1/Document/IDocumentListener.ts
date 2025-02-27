import {ImageData} from './ImageData'

type IDocumentListener = {
	notify: (changedImage?: ImageData) => void,
}

export type {
	IDocumentListener,
}