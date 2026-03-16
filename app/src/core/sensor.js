import { world } from '../main'
import { updateObjProps } from './entityUtils'

function attachSensor(body, sensor = {}) {
    const { filter, onObjEnter, onObjStay, onObjExit } = sensor

    if (!filter) return

    body.isTrigger = true
    const activeBodies = new Set()
    const filterFn = buildFilterFn(filter)

    updateObjProps(body, { transparent: true, opacity: 0 })

    body.addEventListener('collide', (e) => onCollide(e, activeBodies, filterFn, onObjEnter))
    world.addEventListener('postStep', () => onPostStep(body, activeBodies, onObjStay, onObjExit))
}

function buildFilterFn(filter) {
    if (typeof filter === 'function') return filter
    if (filter.length) return (id) => filter.includes(id)
    return () => true
}

function onCollide(e, activeBodies, filterFn, onObjEnter) {
    const hitBody = e.body
    if (!activeBodies.has(hitBody) && filterFn(hitBody.userData?.id)) {
        activeBodies.add(hitBody)
        onObjEnter?.(hitBody)
    }
}

function onPostStep(body, activeBodies, onObjStay, onObjExit) {
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
}

export default attachSensor