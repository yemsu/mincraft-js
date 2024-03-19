import GUI from 'lil-gui'
import { blocks } from './blocks'

export function createUI(world) {
	const gui = new GUI()
	// world.size의 width를 조절할 수 있는 GUI를 Width라는 이름으로 추가하는데, 최소값은 8, 최대값은 128로 1번 생성한다.
	gui.add(world.size, 'width', 8, 128, 1).name('Width')
	gui.add(world.size, 'height', 8, 128, 1).name('Height')

	const terrainFolder = gui.addFolder('Terrain')
	terrainFolder.add(world.params, 'seed', 0, 10000).name('Seed')
	terrainFolder.add(world.params.terrain, 'scale', 10, 100).name('Scale')
	terrainFolder.add(world.params.terrain, 'magnitude', 0, 1).name('Magnitude')
	terrainFolder.add(world.params.terrain, 'offset', 0, 1).name('Offset')

	const resourcesFolder = gui.addFolder('Resources')
	resourcesFolder.add(blocks.stone, 'scarcity', 0, 1).name('Scarcity')

	const scaleFolder = gui.addFolder('Scale')
	scaleFolder.add(blocks.stone.scale, 'x', 10, 100).name('X Scale')
	scaleFolder.add(blocks.stone.scale, 'y', 10, 100).name('Y Scale')
	scaleFolder.add(blocks.stone.scale, 'z', 10, 100).name('Z Scale')

	gui.onChange(() => {
		world.generate()
	})
}
