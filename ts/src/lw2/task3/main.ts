import {GameDocument} from './Document/GameDocument'
import {AlchemyAppView} from './View/AlchemyAppView'

const appDocument = new GameDocument()
const view = new AlchemyAppView(appDocument)
document.querySelector('#root')?.appendChild(view.getComponent())

export {}
