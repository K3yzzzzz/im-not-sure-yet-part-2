//props.js
import * as THREE from 'three'
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js'
import { createBoxGeo, createPlaneGeo, dynamicPhysicsObj, staticPhysicsObj, loadTexture } from './prop_helper'
import { scene, world, props } from '../main'

function createProp({ id, type = 'box', pos = [0, 0, 0], rot = [0, 0, 0], scale = [1, 1, 1], mass = 1, texturePath = null } = {}) {
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

    const body = mass === 0 ? staticPhysicsObj(mesh) : dynamicPhysicsObj(mesh, mass)
    body.userData = { type: id }

    console.log(`${type}----> pos: ${mesh.position.toArray()}, rot: ${mesh.rotation.toArray()}, scale: ${mesh.scale.toArray()}`)

    scene.add(mesh)
    world.addBody(body)

    const prop = { mesh, body }
    props.push(prop)

    return prop
}

function createSensor({ id, pos = [0, 0, 0], rot = [0, 0, 0], scale = [1, 1, 1], filter = ['player'], onObjEnter, onObjStay } = {}) {
    const mesh = createBoxGeo()
    mesh.position.set(...pos)
    mesh.rotation.set(...rot)
    mesh.scale.set(...scale)
    mesh.visible = true

    const body = staticPhysicsObj(mesh)
    body.isSensor = true

    const activeBodies = new Set()

    body.addEventListener('collide', (e) => {
        const hitBody = e.body
        if (!filter.length || filter.includes(hitBody.userData?.type)) {
            if (!activeBodies.has(hitBody)) {
                activeBodies.add(hitBody)
                onObjEnter?.(hitBody)
            }
        }
    })

    world.addEventListener('postStep', () => {
        for (const hitBody of activeBodies) {
            const stillColliding = world.contacts.some(contact =>
                (contact.bi === body && contact.bj === hitBody) ||
                (contact.bj === body && contact.bi === hitBody)
            )
            if (stillColliding) {
                onObjStay?.(hitBody)
            } else {
                activeBodies.delete(hitBody)
            }
        }
    })

    scene.add(mesh)
    world.addBody(body)

    const sensor = { mesh, body, type: "sensor", filter, onObjEnter, onObjStay }
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