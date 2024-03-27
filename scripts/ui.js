import GUI from 'lil-gui'
import { blocks, resources } from './blocks'

export function createUI(world, player) {
	const gui = new GUI()

	const playerFolder = gui.addFolder('Player')
	playerFolder.add(player, 'maxSpeed', 1, 20).name('Max Speed')

	// world.size의 width를 조절할 수 있는 GUI를 Width라는 이름으로 추가하는데, 최소값은 8, 최대값은 128로 1번 생성한다.
	gui.add(world.size, 'width', 8, 128, 1).name('Width')
	gui.add(world.size, 'height', 8, 128, 1).name('Height')

	const terrainFolder = gui.addFolder('Terrain')
	terrainFolder.add(world.params, 'seed', 0, 10000).name('Seed')
	terrainFolder.add(world.params.terrain, 'scale', 10, 100).name('Scale')
	terrainFolder.add(world.params.terrain, 'magnitude', 0, 1).name('Magnitude')
	terrainFolder.add(world.params.terrain, 'offset', 0, 1).name('Offset')

	resources.forEach((resource) => {
		const resourcesFolder = gui.addFolder(`${resource.name} Resources`)
		resourcesFolder
			.add(blocks[resource.name], 'scarcity', 0, 1)
			.name('Scarcity')

		const scaleFolder = gui.addFolder(`${resource.name} Scale`)
		scaleFolder.add(blocks[resource.name].scale, 'x', 10, 100).name('X Scale')
		scaleFolder.add(blocks[resource.name].scale, 'y', 10, 100).name('Y Scale')
		scaleFolder.add(blocks[resource.name].scale, 'z', 10, 100).name('Z Scale')
	})

	gui.onChange(() => {
		world.generate()
	})
}
