import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import { World } from './world'

const stats = new Stats()
document.body.appendChild(stats.dom)

// renderer setup
const renderer = new THREE.WebGLRenderer()

const TERRAIN_SIZE = 32

// just make everything is scaled appropriately
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setClearColor(0x80a0e0)
document.body.appendChild(renderer.domElement)

// camera setup
const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
)
camera.position.set(-TERRAIN_SIZE, TERRAIN_SIZE / 2, TERRAIN_SIZE)
camera.lookAt(0, 0, 0)

const controls = new OrbitControls(camera, renderer.domElement)
controls.target.set(TERRAIN_SIZE / 2, 0, TERRAIN_SIZE / 2)
controls.update()

// Scene setup
const scene = new THREE.Scene()
const world = new World()
world.generate()
scene.add(world)

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
// Render loop
function animate() {
	requestAnimationFrame(animate)
	renderer.render(scene, camera)
	stats.update()
}

window.addEventListener('resize', () => {
	camera.aspect = window.innerWidth / window.innerHeight
	camera.updateProjectionMatrix()
	renderer.setSize(window.innerWidth, window.innerHeight)
})

setupLights()
animate()
