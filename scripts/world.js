import * as THREE from 'three'
import { SimplexNoise } from 'three/examples/jsm/math/SimplexNoise.js'
import { RNG } from './rng.js'
import { blocks } from './blocks.js'

const geometry = new THREE.BoxGeometry()
const material = new THREE.MeshStandardMaterial()

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
		seed: 0,
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
						id: blocks.empty.id,
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
		// random number generator로 seed를  설정하여 simplex noise에 전달하여 그에 따른 지형 생성
		// ==> scale, magnitude, offset을 조정할때마다 새로운 지형을 생성했던 이전과 다르게 기존 지형은 유지되고 값만 변화
		const rng = new RNG(this.params.seed)
		const simplex = new SimplexNoise(rng)
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
				for (let y = 0; y <= this.size.height; y++) {
					if (y < height) {
						this.setBlockId(x, y, z, blocks.dirt.id)
					} else if (y === height) {
						this.setBlockId(x, y, z, blocks.grass.id)
					} else {
						this.setBlockId(x, y, z, blocks.empty.id)
					}
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
					const blockType = Object.values(blocks).find((b) => b.id === blockId)
					const instanceId = mesh.count

					if (blockId !== blocks.empty.id && !this.isBlockObscured(x, y, z)) {
						// 0.5 더하는 이유: 블럭의 중심이 0,0,0이기 때문에 중심을 맞추기 위해 0.5를 더함
						matrix.setPosition(x + 0.5, y + 0.5, z + 0.5)
						mesh.setMatrixAt(instanceId, matrix)
						mesh.setColorAt(instanceId, new THREE.Color(blockType.color))
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

	isBlockObscured(x, y, z) {
		const up = this.getBlock(x, y + 1, z)?.id ?? blocks.empty.id
		const down = this.getBlock(x, y - 1, z)?.id ?? blocks.empty.id
		const left = this.getBlock(x - 1, y, z)?.id ?? blocks.empty.id
		const right = this.getBlock(x + 1, y, z)?.id ?? blocks.empty.id
		const forward = this.getBlock(x, y, z + 1)?.id ?? blocks.empty.id
		const back = this.getBlock(x, y, z - 1)?.id ?? blocks.empty.id

		// if any of the block's sides is exposed, it is not obscured
		if (
			up === blocks.empty.id ||
			down === blocks.empty.id ||
			left === blocks.empty.id ||
			right === blocks.empty.id ||
			forward === blocks.empty.id ||
			back === blocks.empty.id
		) {
			return false
		} else {
			return true
		}
	}
}
