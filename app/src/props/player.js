import * as THREE from 'three'
import * as CANNON from 'cannon-es'

import { world, camera } from '../main'

const keys = {}
let isFreecam = false
let playerBody = null
let yaw = 0
let pitch = 0
const PITCH_LIMIT = Math.PI / 2 - 0.05
const externalVelocity = new THREE.Vector3()

function _makeCapsule(radius, height, mass) {
    const body = new CANNON.Body({ mass, linearDamping: 0.9, angularDamping: 1.0, fixedRotation: true })

    const cylinderHeight = height - radius * 2
    body.addShape(new CANNON.Cylinder(radius, radius, cylinderHeight, 6))
    body.addShape(new CANNON.Sphere(radius), new CANNON.Vec3(0, cylinderHeight / 2, 0))
    body.addShape(new CANNON.Sphere(radius), new CANNON.Vec3(0, -cylinderHeight / 2, 0))

    return body
}

function applyExternalVelocity(x, y, z) {
    externalVelocity.set(x, y, z)
}

function getPlayerBody() {
    return playerBody
}

function player({ pos = [0, 3, 0], height = 1.8, radius = 0.4, mass = 70 } = {}) {
    playerBody = _makeCapsule(radius, height, mass)
    playerBody.position.set(...pos)
    playerBody.userData = { type: 'player', id: 'player' }
    world.addBody(playerBody)

    camera.position.set(pos[0], pos[1] + height / 2, pos[2])

    window.addEventListener('keydown', (e) => {
        keys[e.code] = true
        if (e.code === 'KeyF') {
            isFreecam = !isFreecam
            console.log(`Freecam: ${isFreecam ? 'ON' : 'OFF'}`)
        }
    })
    window.addEventListener('keyup', (e) => { keys[e.code] = false })

    document.addEventListener('click', () => document.body.requestPointerLock())

    document.addEventListener('mousemove', (e) => {
        if (document.pointerLockElement !== document.body) return
        const sensitivity = 0.002
        yaw -= e.movementX * sensitivity
        pitch -= e.movementY * sensitivity
        pitch = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, pitch))
    })

    console.log('Player created → pos:', pos, '| F = freecam toggle')
}

function updatePlayer() {
    if (!playerBody) return
    isFreecam ? _updateFreecam() : _updateFPS()
}

function _updateFPS() {
    const forward = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw))
    const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw))
    const move = new THREE.Vector3()

    if (keys['KeyW']) move.add(forward)
    if (keys['KeyS']) move.sub(forward)
    if (keys['KeyA']) move.sub(right)
    if (keys['KeyD']) move.add(right)

    if (move.lengthSq() > 0) {
        move.normalize()
        playerBody.velocity.x = move.x * 8 + externalVelocity.x
        playerBody.velocity.z = move.z * 8 + externalVelocity.z
    } else {
        playerBody.velocity.x = externalVelocity.x
        playerBody.velocity.z = externalVelocity.z
    }

    if (externalVelocity.y !== 0) {
        playerBody.velocity.y += externalVelocity.y
    }

    externalVelocity.multiplyScalar(0.85)

    if (keys['Space'] && Math.abs(playerBody.velocity.y) < 0.5) {
        playerBody.velocity.y = 7
        keys['Space'] = false
    }

    camera.position.set(
        playerBody.position.x,
        playerBody.position.y + 0.5,
        playerBody.position.z
    )
    camera.quaternion.setFromEuler(new THREE.Euler(pitch, yaw, 0, 'YXZ'))
}

function _updateFreecam() {
    const dir = new THREE.Vector3()

    if (keys['KeyW']) dir.z -= 1
    if (keys['KeyS']) dir.z += 1
    if (keys['KeyA']) dir.x -= 1
    if (keys['KeyD']) dir.x += 1

    if (dir.lengthSq() > 0) {
        dir.applyEuler(new THREE.Euler(pitch, yaw, 0, 'YXZ')).normalize().multiplyScalar(0.15)
        camera.position.add(dir)
    }

    camera.quaternion.setFromEuler(new THREE.Euler(pitch, yaw, 0, 'YXZ'))
}

export default player 
export { updatePlayer, applyExternalVelocity, getPlayerBody }