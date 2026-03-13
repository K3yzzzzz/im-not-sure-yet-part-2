//entityUtils.js
import * as THREE from 'three'
import { Body, Box, Vec3 } from 'cannon-es'

//~ Geometry Creators
function createBoxGeo() {
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshNormalMaterial({ wireframe: true })

    return new THREE.Mesh(geometry, material)
}

//~ Physics
function staticPhysicsObj({ mesh, collider, friction, restitution }) {
    //? Build
    const shape = new Box(new Vec3(mesh.scale.x / 2, mesh.scale.y / 2, mesh.scale.z / 2))
    const body = new Body({ shape, collisionResponse: collider, friction, restitution })

    //? Place
    body.position.copy(mesh.position)
    body.quaternion.setFromEuler(mesh.rotation.x, mesh.rotation.y, mesh.rotation.z, 'XYZ')
    return body
}

function dynamicPhysicsObj({ mesh, collider, friction, restitution, damping, mass }) {
    //? Build
    const [linearDamping, angularDamping] = damping
    const shape = new Box(new Vec3(mesh.scale.x / 2, mesh.scale.y / 2, mesh.scale.z / 2))
    const body = new Body({ mass, shape, collisionResponse: collider, friction, restitution, linearDamping, angularDamping })

    //? Place
    body.position.copy(mesh.position)
    body.quaternion.setFromEuler(mesh.rotation.x, mesh.rotation.y, mesh.rotation.z, 'XYZ')
    return body
}

//~ Helpers
function updateObjProps({ mesh, body }, { tags, pos, rot, scale, mass, linearDamping, friction, restitution, ...materials } = {}) {
    //? Key
    if (tags !== undefined) body.userData.tags = tags

    //? Transform
    if (pos) mesh.position.set(...pos)
    if (rot) mesh.rotation.set(...rot)
    if (scale) mesh.scale.set(...scale)

    //? Physics
    if (mass !== undefined) body.mass = mass
    if (linearDamping !== undefined) body.linearDamping = linearDamping
    if (friction !== undefined) body.material.friction = friction
    if (restitution !== undefined) body.material.restitution = restitution
    body.updateMassProperties()

    //? Material
    if (Object.keys(materials).length) {
        Object.assign(mesh.material, materials)
        mesh.material.needsUpdate = true
    }
}

function despawnObj({ mesh, body }) {
    body.userData.mesh?.parent?.remove(body.userData.mesh)
    world.removeBody(body)
    //old V
    body?.world?.removeBody(body)
    mesh?.parent?.remove(mesh)
}

//? Other
function getActiveMail() {
    return world.bodies.filter(b => b.userData?.id?.startsWith('mail:'))
}

export {
    createBoxGeo,
    staticPhysicsObj, dynamicPhysicsObj,
    updateObjProps, despawnObj,
    getActiveMail
}