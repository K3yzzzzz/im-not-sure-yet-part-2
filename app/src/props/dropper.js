// dropper.js
import createEntity from '../core/entityFactory'
import { despawnObj, updateObjProps } from '../core/entityUtils'

function createDropper({ dropperId = 'dropper_1', pos = [0, 0, 0], speed = 1 } = {}) {
    const dropperBody = createEntity({
        key: { id: dropperId },
        transform: { pos: [...pos], scale: [0.2, 0.2, 0.2] }
    })

    updateObjProps(dropperBody, { transparent: true, opacity: 0.3 })

    let mailCount = 0
    const interval = 1000 / speed
    let then = performance.now()
    let rafId

    function spawnMail() {
        mailCount++
        const id = `mail:${mailCount}`

        const body = createEntity({
            key: { id, tags: [`owner:${dropperId}`] },
            transform: { pos: [...pos], scale: [0.2, 0.05, 0.4] },
            physics: { mass: 1, restitution: 0, friction: 0.8 }
        })

        setTimeout(() => despawnObj(body), 60000)
    }

    function animate(now) {
        const delta = now - then

        if (delta >= interval) {
            then = now - (delta % interval)
            spawnMail()
        }

        rafId = requestAnimationFrame(animate)
    }

    rafId = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(rafId)
}

export default createDropper