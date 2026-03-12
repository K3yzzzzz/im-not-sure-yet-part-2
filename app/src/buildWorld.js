import createEntity from './props/entityFactory'
import createDropper from './props/createProps'
import skybox from './props/skybox'
import player, { applyExternalVelocity, getPlayerBody } from './props/player'
import { dark, red, orange, purple } from './data/textures'
import { despawnObj } from './props/entityUtils'

function buildWorld() {
    //? Room
    createEntity({ type: { id: 'ground' }, values: { scale: [50, 0.1, 50] }, texPath: dark.o2 })
    createEntity({ type: { id: 'foundation' }, values: { scale: [20, 2, 20] }, texPath: purple.o2 })

    //? Conveyor
    createEntity({ type: { id: 'conveyor_base' }, values: { pos: [0, 1, -3], scale: [7, 0.2, 1.5] }, physics: { bounce: 0, friction: 0.1 }, texPath: orange.o2 })
    createEntity({ type: { id: 'conveyor_wall_1' }, values: { pos: [0, 1.25, -3.8], scale: [7, 0.65, 0.1] }, texPath: orange.o2 })
    createEntity({ type: { id: 'conveyor_wall_2' }, values: { pos: [0, 1.25, -2.2], scale: [7, 0.65, 0.1] }, texPath: orange.o2 })
    createEntity({ type: { id: 'conveyor_wall_3' }, values: { pos: [-3.5, 1.25, -3], scale: [0.1, 0.65, 1.7] }, texPath: orange.o2 })
    createEntity({ type: { id: 'conveyor_belt' }, values: { pos: [0, 1.2, -3], scale: [7, 0.2, 1.5] }, sensor: { isSensor: true, collider: false, filter: (id) => id?.startsWith('mail:') || id === 'player', onObjStay: (body) => { if (body === getPlayerBody()) { applyExternalVelocity(10, -0.5, 0) } else { body.velocity.x = 7; body.velocity.y = -0.2; body.angularVelocity.set(0, 0, 0); body.angularFactor.set(0, 1, 0) } }, onObjExit: (body) => { if (body !== getPlayerBody()) body.angularFactor.set(1, 1, 1) } } })
    createDropper({ pos: [-2.5, 3, -3], speed: 1 })

    //? Kill zone
    createEntity({ type: { id: 'kaboom_back_to_spawn' }, values: { pos: [0, -3, 0], scale: [200, 0.1, 200] }, sensor: { isSensor: true, filter: ['player'], onObjEnter: (body) => { body.position.set(0, 2, 0); body.velocity.set(0, 0, 0) } } })

    //? World
    skybox()
    player({ pos: [0, 6, 0]})
}

export default buildWorld