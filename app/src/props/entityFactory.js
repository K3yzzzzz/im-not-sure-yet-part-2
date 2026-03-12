import { createBoxGeo, dynamicPhysicsObj, staticPhysicsObj, createTexMaterial, loadModel } from './entityUtils'
import { scene, world, props } from '../main'

function createEntity({ id, tex, values = {}, physics = {}, sensor = {} } = {}) {
    //~ Set properties
    const { pos = [0, 0, 0], rot = [0, 0, 0], scale = [1, 1, 1] } = values

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

    if (tex) mesh.material = createTexMaterial(tex)

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

async function createModel({ values = {}, paths = {} } = {}) {
    const { pos = [0, 0, 0], rot = [0, 0, 0], scale = [1, 1, 1] } = values
    const { tex = '', model = '' } = paths

    const { mesh, body } = await loadModel(model, scale)
    if (tex) mesh.traverse(c => { if (c.isMesh) c.material = createTexMaterial(tex) })
    mesh.position.set(...pos)
    mesh.rotation.set(...rot)
    mesh.scale.set(...scale)
    body.position.set(...pos)
    body.quaternion.setFromEuler(...rot)

    scene.add(mesh)
    world.addBody(body)
    return { mesh, body }
}

export { createModel }
export default createEntity