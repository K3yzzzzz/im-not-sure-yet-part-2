//entityFactory.js
import { createBoxGeo, dynamicPhysicsObj, staticPhysicsObj, createTexMaterial } from './entityUtils'
import { scene, world, props } from '../main'

function createEntity({ key = {}, values = {}, physics = {}, sensor = {}, tex } = {}) {
    //~ Set properties
    const { id = '', tags = [] } = key
    const { pos = [0, 0, 0], rot = [0, 0, 0], scale = [1, 1, 1] } = values
    const { collider = true, mass = 0, friction = 0.3, restitution = 0.3, damping = [] } = physics
    const { filter = [], onObjEnter, onObjStay, onObjExit } = sensor

    //~ Build
    const mesh = createBoxGeo()
    mesh.position.set(...pos)
    mesh.rotation.set(...rot)
    mesh.scale.set(...scale)

    if (tex) mesh.material = createTexMaterial(tex)

    const body = mass === 0
        ? staticPhysicsObj({ mesh, collider, friction, restitution })
        : dynamicPhysicsObj({ mesh, mass, collider, friction, restitution, damping })

    //~ Sensor logic
    if (sensor.length > 0) {
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
    body.userData = { type: key }

    scene.add(mesh)
    world.addBody(body)

    const prop = { key, mesh, body }
    props.push(prop)
    return prop
}

export default createEntity