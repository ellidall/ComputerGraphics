import {ScoreData, TileData} from './TetrisDocument'

type GameEvent =
	| {type: 'tetraminoFieldUpdated'}
	| {type: 'clearedLines'}
	| {type: 'nextTetramino', data: {newTiles: TileData[]}}
	| {type: 'scoreUpdated', data: ScoreData}
	| {type: 'gameOver'}
	| {type: 'someTetraminoFixed'}
	| {type: 'levelUp'}


export type {
	GameEvent,
}
