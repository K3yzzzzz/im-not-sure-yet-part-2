import { createProp, createSensor, skybox } from './props/props'
import { props } from './main'
import { player } from './props/player'
import { despawnObj } from './props/prop_helper'
import { dark, red, orange } from './data/textures'

let count = 0

function buildWorld() {
    //? Room
    createProp({ id: 'ground', type: 'box', pos: [0, -0.3, 0], scale: [10, 0.1, 10], mass: 0, texturePath: dark.o2 })

    //? conveyor
    createProp({ id: 'conveyor_base', type: 'box', pos: [0, -0.2, 3], scale: [4, 0.2, 1.5], mass: 0, texturePath: orange.o1 })
    createProp({ id: 'conveyor_wall_1', type: 'box', pos: [0, 0, 3.8], scale: [4, 0.5, 0.1], mass: 0, texturePath: orange.o1 })
    createProp({ id: 'conveyor_wall_2', type: 'box', pos: [0, 0, 2.2], scale: [4, 0.5, 0.1], mass: 0, texturePath: orange.o1 })
    createSensor({ id: 'conveyor_belt', pos: [0, -0.21, 3], scale: [4, 0.2, 1.5], filter: ['player', `dropped_dropper_${count}`], onObjStay: (body) => { body.velocity.x = 3 } })
    createSensor({ id: 'comeback :<', pos: [3, -0.2, 3], scale: [1, 0.05, 1], filter: [`dropped_dropper_${count}`], onObjEnter: (body) => { body.position.set(-1, 2, 3); body.velocity.set(0, 0, 0) } })

    //? Kill zone
    createSensor({ id: 'kaboom_back_to_spawn', pos: [0, -3, 0], scale: [30, 0.1, 30], filter: ['player', `dropped_dropper_${count}`], onObjEnter: (body) => { body.position.set(0, 2, 0); body.velocity.set(0, 0, 0) } })

    //? world
    skybox()
    player()
}

export function dropper() {
    setTimeout(() => {

        const id = `dropped_dropper_${count}`
        console.log(id)
        const obj = createProp({ id, type: 'box', pos: [-1, 2, 3], scale: [0.3, 0.3, 0.3], texturePath: red.o1 })

        props.push(obj)
        count =+ 1

        setTimeout(() => {
            despawnObj(id)
            console.log(`despawned ${count}`)
        }, 3000)
    }, 3000)
}

export default buildWorld