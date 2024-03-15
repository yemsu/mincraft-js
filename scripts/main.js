import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
// renderer setup
const renderer = new THREE.WebGLRenderer()

// just make everything is scaled appropriately
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

// camera setup
const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
)
camera.position.set(2, 2, 2)
camera.lookAt(0, 0, 0)

const controls = new OrbitControls(camera, renderer.domElement)

// Scene setup
const scene = new THREE.Scene()
// 형태
const geometry = new THREE.BoxGeometry()
const material = new THREE.MeshStandardMaterial({ color: 0x00d000 })

function setupLights() {
	// directional light는 태양과 같음. 얼마나 멀리있는지와 상관없이 intensity가 동일함함
	const light1 = new THREE.DirectionalLight()
	light1.position.set(1, 1, 1)
	scene.add(light1)

	const light2 = new THREE.DirectionalLight()
	light2.position.set(-1, 1, -0.5)
	scene.add(light2)

	// ambient light는 확산광. directional light가 닿지않는 곳을 밝혀주기 위해 추가
	const ambient = new THREE.AmbientLight()
	ambient.intensity = 0.1
	scene.add(ambient)
}

function setupWorld(size) {
	for (let x = 0; x < size; x++) {
		for (let z = 0; z < size; z++) {
			const cube = new THREE.Mesh(geometry, material)
			cube.position.set(x, 0, z)
			scene.add(cube)
		}
	}
}

// Render loop
function animate() {
	requestAnimationFrame(animate)
	renderer.render(scene, camera)
}

window.addEventListener('resize', () => {
	camera.aspect = window.innerWidth / window.innerHeight
	camera.updateProjectionMatrix()
	renderer.setSize(window.innerWidth, window.innerHeight)
})

setupLights()
setupWorld(32)
animate()
