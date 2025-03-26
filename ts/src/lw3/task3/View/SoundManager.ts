class SoundManager {
	private sounds: {[key: string]: HTMLAudioElement} = {}

	constructor() {
		this.sounds['fix'] = new Audio('/View/sounds/fix.mp3')
		this.sounds['game_over'] = new Audio('/View/sounds/game_over.mp3')
		this.sounds['main_theme'] = new Audio('/View/sounds/main_theme.mp3')
		this.sounds['level_up'] = new Audio('/View/sounds/level_up.mp3')
		this.sounds['move'] = new Audio('/View/sounds/move.mp3')
		this.sounds['main_theme'].loop = true
	}

	play(key: string) {
		const sound = this.sounds[key]
		if (sound) {
			this.playSoundWithRetry(sound)
		}
	}

	stop(key: string) {
		const sound = this.sounds[key]
		if (sound) {
			sound.pause()
			sound.currentTime = 0
		}
	}

	private playSoundWithRetry(sound: HTMLAudioElement) {
		sound.currentTime = 0
		sound.play().catch(
			() => setTimeout(() => this.playSoundWithRetry(sound), 100),
		)
	}
}

export const soundManager = new SoundManager()
