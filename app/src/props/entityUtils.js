import * as THREE from 'three'
import { props } from '../main'
import { Body, Box, Vec3, Trimesh } from 'cannon-es'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

//~ Geometry Creators
function createBoxGeo() {
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshNormalMaterial({ wireframe: true })

    return new THREE.Mesh(geometry, material)
}

//~ Physics
function staticPhysicsObj({ mesh, collider, friction, restitution }) {
    const shape = new Box(new Vec3(mesh.scale.x / 2, mesh.scale.y / 2, mesh.scale.z / 2))
    const body = new Body({ shape, collisionResponse: collider, friction, restitution })
    body.position.copy(mesh.position)
    body.quaternion.setFromEuler(mesh.rotation.x, mesh.rotation.y, mesh.rotation.z, 'XYZ')
    return body
}

function dynamicPhysicsObj({ mesh, mass = 1, collider, friction, restitution, linearDamping, angularDamping }) {
    const shape = new Box(new Vec3(mesh.scale.x / 2, mesh.scale.y / 2, mesh.scale.z / 2))
    const body = new Body({ mass, shape, collisionResponse: collider, friction, restitution, linearDamping, angularDamping })
    body.position.copy(mesh.position)
    body.quaternion.setFromEuler(mesh.rotation.x, mesh.rotation.y, mesh.rotation.z, 'XYZ')
    return body
}

//~ Helpers
function createTexMaterial(path) {
    const loader = new THREE.TextureLoader()
    const texture = loader.load(path)
    texture.colorSpace = THREE.SRGBColorSpace
    return new THREE.MeshStandardMaterial({ map: texture })
}

function loadModel(modelPath, scale = [1, 1, 1]) {
    const objLoader = new OBJLoader()
    const gltfLoader = new GLTFLoader()

    function createTrimeshBody(mesh, scale = [1, 1, 1]) {
        let geometry = mesh.geometry.clone()
        if (!geometry.index) geometry = mergeVertices(geometry)

        const raw = geometry.attributes.position.array
        const vertices = []
        for (let i = 0; i < raw.length; i += 3) {
            vertices.push(raw[i] * scale[0], raw[i + 1] * scale[1], raw[i + 2] * scale[2])
        }

        const indices = Array.from(geometry.index.array)
        const trimesh = new Trimesh(vertices, indices)
        const body = new Body({ mass: 0 })
        body.addShape(trimesh)
        return body
    }


    return new Promise((resolve, reject) => {
        const ext = modelPath.split('.').pop().toLowerCase()

        if (ext === 'obj') {
            objLoader.load(modelPath, (obj) => {
                const mesh = obj.children.find(c => c.isMesh) || obj.children[0]
                const body = createTrimeshBody(mesh, scale)
                resolve({ mesh, body })
            }, undefined, reject)

        } else if (ext === 'gltf' || ext === 'glb') {
            gltfLoader.load(modelPath, (gltf) => {
                const mesh = gltf.scene
                const body = createTrimeshBody(mesh, scale)
                resolve({ mesh, body })
            }, undefined, reject)

        } else {
            reject(new Error(`Unsupported model format: .${ext}`))
        }
    })
}

function getObjById(id) {
    const obj = props.find(p => p.id === id)
    if (!obj) { console.warn(`getObjById: no prop found with id "${id}"`); return }
    return obj
}

function updateObjMaterial(id, newValues) {
    const obj = getObjById(id)

    Object.assign(obj.mesh.material, newValues)
    obj.mesh.material.needsUpdate = true
}

function updateObjValues(id, { pos, rot, scale } = {}) {
    const obj = getObjById(id)

    if (pos) obj.mesh.position.set(...pos)
    if (rot) obj.mesh.rotation.set(...rot)
    if (scale) obj.mesh.scale.set(...scale)
}

function updateObjPhysics(id, { mass, linearDamping, friction, bounce } = {}) {
    const obj = getObjById(id)

    if (mass !== undefined) obj.body.mass = mass
    if (linearDamping !== undefined) obj.body.linearDamping = linearDamping
    if (friction !== undefined) obj.body.material.friction = friction
    if (bounce !== undefined) obj.body.material.restitution = bounce

    obj.body.updateMassProperties()
}

function despawnObj(id) {
    const obj = getObjById(id)
    if (!obj) return

    if (obj.body?.world) {
        setTimeout(() => {
            obj.body.world?.removeBody(obj.body)
        }, 0)
    }

    obj.mesh?.parent?.remove(obj.mesh)
    props.splice(props.indexOf(obj), 1)
}

export { createBoxGeo, staticPhysicsObj, dynamicPhysicsObj, loadModel, createTexMaterial, updateObjMaterial, updateObjValues, updateObjPhysics, despawnObj }