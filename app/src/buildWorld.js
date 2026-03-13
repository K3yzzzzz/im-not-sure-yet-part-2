//buildWorld.js
import skybox from './props/skybox'
import player from './props/player'
import createEntity from './props/entityFactory'
import { createDropper, createConveyor, boxTruck } from './props/createProps'
import { dark, red, orange, purple } from './data/textures'

function buildWorld() {
    //? Room
    createEntity({ key: { id: 'ground' }, transform: { scale: [50, 0.1, 50] }, tex: dark.o2, })
    createEntity({ key: { id: 'foundation' }, transform: { pos: [0, 0.5, 0], scale: [13, 1, 20] }, tex: purple.o2 })
    createEntity({ key: { id: 'foundation_ledge' }, transform: { pos: [9, 1, 0], scale: [5, 2, 20] }, tex: purple.o2 })

    boxTruck()

    //? Conveyor 
    createConveyor({ pos: [10, 2, 0], values: { length: 18, launch: true, walls: true } })
    createDropper({ pos: [10, 4, -8], speed: 1 })

    //? Kill zone
    createEntity({
        key: { id: 'kaboom_spawn' },
        transform: { pos: [0, -3, 0], scale: [200, 0.1, 200] },
        sensor: {
            filter: ['player'],
            onObjEnter: (body) => {
                body.position.set(0, 6, 0)
                body.velocity.set(0, 0, 0)
            }
        }
    })

    //? World
    //skybox()
    player()
}

export default buildWorld