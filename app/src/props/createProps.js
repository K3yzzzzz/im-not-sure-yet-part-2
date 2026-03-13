//createProps.js
import createEntity from '../props/entityFactory'
import { despawnObj, getActiveMail, updateObjProps } from './entityUtils'
import { applyExternalVelocity, getPlayerBody } from '../props/player'
import { dark, red, orange, purple } from '../data/textures'


//~ Re-usable
function createDropper({ dropperId = 'dropper_1', pos = [0, 0, 0], speed = 1 } = {}) {
    //~ Create the debug indicator
    createEntity({ key: { id: dropperId }, transform: { pos: [...pos], scale: [0.2, 0.2, 0.2] }, tex: red.o1, })

    //? Get our prop then change transparency
    updateObjProps(dropperId, { transparent: true, opacity: 0.3 })

    //~ Create our mail object
    class Mail {
        constructor(dropperId, count, pos) {
            this.id = `mail:${count}`
            this.props = createEntity({ key: { id: this.id, tags: [`owner:${dropperId}`] }, transform: { pos: [...pos], scale: [0.2, 0.05, 0.4] }, physics: { mass: 1, restitution: 0, friction: 0.8 }, tex: red.o2 })
        }
    }

    let mailCount = 0

    function dropper(dropperId, spawnPos) {
        mailCount++
        const mail = new Mail(dropperId, mailCount, spawnPos)

        setTimeout(() => despawnObj(mail.id), 60000)
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

function createConveyor({ conveyorId = 'conveyor_1', pos = [0, 0, 0], values = {} }) {
    //~ Variables
    const [x, y, z] = pos
    const { length, launch, walls } = values

    //~ Build
    //? Create main conveyor
    createEntity({ key: { id: `${conveyorId}_base` }, transform: { pos: [x, y + 0.05, z], scale: [1.5, 0.1, length] }, physics: { restitution: 0, friction: 0.1 }, tex: orange.o2, })
    createEntity({
        key: { id: `${conveyorId}_belt` },
        transform: { pos: [x, y + 0.2, z], scale: [1.5, 0.2, length] },
        physics: { collider: false },
        sensor: {
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
        createEntity({ key: { id: `${conveyorId}_wall_l` }, transform: { pos: [x - 0.8, y + 0.25, z], scale: [0.1, 0.5, length] }, tex: orange.o2 })
        createEntity({ key: { id: `${conveyorId}_wall_r` }, transform: { pos: [x + 0.8, y + 0.25, z], scale: [0.1, 0.5, length] }, tex: orange.o2 })
    }
}

//~ Single use
//convert to a 3d model later
function boxTruck() {
    //~ Make box (temp)
    createEntity({ key: { id: 'box_truck_top' }, transform: { pos: [10, 4.5, 15], scale: [3.2, 0.2, 3] }, tex: purple.o2 })
    createEntity({ key: { id: 'box_truck_L' }, transform: { pos: [11.5, 3, 15], scale: [0.2, 3, 3] }, tex: purple.o2 })
    createEntity({ key: { id: 'box_truck_back' }, transform: { pos: [10, 3, 16.2], scale: [3, 3, 0.6] }, tex: purple.o2 })
    createEntity({ key: { id: 'box_truck_R' }, transform: { pos: [8.5, 3, 15], scale: [0.2, 3, 3] }, tex: purple.o2 })
    createEntity({ key: { id: 'box_truck_bottom' }, transform: { pos: [10, 1.5, 15], scale: [3.2, 0.2, 3] }, tex: purple.o2 })

    //? Door
    let mailInTruck = 0
    const maxMail = 5

    createEntity({
        key: { id: 'box_truck_oneway' },
        transform: { pos: [10, 3, 13.45], scale: [3, 3, 0.1] },
        physics: { collider: true },
        sensor: {
            filter: (id) => id?.startsWith('mail:'),
            onObjEnter: ({ userData }) => {
                mailInTruck++
                console.log(mailInTruck)

                const updatedTags = [...new Set([...userData.tags, 'inTruck'])]
                if (!userData.tags.includes('rejecting')) {
                    updateObjProps(userData.id, { tags: updatedTags })
                }

                if (mailInTruck >= maxMail) {
                    setTimeout(() => {
                        getActiveMail()
                            .filter(p => p.tags.includes('inTruck'))
                            .forEach(p => despawnObj(p.id))
                        mailInTruck = 0
                    }, 5000)
                }
            },
        }
    })
}

export { createDropper, createConveyor, boxTruck }