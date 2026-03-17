import * as THREE from 'three'

import { mergeGeometries } from './geomLibrary'

function ramp(w = 1, h = 1, d = 1) {
    const geo = new THREE.BufferGeometry()
    const hw = w / 2
    const hd = d / 2

    const positions = new Float32Array([
        -hw, 0, hd, hw, 0, hd, hw, 0, -hd,
        -hw, 0, hd, hw, 0, -hd, -hw, 0, -hd,
        -hw, 0, -hd, hw, 0, -hd, hw, h, -hd,
        -hw, 0, -hd, hw, h, -hd, -hw, h, -hd,
        -hw, 0, hd, hw, 0, hd, hw, 0, hd,
        -hw, 0, hd, -hw, h, -hd, hw, h, -hd,
        -hw, 0, hd, hw, h, -hd, hw, 0, hd,
        -hw, 0, hd, -hw, 0, -hd, -hw, h, -hd,
        hw, 0, hd, hw, h, -hd, hw, 0, -hd,
    ])

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.computeVertexNormals()
    return geo
}

function lShape(w = 2, h = 0.2, d = 2, cutW = 1, cutD = 1) {
    const geo = new THREE.BufferGeometry()
    const hw = w / 2, hd = d / 2, hh = h / 2

    const ax = w, az = d - cutD
    const bx = w - cutW, bz = cutD

    const geoA = new THREE.BoxGeometry(ax, h, az)
    const geoB = new THREE.BoxGeometry(bx, h, bz)

    const matrix = new THREE.Matrix4()
    matrix.makeTranslation(-(cutW / 2), 0, (az / 2 + bz / 2))
    geoB.applyMatrix4(matrix)

    const merged = mergeGeometries([geoA, geoB])
    return merged ?? geoA
}

export { ramp, lShape }