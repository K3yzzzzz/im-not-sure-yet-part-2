import { createBoxGeo, dynamicPhysicsObj, staticPhysicsObj, createTexMaterial } from './entityUtils'
import { scene, world, props } from '../main'

function createEntity({ type = {}, values = {}, physics = {}, sensor = {}, texPath } = {}) {
    //~ Set properties
    const {
        id = 'default_id',
        //shape = 'box'      change when more props
    } = type

    const {
        pos = [0, 0, 0],
        rot = [0, 0, 0],
        scale = [1, 1, 1]
    } = values

    const {
        mass = 0,
        collider = true,
        friction = 0.3,
        bounce = 0.3,
        linearDamping = 0.01,
        angularDamping = 0.01
    } = physics

    const {
        isSensor = false,
        filter = [],
        onObjEnter,
        onObjStay,
        onObjExit
    } = sensor

    //~ Build
    const mesh = createBoxGeo()
    mesh.position.set(...pos)
    mesh.rotation.set(...rot)
    mesh.scale.set(...scale)

    if (texPath) mesh.material = createTexMaterial(texPath)

    const body = mass === 0
        ? staticPhysicsObj({ mesh, collider, friction, restitution: bounce })
        : dynamicPhysicsObj({ mesh, mass, collider, friction, restitution: bounce, linearDamping, angularDamping })

    body.userData = { type: id }

    //~ Sensor logic
    if (isSensor) {
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
    scene.add(mesh)
    world.addBody(body)

    const prop = { id, mesh, body, ...(isSensor && { type: 'sensor' }) }
    props.push(prop)
    return prop
}


export default createEntity