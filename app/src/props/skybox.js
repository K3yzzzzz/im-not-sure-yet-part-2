import * as THREE from 'three'
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js'

import { scene } from '../main'


function skybox() {
    const hdrLoader = new HDRLoader()
    setTimeout(() => {
        hdrLoader.load('/skybox/citrus_orchard_road_puresky_4k.hdr', (texture) => {
            texture.mapping = THREE.EquirectangularReflectionMapping
            scene.background = texture
            scene.environment = texture
        })
    }, 100)
}

export default skybox