import * as THREE from 'three'
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js'

import { scene } from '../main'

function skybox() {
    return new Promise((resolve) => {
        new HDRLoader().load('/skybox/...hdr', (texture) => {
            texture.mapping = THREE.EquirectangularReflectionMapping
            scene.background = texture
            scene.environment = texture
            resolve()
        })
    })
}

export default skybox