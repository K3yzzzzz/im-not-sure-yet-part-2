// truck.js
import createEntity from '../core/entityFactory'
import { despawnObj, getActiveMail, updateObjProps } from '../core/entityUtils'
import { purple } from '../data/textures'

// TODO: replace geometry with a 3D model
function boxTruck() {
    buildTruckGeometry()

    const state = { mailInTruck: 0, truckFull: false, maxMail: 2 }

    attachTruckSensor(state)
    attachTruckDoor(state)
}

function buildTruckGeometry() {
    createEntity({ key: { id: 'box_truck_top' },    transform: { pos: [10, 4.5, 15],  scale: [3.2, 0.2, 3] },   paths: { texPath: purple.o2 } })
    createEntity({ key: { id: 'box_truck_L' },      transform: { pos: [11.5, 3, 15],  scale: [0.2, 3, 3] },     paths: { texPath: purple.o2 } })
    createEntity({ key: { id: 'box_truck_R' },      transform: { pos: [8.5, 3, 15],   scale: [0.2, 3, 3] },     paths: { texPath: purple.o2 } })
    createEntity({ key: { id: 'box_truck_back' },   transform: { pos: [10, 3, 16.2],  scale: [3, 3, 0.6] },     paths: { texPath: purple.o2 } })
    createEntity({ key: { id: 'box_truck_bottom' }, transform: { pos: [10, 1.5, 15],  scale: [3.2, 0.2, 3] },   paths: { texPath: purple.o2 } })
}

function attachTruckSensor(state) {
    createEntity({
        key: { id: 'box_truck_check' },
        transform: { pos: [10, 3, 15], scale: [3, 3, 2.7] },
        sensor: {
            filter: (id) => id?.startsWith('mail:'),
            onObjEnter: (body) => onMailEnter(body, state),
            onObjExit: (body) => onMailExit(body, state)
        }
    })
}

function attachTruckDoor(state) {
    createEntity({
        key: { id: 'box_truck_oneway' },
        transform: { pos: [10, 3, 13.45], scale: [3, 3, 0.1] },
        sensor: {
            filter: (id) => id?.startsWith('mail:'),
            onObjEnter: (body) => onDoorEnter(body, state)
        }
    })
}

function onMailEnter(body, state) {
    state.mailInTruck++
    updateObjProps(body, { tags: [...new Set([...body.userData.tags, 'inTruck'])] })

    if (state.mailInTruck >= state.maxMail && !state.truckFull) {
        state.truckFull = true
        setTimeout(() => dispatchTruck(state), 5000)
    }
}

function onMailExit(body, state) {
    if (body.userData.tags.includes('inTruck')) return

    state.mailInTruck--
    updateObjProps(body, { tags: body.userData.tags.filter(t => t !== 'inTruck') })
}

function onDoorEnter(body, state) {
    if (body.userData.tags.includes('inTruck')) {
        body.position.z = 14.0
        body.velocity.z = 2
        return
    }

    if (body.velocity.z <= 0 || state.truckFull || state.mailInTruck + 1 > state.maxMail) {
        body.position.z = 13.0
        body.velocity.z = -2
        body.velocity.x *= 0.3
        body.velocity.y *= 0.3
    }
}

function dispatchTruck(state) {
    getActiveMail()
        .filter(b => b.userData.tags.includes('inTruck'))
        .forEach(despawnObj)

    state.mailInTruck = 0
    state.truckFull = false
}

export default boxTruck