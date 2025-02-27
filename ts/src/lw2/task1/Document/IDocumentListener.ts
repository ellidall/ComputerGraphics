import {ImageData} from './ImageData'

type IDocumentListener = {
	updateThisOnChange: (changedImage?: ImageData) => void,
}

export type {
	IDocumentListener,
}