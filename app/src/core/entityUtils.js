//entityUtils.js
import { world } from '../main'

function updateObjProps(body, options = {}) {
    if (!body) {
        console.warn("updateObjProps called with invalid body:", body)
        return
    }

    if (!body.userData || !body.userData.mesh) {
        console.warn("Body missing userData.mesh:", body)
        return
    }

    const {
        tags, pos, rot, scale,
        mass, linearDamping,
        friction, restitution,
        ...materials
    } = options

    const mesh = body.userData.mesh

    //? Key
    if (tags !== undefined) body.userData.tags = tags

    //? Transform
    if (pos) mesh.position.set(...pos)
    if (rot) mesh.rotation.set(...rot)
    if (scale) mesh.scale.set(...scale)

    //? Physics
    if (mass !== undefined) { body.mass = mass; body.updateMassProperties() }
    if (linearDamping !== undefined) body.linearDamping = linearDamping
    if (friction !== undefined) body.material.friction = friction
    if (restitution !== undefined) body.material.restitution = restitution

    //? Material
    if (Object.keys(materials).length) {
        Object.assign(mesh.material, materials)
        mesh.material.needsUpdate = true
    }
}

// TODO: fade out mesh before removing
function despawnObj(body) {
    if (!body.userData.mesh?.parent) console.warn('despawnObj: mesh has no parent', body)
    body.userData.mesh?.parent?.remove(body.userData.mesh)
    world.removeBody(body)
}

function getActiveMail() {
    return world.bodies.filter(b => b.userData?.id?.startsWith('mail:'))
}

export { updateObjProps, despawnObj, getActiveMail }