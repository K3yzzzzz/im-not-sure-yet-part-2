import createEntity from '../props/entityFactory'
import { updateObjMaterial, despawnObj } from './entityUtils'
import player, { applyExternalVelocity, getPlayerBody } from '../props/player'
import { dark, red, orange, purple } from '../data/textures'


function createDropper({ dropperId = 'dropper_1', pos = [0, 0, 0], speed = 1 } = {}) {
    //~ Create the debug indicator
    createEntity({ id: dropperId, tex: red.o1, values: { pos: [...pos], scale: [0.2, 0.2, 0.2] } })

    //? Get our prop then change transparency
    updateObjMaterial(dropperId, { transparent: true, opacity: 0.3 })

    //~ Create our mail object
    class Mail {
        constructor(dropperId, count, pos) {
            this.id = `mail:${dropperId}:${count}`
            this.props = createEntity({ id: this.id, tex: red.o2, values: { pos: [...pos], scale: [0.2, 0.05, 0.4] }, physics: { mass: 1, bounce: 0, friction: 0.8 } })
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

function createConveyor({ conveyorId = 'conveyor_1', pos = [0, 0, 0], length = 7, launch = false, walls = false }) {
    //~ Variables
    const [x, y, z] = pos

    //~ Build
    //? Create main conveyor
    createEntity({ id: `${conveyorId}_base`, tex: orange.o2, values: { pos: [x, y + 0.05, z], scale: [1.5, 0.1, length] }, physics: { bounce: 0, friction: 0.1 } })
    createEntity({
        type: { id: `${conveyorId}_belt` },
        values: { pos: [x, y + 0.2, z], scale: [1.5, 0.2, length] },
        sensor: {
            isSensor: true,
            collider: false,
            filter: (id) => id?.startsWith('mail:') || id === 'player',
            onObjStay: (body) => {
                if (body === getPlayerBody()) {
                    applyExternalVelocity(0, -0.5, 10)
                } else {
                    body.velocity.z = 7
                    body.velocity.y = -0.2
                    body.angularVelocity.set(0, 0, 0)
                    body.angularFactor.set(0, 1, 0)
                }
            },
            onObjExit: (body) => {
                if (body !== getPlayerBody()) {
                    body.angularFactor.set(1, 1, 1)
                    const angles = Array.from({ length: 3 }, () => Math.floor(Math.random() * 30))

                    if (launch) {
                        body.velocity.z = 20
                        body.velocity.y = 5
                        body.angularVelocity.set(...angles)
                    }
                }
            }
        }
    })

    //? Create walls (if enabled)
    if (walls) {
        createEntity({ id: `${conveyorId}_wall_l`, tex: orange.o2, values: { pos: [x - 0.8, y + 0.25, z], scale: [0.1, 0.5, length] } })
        createEntity({ id: `${conveyorId}_wall_r`, tex: orange.o2, values: { pos: [x + 0.8, y + 0.25, z], scale: [0.1, 0.5, length] } })
    }
}

export { createDropper, createConveyor }