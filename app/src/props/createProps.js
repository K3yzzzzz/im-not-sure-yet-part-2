//createProps.js
import createEntity from '../props/entityFactory'
import { updateObjMaterial, despawnObj, getActiveMail, updateObjPhysics } from './entityUtils'
import { applyExternalVelocity, getPlayerBody } from '../props/player'
import { dark, red, orange, purple } from '../data/textures'


//~ Re-usable
function createDropper({ dropperId = 'dropper_1', pos = [0, 0, 0], speed = 1 } = {}) {
    //~ Create the debug indicator
    createEntity({ id: dropperId, tex: red.o1, values: { pos: [...pos], scale: [0.2, 0.2, 0.2] } })

    //? Get our prop then change transparency
    updateObjMaterial(dropperId, { transparent: true, opacity: 0.3 })

    //~ Create our mail object
    class Mail {
        constructor(dropperId, count, pos) {
            this.id = `mail:${count}`
            this.props = createEntity({
                id: this.id,
                tex: red.o2, 
                values: { pos: [...pos], scale: [0.2, 0.05, 0.4] }, 
                tags: { owner: dropperId }, 
                physics: { mass: 1, bounce: 0, friction: 0.8 }
            })
        }
    }

    let mailCount = 0

    function dropper(dropperId, spawnPos) {
        mailCount++
        const mail = new Mail(dropperId, mailCount, spawnPos)

        //setTimeout(() => despawnObj(mail.id), 10000)
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
        id: `${conveyorId}_belt`,
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

//~ Single use
//convert to a 3d model later
function boxTruck() {
    //~ Make box (temp)
    createEntity({ id: 'box_truck_top', tex: purple.o2, values: { pos: [10, 4.5, 15], scale: [3.2, 0.2, 3] } })
    createEntity({ id: 'box_truck_L', tex: purple.o2, values: { pos: [11.5, 3, 15], scale: [0.2, 3, 3] } })
    createEntity({ id: 'box_truck_back', tex: purple.o2, values: { pos: [10, 3, 16.2], scale: [3, 3, 0.6] } })
    createEntity({ id: 'box_truck_R', tex: purple.o2, values: { pos: [8.5, 3, 15], scale: [0.2, 3, 3] } })
    createEntity({ id: 'box_truck_bottom', tex: purple.o2, values: { pos: [10, 1.5, 15], scale: [3.2, 0.2, 3] } })

    //? Door
    let mailInTruck = 0
    const maxMail = 10

    createEntity({
        id: 'box_truck_oneway',
        values: { pos: [10, 3, 13.5], scale: [3, 3, 0.1] },
        physics: { collider: true },
        sensor: {
            isSensor: true,
            filter: (id) => id?.startsWith('mail:'),
            onObjEnter: () => {
                mailInTruck++

                if (mailInTruck >= maxMail) {
                    setTimeout(() => {
                        getActiveMail().forEach(p => despawnObj(p.id))
                        mailInTruck = 0
                    }, 2000)
                }
            },
            onObjStay: (body) => {
                if (mailInTruck <= maxMail) {
                    if (body.velocity.z < 0) {
                        body.velocity.z = 0
                    }
                    if (body.position.z < 13.5) {
                        body.position.z = 13.51
                    }
                } else {
                    body.velocity.z = 0
                }
            }
        }
    })
}

export { createDropper, createConveyor, boxTruck }