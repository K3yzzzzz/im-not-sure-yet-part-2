//main.js
import * as THREE from 'three'
import { World } from 'cannon-es'

import './styles/index.css'
import buildWorld, { dropper } from './build_world.js'
import { updatePlayer } from './props/player'

//~ Scene
export const scene = new THREE.Scene()
export const world = new World()
export const props = []

const width = window.innerWidth, height = window.innerHeight
world.gravity.set(0, -9.82, 0)

//? Render
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(width, height)
renderer.setAnimationLoop(animate)
document.body.appendChild(renderer.domElement)

//? Camera
export const camera = new THREE.PerspectiveCamera(70, width / height, 0.01, 1000)
camera.position.set(0, 5, 4)

//? Light
const light = new THREE.DirectionalLight(0xffffff, 1)
light.position.set(5, 10, 5)
scene.add(light)
scene.add(new THREE.AmbientLight(0xffffff, 1))

//? Debug
//import CannonDebugger from 'cannon-es-debugger'
// const cannonDebugger = new CannonDebugger(scene, world, { color: 0xff0000, scale: 1.02 })

import Stats from 'stats.js'
var stats = new Stats()
stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom)


//? build
buildWorld()

//~ Run
function animate(time) {
    stats.begin()

    world.step(1 / 60)
    updatePlayer()
    //dropper()
    for (const { mesh, body } of props) { if (!body) continue; mesh.position.copy(body.position); mesh.quaternion.copy(body.quaternion) }

    renderer.render(scene, camera)

    stats.end();

}