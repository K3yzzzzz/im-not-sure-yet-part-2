import { createProp, skybox } from './props/props'
import { player, applyExternalVelocity, getPlayerBody } from './props/player'
import { updateObjMaterial, despawnObj } from './props/prop_helper'
import { dark, red, orange } from './data/textures'

function buildWorld() {
    //? Room
    createProp({ type: { id: 'ground' }, values: { pos: [0, -0.3, 0], scale: [30, 0.1, 30] }, physics: { mass: 0 }, texPath: dark.o2 })

    //? Conveyor
    createProp({ type: { id: 'conveyor_base' }, values: { pos: [0, -0.2, -3], scale: [7, 0.2, 1.5] }, physics: { bounce: 0, friction: 0.1 }, texPath: orange.o2 })
    createProp({ type: { id: 'conveyor_wall_1' }, values: { pos: [0, 0, -3.8], scale: [7, 0.5, 0.1] }, texPath: orange.o2 })
    createProp({ type: { id: 'conveyor_wall_2' }, values: { pos: [0, 0, -2.2], scale: [7, 0.5, 0.1] }, texPath: orange.o2 })
    createProp({ type: { id: 'conveyor_wall_3' }, values: { pos: [-3.5, 0, -3], scale: [0.1, 0.5, 1.7] }, texPath: orange.o2 })
    createProp({ type: { id: 'conveyor_belt' }, values: { pos: [0, 0, -3], scale: [7, 0.2, 1.5] }, sensor: { isSensor: true, collider: false, filter: (id) => id?.startsWith('mail:') || id === 'player', onObjStay: (body) => { if (body === getPlayerBody()) { applyExternalVelocity(10, -0.5, 0) } else { body.velocity.x = 10; body.velocity.y = -0.5 }}}})
    createDropper({ pos: [-2.5, 2, -3] })

    //? Kill zone
    createProp({ type: { id: 'kaboom_back_to_spawn' }, values: { pos: [0, -3, 0], scale: [200, 0.1, 200] }, sensor: { isSensor: true, filter: ['player'], onObjEnter: (body) => { body.position.set(0, 2, 0); body.velocity.set(0, 0, 0) } } })

    //? World
    skybox()
    player()
}

function createDropper({ dropperId = 'dropper_1', pos = [0, 2, 0] } = {}) {
    //~ Create the debug indicator
    createProp({ type: { id: dropperId }, values: { pos: [...pos], scale: [0.2, 0.2, 0.2] }, texPath: red.o1 })

    //? Get our prop then change transparency
    updateObjMaterial(dropperId, { transparent: true, opacity: 0.3 })

    //~ Create our mail object
    class Mail {
        constructor(dropperId, count, pos) {
            this.id = `mail:${dropperId}:${count}`
            this.props = createProp({ type: { id: this.id }, values: { pos: [...pos], scale: [0.4, 0.05, 0.2] }, physics: { mass: 1, bounce: 0, friction: 0.8, angularDamping: 1 }, texPath: red.o1 })
        }
    }

    let mailCount = 0

    function dropper(dropperId, spawnPos) {
        mailCount++
        const mail = new Mail(dropperId, mailCount, spawnPos)

        setTimeout(() => despawnObj(mail.id), 10000)
    }

    var rate = 1
    var interval = 1000 / rate
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

export default buildWorld