import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import { World } from './world'
import { createUI } from './ui'
import { Player } from './player'

const stats = new Stats()
document.body.appendChild(stats.dom)

// renderer setup
const renderer = new THREE.WebGLRenderer()

// just make everything is scaled appropriately
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setClearColor(0x80a0e0)
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
document.body.appendChild(renderer.domElement)

// Scene setup
const scene = new THREE.Scene()
const world = new World()
world.generate()
scene.add(world)

const player = new Player(scene)

// camera setup
const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
)
camera.position.set(-world.size.width, world.size.height / 2, world.size.width)
camera.lookAt(0, 0, 0)

const controls = new OrbitControls(camera, renderer.domElement)
controls.target.set(world.size.width / 2, 0, world.size.width / 2)
controls.update()

function setupLights() {
	// directional light는 태양과 같음. 얼마나 멀리있는지와 상관없이 intensity가 동일함함
	const sun = new THREE.DirectionalLight()
	sun.position.set(50, 50, 50)
	sun.castShadow = true
	sun.shadow.camera.left = -50
	sun.shadow.camera.right = 50
	sun.shadow.camera.bottom = -50
	sun.shadow.camera.top = 50
	sun.shadow.camera.near = 0.1
	sun.shadow.camera.far = 100
	sun.shadow.bias = -0.0005
	sun.shadow.mapSize = new THREE.Vector2(512, 512)
	scene.add(sun)

	const shadowHelper = new THREE.CameraHelper(sun.shadow.camera)
	scene.add(shadowHelper)

	// ambient light는 확산광. directional light가 닿지않는 곳을 밝혀주기 위해 추가
	const ambient = new THREE.AmbientLight()
	ambient.intensity = 0.1
	scene.add(ambient)
}
// Render loop
let previousTime = performance.now()
function animate() {
	let currentTime = performance.now()
	let dt = (currentTime = previousTime) / 1000

	requestAnimationFrame(animate)
	player.applyInputs(dt)
	renderer.render(scene, player.camera)
	stats.update()

	previousTime = currentTime
}

window.addEventListener('resize', () => {
	camera.aspect = window.innerWidth / window.innerHeight
	camera.updateProjectionMatrix()
	renderer.setSize(window.innerWidth, window.innerHeight)
})

setupLights()
createUI(world)
animate()
