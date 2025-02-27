class DrawerHelpView {
	private helpPopup: HTMLDivElement
	private content: HTMLDivElement

	constructor() {
		this.helpPopup = document.createElement('div')
		this.content = document.createElement('div')
		this.createUI()
		this.setupOutsideClickHandler()
		this.hide()
	}

	toggle() {
		if (this.helpPopup.style.display === 'flex') {
			this.hide()
		}
		else {
			this.show()
		}
	}

	private show() {
		this.helpPopup.style.display = 'flex'
	}

	private hide() {
		this.helpPopup.style.display = 'none'
	}

	private createUI() {
		this.helpPopup.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 1001;
        `

		this.content.style.cssText = `
            background: white;
            padding: 20px;
            border-radius: 5px;
            max-width: 500px;
        `
		this.content.textContent = 'Информация о работе приложения'

		this.helpPopup.appendChild(this.content)
		document.body.appendChild(this.helpPopup)
	}

	private setupOutsideClickHandler() {
		this.helpPopup.addEventListener('click', event => {
			if (event.target === this.helpPopup) {
				this.hide()
			}
		})
	}
}

export {DrawerHelpView}
