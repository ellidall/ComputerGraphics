import {ImageData} from '../Document/ImageData'
import {ImageViewerDocument} from '../Document/ImageViewerDocument'
import {ImageViewerHelpView} from './ImageViewerHelpView'

class ImageViewerMenuView {
    constructor(
        private readonly document: ImageViewerDocument,
        private readonly helpView: ImageViewerHelpView,
    ) {
        this.createUI()
    }

    private createUI() {
        const menuBar = document.createElement('div')
        menuBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: #f0f0f0;
            padding: 5px;
            z-index: 1000;
            display: flex;
            gap: 20px;
            user-select: none;
        `

        const fileBtn = document.createElement('button')
        fileBtn.textContent = 'File'
        fileBtn.onclick = () => this.handleOpen()
        menuBar.append(fileBtn)

        const helpBtn = document.createElement('button')
        helpBtn.textContent = 'Help'
        helpBtn.onclick = () => this.helpView.toggle()
        menuBar.append(helpBtn)

        document.body.append(menuBar)
    }

    private handleOpen() {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'image/png, image/jpeg, image/bmp'
        input.onchange = async () => {
            const file = input.files?.[0]
            if (file) {
                try {
                    const bitmap = await createImageBitmap(file)
                    this.document.setImage(new ImageData(bitmap))
                } catch (e) {
                    alert('Error loading image')
                }
            }
        }
        input.click()
    }
}

export {
    ImageViewerMenuView,
}