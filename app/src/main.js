import './index.css'

import * as THREE from 'three'
import { World } from 'cannon-es'

import Stats from 'stats.js'

import buildWorld from './world/world'
import { updatePlayer } from './world/player'

//~ Scene
export const scene = new THREE.Scene()
export const world = new World()
world.gravity.set(0, -9.82, 0)

const width = window.innerWidth, height = window.innerHeight

//? Render
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(width, height)
renderer.setAnimationLoop(animate)
document.body.appendChild(renderer.domElement)

//? Camera, lights, action
export const camera = new THREE.PerspectiveCamera(70, width / height, 0.01, 1000)
camera.position.set(0, 5, 4)

const light = new THREE.DirectionalLight(0xffffff, 1)
light.position.set(5, 10, 5)
scene.add(light)
scene.add(new THREE.AmbientLight(0xffffff, 1))

//? Debug
var stats = new Stats()
stats.showPanel(0)
document.body.appendChild(stats.dom)

//? build
buildWorld()

//~ Run
function animate() {
    stats.begin()

    updatePlayer()
    world.step(1 / 60)

    world.bodies.forEach(body => {
        if (!body.userData?.mesh) return

        const mesh = body.userData.mesh
        mesh.position.copy(body.position)
        mesh.quaternion.copy(body.quaternion)
    })
    renderer.render(scene, camera)

    stats.end()
}