// entityFactory.js
import * as THREE from 'three'
import * as CANNON from 'cannon-es'

import { scene, world } from '../main'
import attachSensor from './entitySensor'
import geomLibrary from './geomLibrary/geomLibrary'

function createEntity({ key = {}, paths = {}, transform = {}, physics = {}, sensor = {}, geom = {} }) {
    const { id = '', tags = [] } = key
    const { texPath = '' } = paths
    const { pos = [0, 0, 0], rot = [0, 0, 0], scale = [1, 1, 1] } = transform

    const mesh = createMesh(texPath, geom)
    mesh.position.set(...pos)
    mesh.rotation.set(...rot)
    mesh.scale.set(...scale)

    const body = createPhysicsBody(mesh, physics)

    pushEntity(mesh, body, { id, tags })
    attachSensor(body, sensor)

    return body
}

function createMesh(texPath, geom = {}) {
    const { type = 'box', args = [] } = geom

    const geometry = geomLibrary[type]?.(...args) ?? geomLibrary.box()

    const material = texPath
        ? (() => {
            const texture = new THREE.TextureLoader().load(texPath)
            texture.colorSpace = THREE.SRGBColorSpace
            return new THREE.MeshStandardMaterial({ map: texture })
        })()
        : new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff })
        
    return new THREE.Mesh(geometry, material)
}

function createPhysicsBody(mesh, physics = {}) {
    const {
        mass = 0,
        collisionResponse = true,
        friction = 0.3,
        restitution = 0.3,
        linearDamping,
        angularDamping
    } = physics

    const halfExtents = new CANNON.Vec3(mesh.scale.x / 2, mesh.scale.y / 2, mesh.scale.z / 2)
    const shape = new CANNON.Box(halfExtents)
    const body = new CANNON.Body({ mass, shape, collisionResponse, friction, restitution, linearDamping, angularDamping })

    body.allowSleep = true
    body.sleepSpeedLimit = 0.1
    body.sleepTimeLimit = 1

    return body
}

function pushEntity(mesh, body, { id = '', tags = [] } = {}) {
    body.userData = { id, tags, mesh }

    body.position.copy(mesh.position)
    body.quaternion.copy(mesh.quaternion)

    scene.add(mesh)
    world.addBody(body)
}

export default createEntity