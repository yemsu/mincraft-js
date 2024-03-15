import * as THREE from 'three'

const geometry = new THREE.BoxGeometry()
const material = new THREE.MeshStandardMaterial({ color: 0x00d000 })

// group은 씬에 들어가는 object collection 같은 것
export class World extends THREE.Group {
	constructor(size = { width: 64, height: 32 }) {
		super()
		this.size = size
	}

	generate() {
		const maxCount = this.size.width * this.size.width * this.size.height
		const mesh = new THREE.InstancedMesh(geometry, material, maxCount)
		mesh.count = 0 // current number of instances that we have

		const matrix = new THREE.Matrix4() // store the position of each block
		for (let x = 0; x < this.size.width; x++) {
			for (let y = 0; y < this.size.height; y++) {
				for (let z = 0; z < this.size.width; z++) {
					// 0.5 더하는 이유: 블럭의 중심이 0,0,0이기 때문에 중심을 맞추기 위해 0.5를 더함
					matrix.setPosition(x + 0.5, y + 0.5, z + 0.5)
					mesh.setMatrixAt(mesh.count++, matrix)
				}
			}
		}

		this.add(mesh)
	}
}
