// conveyor.js
import createEntity from '../core/entityFactory'
import { applyExternalVelocity, getPlayerBody } from '../player/player'
import { orange } from '../data/textures'

function createConveyor({ conveyorId = 'conveyor_1', pos = [0, 0, 0], values = {} } = {}) {
    const [x, y, z] = pos
    const { length, launch, walls } = values

    createBase(conveyorId, x, y, z, length)
    createBelt(conveyorId, x, y, z, length, launch)

    if (walls) createWalls(conveyorId, x, y, z, length)
}

function createBase(conveyorId, x, y, z, length) {
    createEntity({
        key: { id: `${conveyorId}_base` },
        transform: { pos: [x, y + 0.05, z], scale: [1.5, 0.1, length] },
        physics: { restitution: 0, friction: 0.1 },
        paths: { texPath: orange.o2 }
    })
}

function createBelt(conveyorId, x, y, z, length, launch) {
    createEntity({
        key: { id: `${conveyorId}_belt` },
        transform: { pos: [x, y + 0.2, z], scale: [1.5, 0.2, length] },
        physics: { collider: false },
        sensor: {
            filter: (id) => id?.startsWith('mail:') || id === 'player',
            onObjStay: (body) => onBeltStay(body),
            onObjExit: (body) => onBeltExit(body, launch)
        }
    })
}

function createWalls(conveyorId, x, y, z, length) {
    createEntity({
        key: { id: `${conveyorId}_wall_l` },
        transform: { pos: [x - 0.8, y + 0.25, z], scale: [0.1, 0.5, length] },
        paths: { texPath: orange.o2 }
    })
    createEntity({
        key: { id: `${conveyorId}_wall_r` },
        transform: { pos: [x + 0.8, y + 0.25, z], scale: [0.1, 0.5, length] },
        paths: { texPath: orange.o2 }
    })
}

function onBeltStay(body) {
    if (body === getPlayerBody()) {
        applyExternalVelocity(0, -0.5, 10)
        return
    }

    body.velocity.z = 7
    body.velocity.y = -0.2
    body.angularVelocity.set(0, 0, 0)
    body.angularFactor.set(0, 1, 0)
}

function onBeltExit(body, launch) {
    if (body === getPlayerBody()) return

    body.angularFactor.set(1, 1, 1)

    if (launch) {
        const angles = Array.from({ length: 3 }, () => Math.floor(Math.random() * 30))
        body.velocity.z = 20
        body.velocity.y = 5
        body.angularVelocity.set(...angles)
    }
}

export default createConveyor