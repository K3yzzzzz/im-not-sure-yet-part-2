import { box, plane, cylinder, sphere } from './defaultGeoms'
import { ramp, lShape } from './uniqueGeoms'

function mergeGeometries(geos) {
    try {
        const { mergeGeometries: merge } = THREE.BufferGeometryUtils ?? {}
        if (!merge) {
            console.warn('geomLibrary: THREE.BufferGeometryUtils not available, skipping merge')
            return null
        }
        return merge(geos)
    } catch (e) {
        console.warn('geomLibrary: merge failed', e)
        return null
    }
}

const geomLibrary = { box, plane, cylinder, sphere, ramp, lShape }

export default geomLibrary
export { mergeGeometries }