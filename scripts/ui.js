import GUI from 'lil-gui'

export function createUI(world) {
	const gui = new GUI()
	// world.size의 width를 조절할 수 있는 GUI를 Width라는 이름으로 추가하는데, 최소값은 8, 최대값은 128로 1번 생성한다.
	gui.add(world.size, 'width', 8, 128, 1).name('Width')
	gui.add(world.size, 'height', 8, 128, 1).name('Height')
	gui.add(world, 'generate')
}
