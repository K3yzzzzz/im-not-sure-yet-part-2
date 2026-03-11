//prop_helper.js
import * as THREE from 'three'
import { props } from '../main'
import { Body, Box, Plane, Vec3 } from 'cannon-es'

const debug = true

//~ Geometry Creators
function createBoxGeo() {
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshNormalMaterial({ wireframe: debug })

    return new THREE.Mesh(geometry, material)
}

function createPlaneGeo() {
    const geometry = new THREE.PlaneGeometry(1, 1)
    const material = new THREE.MeshNormalMaterial({ side: THREE.DoubleSide, wireframe: debug })

    return new THREE.Mesh(geometry, material)
}

//~ Physics
function staticPhysicsObj({mesh, collider, friction, restitution, linearDamping}) {
    const shape = mesh.geometry.type === 'PlaneGeometry'
        ? new Plane()
        : new Box(new Vec3(mesh.scale.x / 2, mesh.scale.y / 2, mesh.scale.z / 2))
    const body = new Body({ shape: shape, collisionResponse: collider, friction: friction, restitution: restitution })
    body.position.copy(mesh.position)
    body.quaternion.setFromEuler(mesh.rotation.x, mesh.rotation.y, mesh.rotation.z, 'XYZ')
    return body
}

function dynamicPhysicsObj({mesh, mass = 1, collider, friction, restitution, linearDamping}) {
    const shape = new Box(new Vec3(mesh.scale.x / 2, mesh.scale.y / 2, mesh.scale.z / 2))
    const body = new Body({ mass, shape: shape, collisionResponse: collider, friction: friction, restitution: restitution, linearDamping: linearDamping })
    body.position.copy(mesh.position)
    body.quaternion.setFromEuler(...mesh.rotation.toArray())
    return body
}

//~ Helpers
function loadTexture(path) {
    const loader = new THREE.TextureLoader()
    return loader.load(path)
}

function despawnObj(id) {
    const index = props.findIndex(p => p.id === id)
    if (index === -1) {
        console.warn(`despawnObj: no prop found with id "${id}"`)
        return
    }

    const { body, mesh } = props[index]

    body?.world?.removeBody(body)
    mesh?.parent?.remove(mesh)

    props.splice(index, 1)
}

export { createBoxGeo, createPlaneGeo, staticPhysicsObj, dynamicPhysicsObj, loadTexture, despawnObj }