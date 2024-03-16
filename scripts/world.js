import * as THREE from 'three'
import { SimplexNoise } from 'three/examples/jsm/math/SimplexNoise.js'

const geometry = new THREE.BoxGeometry()
const material = new THREE.MeshStandardMaterial({ color: 0x00d000 })

// group은 씬에 들어가는 object collection 같은 것
export class World extends THREE.Group {
	// 블럭 제거할떄 사용하기 위해 추가
	/**
	 * @type {{
	 *  id: number,
	 *  instanceId: number
	 * } [] [] []}
	 */
	data = []

	params = {
		terrain: {
			scale: 30, // number of hills
			magnitude: 0.5, // size of hills
			offset: 0.8, // height
		},
	}

	constructor(size = { width: 64, height: 32 }) {
		super()
		this.size = size
	}

	/**
	 * Generates the world data and meshes
	 */
	generate() {
		this.initializeTerrain()
		this.generateTerrain()
		this.generateMeshes()
	}

	/**
	 * Initializing the world terrain data
	 */
	initializeTerrain() {
		this.data = [] // reset the world
		for (let x = 0; x < this.size.width; x++) {
			const slice = []
			for (let y = 0; y < this.size.height; y++) {
				const row = []
				for (let z = 0; z < this.size.width; z++) {
					row.push({
						id: 0,
						instanceId: null, // null because we have not yet created our instance meshes yet
					})
				}
				slice.push(row)
			}
			this.data.push(slice)
		}
	}

	/**
	 * Generate the world terrain data
	 */
	generateTerrain() {
		const simplex = new SimplexNoise()
		for (let x = 0; x < this.size.width; x++) {
			for (let z = 0; z < this.size.width; z++) {
				// Compute the noise value at this x-z location
				const value = simplex.noise(
					x / this.params.terrain.scale,
					z / this.params.terrain.scale,
				)

				// Scale the noise based on the magnitude/offset
				const scaledNoise =
					this.params.terrain.offset + this.params.terrain.magnitude * value

				// Computing the height of the terrain at this x-z location
				let height = Math.floor(this.size.height * scaledNoise)

				//  Clamping height between 0 and max height
				height = Math.max(0, Math.min(height, this.size.height))

				// Fill in all blocks at or below the terrain height
				for (let y = 0; y <= height; y++) {
					this.setBlockId(x, y, z, 1)
				}
			}
		}
	}

	/**
	 * Generates the 3D representation of the world from the world data
	 */
	generateMeshes() {
		this.clear()
		const maxCount = this.size.width * this.size.width * this.size.height
		const mesh = new THREE.InstancedMesh(geometry, material, maxCount)
		mesh.count = 0 // current number of instances that we have

		const matrix = new THREE.Matrix4() // store the position of each block
		for (let x = 0; x < this.size.width; x++) {
			for (let y = 0; y < this.size.height; y++) {
				for (let z = 0; z < this.size.width; z++) {
					const blockId = this.getBlock(x, y, z).id
					const instanceId = mesh.count

					if (blockId !== 0) {
						// 0.5 더하는 이유: 블럭의 중심이 0,0,0이기 때문에 중심을 맞추기 위해 0.5를 더함
						matrix.setPosition(x + 0.5, y + 0.5, z + 0.5)
						mesh.setMatrixAt(instanceId, matrix)
						this.setBlockInstanceId(x, y, z, instanceId)
						mesh.count++
					}
				}
			}
		}

		this.add(mesh)
	}

	/**
	 * Gets the block data at {x,y,z}
	 * @param {number} x
	 * @param {number} y
	 * @param {number} z
	 * @returns {{id: number, instanceId: number} | null}
	 */
	getBlock(x, y, z) {
		if (this.inBounds(x, y, z)) {
			return this.data[x][y][z]
		} else {
			return null
		}
	}

	/**
	 * Sets the block id for the block at (x,y,z)
	 * @param {number} x
	 * @param {number} y
	 * @param {number} z
	 * @param {number} id
	 */
	setBlockId(x, y, z, id) {
		if (!this.inBounds(x, y, z)) return
		this.data[x][y][z].id = id
	}

	/**
	 * Sets the block instance id for the block at (x,y,z)
	 * @param {number} x
	 * @param {number} y
	 * @param {number} z
	 * @param {number} instanceId
	 * @returns
	 */
	setBlockInstanceId(x, y, z, instanceId) {
		if (!this.inBounds(x, y, z)) return
		this.data[x][y][z].instanceId = instanceId
	}

	/**
	 * Checks if the {x,y,z} coordinates are within the bounds
	 * @param {number} x
	 * @param {number} y
	 * @param {number} z
	 * @returns {boolean}
	 */
	inBounds(x, y, z) {
		return (
			x >= 0 &&
			x < this.size.width &&
			y >= 0 &&
			y < this.size.height &&
			z >= 0 &&
			z < this.size.width
		)
	}
}
