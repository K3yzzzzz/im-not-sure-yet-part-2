//buildWorld.js
import skybox from './skybox'
import player from '../world/player'
import createEntity from '../core/entityFactory'
import createConveyor from '../props/conveyor'
import createDropper from '../props/dropper'
import boxTruck from '../props/truck'

function buildWorld() {
    room()
    tycoon()
    easterEggNotes()

    //? World
    player()
}

function room() {
    createEntity({ key: { id: 'ground' }, transform: { scale: [50, 0.1, 50] } })
    createEntity({ key: { id: 'foundation' }, transform: { pos: [0, 0.5, 0], scale: [13, 1, 20] } })
    createEntity({ key: { id: 'foundation_ledge' }, transform: { pos: [9, 1, 0], scale: [5, 2, 20] } })
    createEntity({ key: { id: 'wall_F' }, transform: { pos: [11.6, 5, 0], scale: [0.2, 10, 20] } })
    createEntity({ key: { id: 'wall_L' }, transform: { pos: [1.7, 5, -10.1], scale: [20, 10, 0.2] } })
    //createEntity({ key: { id: 'wall_L' }, transform: { pos: [1.7, 5, 10.1], scale: [20, 10, 0.2] } })
    createEntity({ key: { id: 'kaboom_spawn' }, transform: { pos: [0, -3, 0], scale: [200, 0.1, 200] }, sensor: { filter: ['player'], onObjEnter: (body) => { body.position.set(0, 6, 0); body.velocity.set(0, 0, 0) } } })
}

function tycoon() {
    createConveyor({ pos: [9, 2, 0], values: { length: 18, launch: true, walls: true } })
    createDropper({ pos: [9, 4, -8], speed: 0.4 })
    boxTruck()
}

function easterEggNotes() {
    createEntity({ key: { id: 'horb' }, transform: { pos: [9.865, 2.1, -8], scale: [0.01, 0.1, 0.1], rot: [-1, 0, 0] }, paths: { texPath: '/textures/horb.jpg' } })
    createEntity({ key: { id: 'farmall' }, transform: { pos: [9.865, 2.25, -8.1], scale: [0.01, 0.1, 0.1], rot: [-5.72873, 0, 0] }, paths: { texPath: '/textures/maxresdefault.png' } })
    createEntity({ key: { id: 'pineapple' }, transform: { pos: [9.865, 2.16, -8.32], scale: [0.01, 0.1, 0.1], rot: [6.2138, 0, 0] }, paths: { texPath: '/textures/IMG_9823.jpg' } })
    createEntity({ key: { id: 'lowcolestrial' }, transform: { pos: [9.865, 2.2, -7.73], scale: [0.01, 0.1, 0.1], rot: [0.23, 0, 0] }, paths: { texPath: '/textures/IMG_2567.jpg' } })
}

export default buildWorld