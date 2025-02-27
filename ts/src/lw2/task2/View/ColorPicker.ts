class ColorPicker {
	private readonly element: HTMLInputElement

	constructor(onChange: (color: string) => void) {
		this.element = document.createElement('input')
		this.element.type = 'color'
		this.element.style.width = '50px'
		this.element.style.height = '30px'
		this.element.oninput = () => onChange(this.element.value)
	}

	getElement(): HTMLInputElement {
		return this.element
	}
}

export {ColorPicker}
