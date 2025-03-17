type GameEvent =
	| {type: 'NEW_ELEMENT_CREATED', data: NewElementCreatedPayload}
	| {type: 'STUDIED_ELEMENT_CREATED', data: StudiedElementCreatedPayload}
	| {type: 'INVALID_COMBINATION', data: InvalidCombinationPayload}
	| {type: 'ALL_ELEMENTS_OPENED'}

type NewElementCreatedPayload = {
	newElementIds: string[],
}

type StudiedElementCreatedPayload = {
	elementIds: string[],
}

type InvalidCombinationPayload = {
	attemptedElements: [string, string],
}

export type {
	GameEvent,
}