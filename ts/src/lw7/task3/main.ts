import './index.css'
import {AppController} from './controller/AppController'

const canvas = document.createElement('canvas')
canvas.width = window.innerWidth
canvas.height = window.innerHeight
canvas.style.display = 'block'
document.body.style.margin = '0'
document.body.appendChild(canvas)

new AppController(canvas)
