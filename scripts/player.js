import * as THREE from 'three'
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js'

export class Player {
	camera = new THREE.PerspectiveCamera(
		70,
		window.innerWidth / window.innerHeight,
		0.1,
		200,
	)
	controls = new PointerLockControls(this.camera, document.body)

	constructor(scene) {
		this.position.set(32, 16, 32)
		scene.add(this.camera)

		document.addEventListener('keydown', this.onKeyDown.bind(this))
		document.addEventListener('keyup', this.onKeyUp.bind(this))
	}

	/**
	 * Return s the current world position of the player
	 * @type {THREE.Vector3}
	 */
	get position() {
		return this.camera.position
	}

	onKeyDown(event) {
		if (!this.controls.isLocked) {
			this.controls.lock()
		}
	}

	onKeyUp(event) {}
}
