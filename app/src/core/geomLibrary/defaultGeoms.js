import * as THREE from 'three'

function box(w = 1, h = 1, d = 1) {
    return new THREE.BoxGeometry(w, h, d)
}

function plane(w = 1, h = 1) {
    return new THREE.PlaneGeometry(w, h)
}

function cylinder(radiusTop = 0.5, radiusBottom = 0.5, height = 1, segments = 8) {
    return new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments)
}

function sphere(radius = 0.5, widthSegs = 16, heightSegs = 12) {
    return new THREE.SphereGeometry(radius, widthSegs, heightSegs)
}

export { box, plane, cylinder, sphere }