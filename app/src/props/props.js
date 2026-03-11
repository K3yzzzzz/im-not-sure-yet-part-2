//props.js
import * as THREE from 'three'
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js'
import { createBoxGeo, createPlaneGeo, dynamicPhysicsObj, staticPhysicsObj, loadTexture } from './prop_helper'
import { scene, world, props } from '../main'

function createProp({ id,
    type = 'box',
    pos = [0, 0, 0],
    rot = [0, 0, 0],
    scale = [1, 1, 1],
    texturePath = null,
    mass = 1,
    collider = true,
    friction = 0.3,
    restitution = 0.3, //bouncy
    linearDamping = 0.01
} = {}) {
    const mesh = type === 'box' ? createBoxGeo() : createPlaneGeo()
    mesh.position.set(...pos)
    mesh.rotation.set(...rot)
    mesh.scale.set(...scale)

    // fix textures
    if (texturePath) {
        const texture = loadTexture(texturePath)
        texture.colorSpace = THREE.SRGBColorSpace

        mesh.material = new THREE.MeshStandardMaterial({ map: texture, side: THREE.DoubleSide })
    }

    const body = mass === 0
        ? staticPhysicsObj({ mesh: mesh, collider: collider, friction: friction, restitution: restitution })
        : dynamicPhysicsObj({ mesh: mesh, mass: mass, collider: collider, friction: friction, restitution: restitution, linearDamping: linearDamping })
    body.userData = { type: id }

    console.log(`${type}----> pos: ${mesh.position.toArray()}, rot: ${mesh.rotation.toArray()}, scale: ${mesh.scale.toArray()}, mass: ${mass}, collider: ${collider}, friction: ${friction}, restitution: ${restitution}`)

    scene.add(mesh)
    world.addBody(body)

    const prop = { id, mesh, body }
    props.push(prop)

    return prop
}

function createSensor({
    id,
    pos = [0, 0, 0],
    rot = [0, 0, 0],
    scale = [1, 1, 1],
    collider = false,
    filter = [],
    onObjEnter,
    onObjStay,
    onObjExit
} = {}) {
    const mesh = createBoxGeo()
    mesh.position.set(...pos)
    mesh.rotation.set(...rot)
    mesh.scale.set(...scale)
    mesh.visible = true

    const body = staticPhysicsObj({ mesh, collider })

    const activeBodies = new Set()

    const filterFn = typeof filter === 'function'
        ? filter
        : filter.length
            ? (type) => filter.includes(type)
            : () => true

    body.addEventListener('collide', (e) => {
        const hitBody = e.body
        if (!activeBodies.has(hitBody) && filterFn(hitBody.userData?.type)) {
            activeBodies.add(hitBody)
            onObjEnter?.(hitBody)
        }
    })

    world.addEventListener('postStep', () => {
        for (const hitBody of activeBodies) {
            const stillColliding = world.contacts.some(c =>
                (c.bi === body && c.bj === hitBody) ||
                (c.bj === body && c.bi === hitBody)
            )
            if (stillColliding) {
                onObjStay?.(hitBody)
            } else {
                activeBodies.delete(hitBody)
                onObjExit?.(hitBody)
            }
        }
    })

    scene.add(mesh)
    world.addBody(body)

    const sensor = { id, mesh, body, type: 'sensor' }
    props.push(sensor)
    return sensor
}

function skybox() {
    const hdrLoader = new HDRLoader()
    setTimeout(() => {
        hdrLoader.load('/skybox/citrus_orchard_road_puresky_4k.hdr', (texture) => {
            texture.mapping = THREE.EquirectangularReflectionMapping
            scene.background = texture
            scene.environment = texture
        })
    }, 100)
}

export { createProp, createSensor, skybox }