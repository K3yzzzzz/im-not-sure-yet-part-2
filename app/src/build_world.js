import { createProp, createSensor, skybox } from './props/props'
import { props } from './main'
import { player } from './props/player'
import { despawnObj } from './props/prop_helper'
import { dark, red, orange } from './data/textures'

function buildWorld() {
    //? Room
    createProp({ id: 'ground', type: 'box', pos: [0, -0.3, 0], scale: [30, 0.1, 30], mass: 0, texturePath: dark.o2 })

    //? conveyor
    createProp({ id: 'conveyor_base', type: 'box', pos: [0, -0.2, -3], scale: [7, 0.2, 1.5], mass: 0, texturePath: orange.o1 })
    createProp({ id: 'conveyor_wall_1', type: 'box', pos: [0, 0, -3.8], scale: [7, 0.5, 0.1], mass: 0, texturePath: orange.o1 })
    createProp({ id: 'conveyor_wall_2', type: 'box', pos: [0, 0, -2.2], scale: [7, 0.5, 0.1], mass: 0, texturePath: orange.o1 })
    createProp({ id: 'conveyor_wall_3', type: 'box', pos: [-3.5, 0, -3], scale: [0.1, 0.5, 1.7], mass: 0, texturePath: orange.o1 })
    createSensor({ id: 'conveyor_belt', pos: [0, 0, -3], scale: [7, 0.2, 1.5], filter: (id) => id.startsWith('mail:'), onObjStay: (body) => { body.velocity.x = 10 } })
    createDropper({ pos: [-2.5, 2, -3] })

    //? Kill zone
    createSensor({ id: 'kaboom_back_to_spawn', pos: [0, -3, 0], scale: [200, 0.1, 200], filter: ['player'], onObjEnter: (body) => { body.position.set(0, 2, 0); body.velocity.set(0, 0, 0) } })

    //? world
    skybox()
    player()
}

function createDropper({ dropperId = 'dropper_1', pos = [0, 2, 0] } = {}) {
    //~ Create the debug indicator
    createProp({ id: dropperId, type: 'box', pos: [...pos], scale: [0.2, 0.2, 0.2], mass: 0, texturePath: red.o1 })

    //? Get our prop then change transparency
    const index = props.findIndex(p => p.id === dropperId)
    const { mesh } = props[index]
    mesh.material.transparent = true
    mesh.material.opacity = 0.3

    //~ Create our mail object
    class Mail {
        constructor(dropperId, count, pos) {
            this.id = `mail:${dropperId}:${count}`
            this.props = createProp({
                id: this.id,
                type: 'box',
                pos: [...pos],
                scale: [0.4, 0.05, 0.2],
                texturePath: red.o1,
                restitution: 0.0,
                friction: 0.0,
                linearDamping: 0.9
            });
        }
    }

    let mailCount = 0

    function dropper(dropperId, spawnPos) {
        mailCount++
        const mail = new Mail(dropperId, mailCount, spawnPos)

        //? Despawn object
        setTimeout(() => {
            despawnObj(mail.id)
        }, 10000)
    }

    var rate = 1 // rate = 0.2 -> 5000ms orrr rate = 1 -> 1/s
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

    animate(performance.now());
}

export default buildWorld