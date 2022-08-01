<template>
	<v-app v-if="isDoneLoading">
		<div>
			<v-bottom-navigation color="primary" min-height="200">
				<v-container>
					<!-- SECTION:再生制御 -->
					<v-row class="ma-2" justify="center">
						<v-col cols="3"
							><v-text-field
								outlined
								v-model.number="tempFrameCount"
								@change=";(player.frameCount = tempFrameCount), emitPlayer()"
								label="指定コマへ"
								:placeholder="'0〜' + frameNum + 'までの数値'"
							></v-text-field
						></v-col>
						<v-col cols="6">
							<v-btn x-large icon v-if="player.state != 'play'" @click=";(player.state = 'play'), emitPlayer()">
								<span>Play</span>
								<v-icon x-large>mdi-play</v-icon>
							</v-btn>
							<v-btn x-large icon v-if="player.state != 'play'" @click=";(player.frameCount -= player.frameCount > 0 ? 1 : 0), emitPlayer()">
								<span>前コマ</span>
								<v-icon>mdi-step-backward</v-icon>
							</v-btn>
							<v-btn x-large icon v-else-if="player.state == 'play'" @click=";(player.state = 'pause'), emitPlayer()">
								<span>Pause</span>
								<v-icon x-large>mdi-pause</v-icon>
							</v-btn>
							<v-btn x-large icon @click=";(player.state = 'stop'), (player.frameCount = 0), emitPlayer()">
								<span>Stop</span>
								<v-icon x-large>mdi-stop</v-icon>
							</v-btn>
							<v-btn
								x-large
								icon
								v-if="player.state != 'play'"
								@click=";(player.frameCount += player.frameCount < frameNum - 1 ? 1 : 0), emitPlayer()"
							>
								<span>次コマ</span>
								<v-icon x-large>mdi-step-forward</v-icon>
							</v-btn>
						</v-col>
						<v-col cols="3"><v-select v-model="speed" :items="speedList" label="再生速度" @change="updateSpeed(speed)"></v-select></v-col>
					</v-row>
					<v-row class="ma-2" justify="center">
						<v-slider
							label="現在コマ"
							v-model="player.frameCount"
							:min="slider.min"
							:max="slider.max"
							:thumb-size="35"
							@change="emitPlayer()"
							thumb-label="always"
						></v-slider>
					</v-row>
				</v-container>
			</v-bottom-navigation>
		</div>
	</v-app>
</template>

<script>
export default {
	name: 'PlayerCompo',
	// SECTION:コンポーネント
	components: {},
	// SECTION:変数
	data() {
		return {
			player: {
				state: 'stop', //play, pause, stop
				frameDiff: 2,
				// frameUpdateFreq: 1,
				frameCount:  0,
			},
			tempFrameCount: null,
			speedList: [0.1, 0.2, 0.5, 1.0, 1.5, 2.0],
			speed: 1.0,
			slider: {
				min: 0,
				max: 100, //テンポラル（frameNumが後から入る）
			},
			dataInfo: null,
			panelMenu: [
				{
					name: 'キー操作方法',
					content: {
						f: 'キャンバス拡大/縮小',
						space: '再生/一時停止',
						右矢印キー: '次コマ',
						左矢印キー: '前コマ',
						上矢印キー: '再生速度UP',
						下矢印キー: '再生速度DOWN',
					},
				},
			],
		}
	},
	props: {
		frameNum: Number,
		frameCount: Number,
		isDoneLoading: Boolean,
	},
	// SECTION:関数
	methods: {
		emitPlayer() {
			this.player.frameDiff = parseInt(this.speed * 2)
			console.log('this.player: ', this.player)
			this.$emit('emitPlayer', this.player)
		},
		// updateSpeed(_speed) {
		// this.player.frameDiff =
		// this.player.frameUpdateFreq =
		// },
		onKeyDown(e) {
			console.log('押されたキー: ', e.keyCode)
			e.preventDefault()
			switch (e.keyCode) {
				case 32: //スペースキー
					this.player.state = this.player.state == 'play' ? 'pause' : 'play'
					console.log('this.player.frameCount: ', this.player.frameCount)
					break
				case 39: //右矢印...次コマへ
					this.player.frameCount += this.player.frameCount < this.frameNum - 1 ? 1 : 0
					break
				case 37: //左矢印...前コマへ
					this.player.frameCount -= this.player.frameCount > 0 ? 1 : 0
					break
				case 38: //上矢印...再生速度UP
					// speedDlistのそのインデックスのスピードを代入する
					this.speed = this.speed < 2.0 ? parseFloat((this.speed + 0.1).toFixed(2)) : this.speed
					console.log('this.speed: ', this.speed)
					break
				case 40: //下矢印...再生速度DOWN
					this.speed = this.speed > 0.1 ? parseFloat((this.speed - 0.1).toFixed(2)) : this.speed
					console.log('this.speed: ', this.speed)
					break
				default:
					break
			}
			this.emitPlayer()
		},
		loadDataInfo(_dataInfo) {
			//NOTE::親のPlayViewから発火させられるメソッド
			this.dataInfo = _dataInfo
			this.slider.max = this.frameNum
			console.log('this.slider.max: ', this.slider.max)
		},
	},
	beforeCreate() {
		document.title = 'karakuri'
	},	
	// キーボード入力イベントの定義
	mounted() {
		document.addEventListener('keydown', this.onKeyDown)
		console.log('speedList: ', this.speedList)
	},
	// キーボード入力イベントを削除しとく
	beforeDestroy() {
		document.removeEventListener('keydown', this.onKeyDown)
	},
}
</script>
