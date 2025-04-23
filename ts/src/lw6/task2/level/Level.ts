import {Map} from '../Map'

abstract class Level {
    abstract createMap(): Map
}

export {
    Level,
}
