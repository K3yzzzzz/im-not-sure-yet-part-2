import { updateObjMaterial, despawnObj } from './entityUtils'
import createEntity from './entityFactory'
import { dark, red, orange, purple } from '../data/textures'


function createDropper({ dropperId = 'dropper_1', pos = [0, 4, 0], speed = 1 } = {}) {
    //~ Create the debug indicator
    createEntity({ type: { id: dropperId }, values: { pos: [...pos], scale: [0.2, 0.2, 0.2] }, texPath: red.o1 })

    //? Get our prop then change transparency
    updateObjMaterial(dropperId, { transparent: true, opacity: 0.3 })

    //~ Create our mail object
    class Mail {
        constructor(dropperId, count, pos) {
            this.id = `mail:${dropperId}:${count}`
            this.props = createEntity({ type: { id: this.id }, values: { pos: [...pos], scale: [0.2, 0.05, 0.4] }, physics: { mass: 1, bounce: 0, friction: 0.8 }, texPath: red.o1 })
        }
    }

    let mailCount = 0

    function dropper(dropperId, spawnPos) {
        mailCount++
        const mail = new Mail(dropperId, mailCount, spawnPos)

        setTimeout(() => despawnObj(mail.id), 10000)
    }

    var interval = 1000 / speed
    var then = performance.now()

    //~ Animate
    function animate(now) {
        var delta = now - then

        if (delta >= interval) {
            then = now - (delta % interval)
            dropper(dropperId, pos)
        }
        requestAnimationFrame(animate)
    }

    animate(performance.now())
}

export default createDropper