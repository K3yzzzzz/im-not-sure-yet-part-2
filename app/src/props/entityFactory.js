//entityFactory.js
import * as THREE from 'three'
import { createBoxGeo, dynamicPhysicsObj, staticPhysicsObj } from './entityUtils'
import { scene, world, props } from '../main'

function createEntity({ key = {}, transform = {}, physics = {}, sensor = {}, tex } = {}) {
    //~ Set properties
    const { id = '', tags = [] } = key
    const { pos = [0, 0, 0], rot = [0, 0, 0], scale = [1, 1, 1] } = transform
    const { collider = true, mass = 0, friction = 0.3, restitution = 0.3, damping = [] } = physics
    const { filter = [], onObjEnter, onObjStay, onObjExit } = sensor

    //~ Build
    const mesh = createBoxGeo()
    mesh.position.set(...pos)
    mesh.rotation.set(...rot)
    mesh.scale.set(...scale)

    const loader = new THREE.TextureLoader()
    const texture = loader.load(tex)
    texture.colorSpace = THREE.SRGBColorSpace
    if (tex) mesh.material = new THREE.MeshStandardMaterial({ map: texture })

    const body = mass === 0
        ? staticPhysicsObj({ mesh, collider, friction, restitution })
        : dynamicPhysicsObj({ mesh, mass, collider, friction, restitution, damping })

    //~ Sensor logic
    if (onObjEnter || onObjStay || onObjExit) {
        body.isTrigger = true
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
    }

    //~ Push
    body.userData = { id, tags, type: id }

    scene.add(mesh)
    world.addBody(body)

    const prop = { id, tags, mesh, body }
    props.push(prop)
    return prop
}

export default createEntity