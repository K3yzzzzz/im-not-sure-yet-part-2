import skybox from './props/skybox'
import player from './props/player'
import createEntity, { createModel } from './props/entityFactory'
import { createDropper, createConveyor } from './props/createProps'
import { dark, red, orange, purple } from './data/textures'

function buildWorld() {
    //? Room
    createEntity({ id: 'ground', tex: dark.o2, values: { scale: [50, 0.1, 50] } })
    createEntity({ id: 'foundation', tex: purple.o2, values: { pos: [0, 0.5, 0], scale: [13, 1, 20] } })
    createEntity({ id: 'foundation_ledge', tex: purple.o2, values: { pos: [9, 1, 0], scale: [5, 2, 20] } })

    //? Conveyor 
    createConveyor({ pos: [10, 2, 0], length: 18, launch: true, walls: true })
    createDropper({ pos: [10, 4, -8], speed: 1 })

    //? Kill zone
    createEntity({ type: { id: 'kaboom_back_to_spawn' }, values: { pos: [0, -3, 0], scale: [200, 0.1, 200] }, sensor: { isSensor: true, filter: ['player'], onObjEnter: (body) => { body.position.set(0, 6, 0); body.velocity.set(0, 0, 0) } } })

    //? World
    skybox()
    player()
}

export default buildWorld