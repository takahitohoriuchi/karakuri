<template>
	<div class="play">
		<v-card>
			<v-container v-if="!isDoneLoading">
				<v-row justify="center" height="300px" @dragover.prevent @dragenter="onDragEnter" @dragleave="onDragLeave" @drop="onDrop">				
					<v-col cols="3"></v-col>
					<v-col cols="6">
						<v-file-input
							accept=".csv"
							:height="200"
							v-model="file"
							clearable
							counter
							label="csvファイルをドラッグ&ドロップ"
							filled
							:background-color="isDragging ? 'blue' : 'null'"
							@change="loadSelectedFile(file)"
						></v-file-input>
					</v-col>
					<v-col cols="3"></v-col>
				</v-row>
			</v-container>			
			<!-- SECTION:p5スケッチ -->
			<v-container>
				<v-row>
					<!-- <v-col cols="1"><v-btn @click="$refs.controller.toggleLeftMenu()">Lmenu</v-btn></v-col> -->
					<v-col cols="10"><span id="sketch"></span></v-col>
					<!-- <v-col cols="1"><v-btn @click="$refs.controller.toggleRightMenu()">Rmenu</v-btn></v-col> -->
				</v-row>
			</v-container>
			<!-- SECTION:PlayerCompo（再生操作） -->
			<PlayerCompo ref="player" :isDoneLoading="isDoneLoading" :frameNum="frameNum" :frameCount="frameCount" @emitPlayer="catchFromPlayerCompo" />
			<EditorCompo :memberID="memberDocData.memberID" :isDoneLoading="isDoneLoading" :markeredData="markeredData" />
			<!-- SECTION:ControllerCompo（エフェクト操作） -->
			<ControllerCompo
				ref="controller"
				:isDoneLoading="isDoneLoading"
				:frameNum="frameNum"
				:photoURL="memberDocData.photoURL"
				@emitKarakurier="catchKarakurierFromController"
				@emitCamerer="catchCamererFromController"
			/>
		</v-card>
	</div>
</template>

<script src="https://freshfork.github.io/p5.EasyCam/p5.easycam.min.js"></script>
<script>
import ControllerCompo from '@/components/ControllerCompo.vue'
import PlayerCompo from '@/components/PlayerCompo.vue'
import EditorCompo from '@/components/EditorCompo.vue'
import SawarabiGothic from '@/assets/fonts/sawarabi-gothic-medium.ttf'
import { genMarkeredData, genFramedData, loadMarkeredData } from '@/modules/loadData.js'
import p5 from 'p5'
import { drawCoordinate, drawMarkerLabels, drawMarkers, updateFrameCount, updateCam, windowResized, drawSphere } from '@/modules/p5utils'
import { drawHuman, drawTrails } from '@/modules/karakuri'
// グローバル変数
let isFullScreen = false
let cam = null
let camParams = {
	// カメラ位置を極座標表示するパラメータ
	r: 300,
	phi: 0,
	theta: 0, //NOTE:phiはxz平面（タテY軸まわり）に対する角度、thetaはyz平面（ヨコX軸まわり））に対する角度
	// カメラ位置を直交座標表示するパラメータ
	x: 0,
	y: 0,
	z: 300,
	// カメラ注視点
	lookAt: [0, 0, 0], //原点
}
let plots2Draw = []//objの配列
let trailLength = 10
let font

export default {
	name: 'PlayView',
	// SECTION:コンポーネント
	components: { ControllerCompo, PlayerCompo, EditorCompo },
	// SECTION:変数
	data() {
		return {
			memberDocData: null,
			markeredData: [], //データ:マーカーごとver.（SEE:loadData.js）構造は、[{マーカー1の全コマデータ}, {マーカー2の全コマデータ}, ...（以下マーカーの数だけ続く）]
			framedData: [], //データ：コマごとver.（SEE:loadData.js）構造は、[{コマ1の全マーカーデータ}, {コマ2の全マーカーデータ}, ...（以下コマの数だけ続く）]
			dataInfo: null, //↑markeredDataのうち、マーカー名一覧・フレーム数をとって加工
			isDoneLoading: false,
			selectedKarakuri: null,
			state: 'stop',
			frameCount: 0,
			frameNum: null,
			frameDiff: 2,
			camLookAt: 'ORIGIN',
			sketch: null,
			sketchInstance: null,
			file: null,
			files: [],
			isDragging: false,
			dragCount: 0,
		}
	},
	// SECTION:関数
	methods: {
		catchFromPlayerCompo(_dataObj) {
			this.state = _dataObj.state
			this.frameCount = _dataObj.frameCount
			this.frameDiff = _dataObj.frameDiff
		},
		catchKarakurierFromController(_selectedKarakuri) {
			this.selectedKarakuri = _selectedKarakuri
			/* TODO:
			optionsのtrailLengthだったら、
			trailLengthをその長さにして、
			plots2Draw[]の{}の数も変えなくては。pushしたりpopしたりしなくてはナラヌ
			*/
			// this.trailLength =
		},
		catchCamererFromController(_camerer) {
			this.camLookAt = _camerer.lookAt
			console.log('camLookAt: ', this.camLookAt)
		},
		async loadSelectedFile(_file) {
			console.log('_file: ', _file)
			this.markeredData = await genMarkeredData(_file)
			this.framedData = await genFramedData(this.markeredData)
			this.frameNum = this.markeredData[1].plots.length
			this.dataInfo = await this.markeredData.map((data) => {
				return {
					id: data.id,
					name: data.name,
					frameCount: data.plots.length,
				}
			})
			// NOTE:子のControllerViewのメソッドを発火
			this.$refs.controller.loadDataInfo(this.dataInfo)
			this.$refs.player.loadDataInfo(this.dataInfo)
			this.isDoneLoading = true
			console.log('this.frameNum（コマ数）: ', this.frameNum)
			console.log('this.framedData（コマごと）: ', this.framedData)
			console.log('this.markeredData（マーカーごと）: ', this.markeredData)
			console.log('this.dataInfo: ', this.dataInfo)
			window.alert('読み込み完了')
		},
		async loadSelectedFileFromMyPage(_selectedFileData) {
			this.markeredData = await loadMarkeredData(_selectedFileData)
			this.framedData = await genFramedData(this.markeredData)
			this.frameNum = this.markeredData[1].plots.length
			this.dataInfo = await this.markeredData.map((data) => {
				return {
					id: data.id,
					name: data.name,
					frameCount: data.plots.length,
				}
			})
			// NOTE:子のControllerViewのメソッドを発火
			this.$refs.controller.loadDataInfo(this.dataInfo)
			this.$refs.player.loadDataInfo(this.dataInfo)
			this.isDoneLoading = true
			console.log('this.frameNum（コマ数）: ', this.frameNum)
			console.log('this.framedData（コマごと）: ', this.framedData)
			console.log('this.markeredData（マーカーごと）: ', this.markeredData)
			console.log('this.dataInfo: ', this.dataInfo)
			// window.alert('読み込み完了')
		},
		async uploadFile() {
			console.log('フィアルがある')
			/*
			ファイルサイズを取得して、1MB以内におさまってるかを確認する。
			「120fpsかつ７−８秒で、17マーカーのデータ」で、csvで400KBくらい。
			まあだいじょうぶだろうが、いちおうファイルサイズ取得と制限は必要。
			*/
		},
		onDrop(e) {
			e.preventDefault()
			e.stopPropagation()
			this.file = e.dataTransfer.files[0]
			console.log('set file: ', this.file)
			if (this.file.type == 'text/csv') {
				this.isDragging = false
				// NOTE:ここ書き換えてみた↓
				this.file = e.dataTransfer.files[0]
				console.log('set file: ', this.file)
			} else {
				this.file = null
				alert('csvファイルにしてください！')
				this.dragCount--
				if (this.dragCount <= 0) {
					this.isDragging = false
				}
			}
		},
		onDragEnter(e) {
			e.preventDefault()
			this.isDragging = true
			this.dragCount++
		},
		onDragLeave(e) {
			e.preventDefault()
			this.dragCount--
			if (this.dragCount <= 0) {
				this.isDragging = false
			}
		},
	},
	props: {
		selectedFileData: Object,
	},
	// SECTION:ビュー読み込み前処理
	beforeCreate: async function () {
		// ./modules/loadData.jsでファイル読み込み
		document.title = 'karakuri'
	},
	created: async function () {
		this.memberDocData = this.$memDocData
		console.log('this.selectedFileData: ', this.selectedFileData)
		this.isDoneLoading = this.selectedFileData ? true : false
		// //myPageから読み込んできたものをつかって、
		// if (this.selectedFileData) {
		// 	try {
		// 		await this.loadSelectedFileFromMyPage(this.selectedFileData)
		// 	} catch (error) {
		// 		console.log(error)
		// 	}
		// }
	},
	mounted: async function () {
		//myPageから読み込んできたものをつかって、
		if (this.selectedFileData) {
			try {
				await this.loadSelectedFileFromMyPage(this.selectedFileData)
			} catch (error) {
				console.log(error)
			}
		}
		const sketch = (p) => {
			var thi = this //NOTE:vueインスタンスのthisがわり for 自作関数群 TODO:でもthisそれ自体をコピーするってすごく重いんじゃ？？？要チェック。
			let fontReady = false
			let indexPosition = 0
			let preIndexPosition = 0

			function fontRead() {
				fontReady = true
			}
			function updatePlots2Draw(_frameCount) {
				// console.log(`thi.framedData[${_frameCount}]: `, thi.framedData[_frameCount])
				plots2Draw[indexPosition] = thi.framedData[_frameCount]
				preIndexPosition = indexPosition
				indexPosition = (indexPosition + 1) % trailLength
			}
			p.preload = () => {
				// font = p.loadFont('../assets/sawarabi-mincho-medium.ttf')
			}
			p.setup = () => {
				// p.noLoop()
				console.log('\n\n!!!!!!!!!!CAUTION!!!!!!!!\nいまはnoLoop()にしてるから映像動かない！！\n!!!!!!!!!!CAUTION!!!!!!!!\n\n')
				// フォント
				p.loadFont(SawarabiGothic, (font) => {
					console.log('Success loading font!')
					p.textFont(font)
					p.textSize(10)
					p.textAlign('CENTER', 'CENTER')
				})
				p.createCanvas(1600, 900, p.WEBGL)
				p.setAttributes('alpha', false)
				cam = p.createCamera()
				// NOTE:p5公式のミス
				// cam.camera()の引数(7,8,9)番目は、(upY, upX, upZ)の順番？？？(upX,upY,upZ)じゃない！！！！！ cam.camera(0, 0, 78, 0, 0, 0, 0, 0, -1, 0)//これにするとupZが-1になって、 cam.camera(0, 0, 78, 0, 0, 0, 0, 0, 0, -1)//これにするとupZが0になる
				cam.camera(0, 0, 300, 0, 0, 0, 0, -1, 0, 0) //これにすると所望通り、upYが-1になる。
				// // TODO:カメラ設定はfrustum()か、もっと簡単にはperspectiveをつかうべし
				// // If no parameters are given, the following default is used: perspective(PI/3, width/height, eyeZ/10, eyeZ*10), where eyeZ is equal to ((height/2) / tan(PI/6)).
				// const eyeZ = (p.height/2) / p.tan(Math.PI/6)
				const eyeZ = camParams.z
				cam.perspective(Math.PI/3, p.width/p.height, eyeZ/100, eyeZ*10)
				// cam.frustum()
				console.log('cam: ', cam)
				console.log('いまからupdatePlotsDraw()をsetup()内で実行するよ')
				for (let i = 0; i < trailLength; i++) {
					let parentObj = {}
					// plot2drawを初期化しておく。（以下のObj * trailLength個）
					// 	{
					// 		'部位ID': {
					// 			name: '部位名',
					// 			x: 0,
					// 			y: 0,
					// 			z: 0,
					// 		},
					// 		{'部位ID': {
					// 			name: '部位名'
					// 			x: 0,
					// 			y: 0,
					// 			z: 0,
					// 		},...{},{},{}
					// 	}
					this.markeredData.forEach((markerObj) => {
						let childObj = {}
						childObj[markerObj.id] = {
							name: markerObj.name,
							x: 0,
							y: 0,
							z: 0,
						}
						parentObj[markerObj.id] = childObj
					})
					plots2Draw.push(parentObj)
				}
			}

			// SECTION:draw()
			p.draw = () => {
				// DEBUG:作業のため、isDoneLoadingにかかわらずキャンバス表示しとく
				if (this.isDoneLoading) {
					const t = this.frameCount
					p.background(200)
					// 座標系の描画
					if (this.$refs.controller.isShowCoordinate) {
						drawCoordinate(p)
					}
					// 世界球の描画
					if (this.$refs.controller.isShowSphere) {
						drawSphere(p, 300)
					}
					// マーカーの描画
					drawMarkers(p, plots2Draw[preIndexPosition], this.$refs.controller.activeMarkers)
					// マーカーラベルの描画
					if (this.$refs.controller.isShowMarkerLabels) {
						drawMarkerLabels(p, plots2Draw[preIndexPosition], this.$refs.controller.activeMarkers, camParams.theta, camParams.phi)
					}

					// カラクリの描画
					switch (this.selectedKarakuri) {
						case null:
							break
						case 'drawHuman':
							// drawHuman(p, this.framedData[t])
							drawHuman(p, plots2Draw[preIndexPosition])
							break
						case 'drawTrails':
							drawTrails(p, plots2Draw, indexPosition, trailLength, this.$refs.controller.activeMarkers)
							break
						default:
							break
					}

					// カメラの更新
					const lookPoint = plots2Draw[preIndexPosition][this.camLookAt]
					camParams = updateCam({ _camParams: camParams, _lookAt: [lookPoint.x, lookPoint.y, lookPoint.z] })
					cam.camera(camParams.x, camParams.y, camParams.z, camParams.lookAt[0], camParams.lookAt[1], camParams.lookAt[2], 0, -1, 0)

					// コマの更新（frameCount）
					if (this.state == 'play') {
						this.frameCount = updateFrameCount(t, this.frameNum, this.frameDiff)
						this.$refs.player.player.frameCount = this.frameCount //NOTE:PlayerCompoのframeCountも連動させる
						updatePlots2Draw(this.frameCount)
					}

					// 最後コマまでいったら、stateをstopにする
					if (this.frameCount == this.frameNum - 1) {
						this.state = 'stop'
						this.$refs.player.player.state = 'stop'
					}
				}
			}
			// SECTION:キータイプ操作
			p.keyPressed = () => {
				switch (p.key) {
					case 'f':
						windowResized(p, isFullScreen)
						break
					case 'p':
						console.log('cam: ', cam)
						break
					default:
						break
				}
				// NOTE:再生制御のキーボード操作（すべて特殊キー）は、Controllerコンポ内でやる
			}
			// SECTION:マウス操作
			// マウスドラッグ
			p.mouseDragged = (e) => {
				// console.log('e: ', e)
				if (e.shiftKey) {
					const bigger = Math.abs(e.movementX) - Math.abs(e.movementY) >= 0 ? 'x' : 'y'
					// 横ドラッグ（カメラtheta回転）
					if (bigger == 'x') {
						// 度数表記→ラジアン表記
						const degree = e.movementX * (Math.PI / 180)
						camParams = updateCam({ _camParams: camParams, _dTheta: degree })
					}
					// 縦ドラッグ（カメラphi回転）
					else {
						const degree = e.movementY * (Math.PI / 180)
						camParams = updateCam({ _camParams: camParams, _dPhi: degree })
					}
					return false //NOTE:ブラウザの標準スクロールを無効化
				} else {
					return true
				}
			}
			// マウスウィール
			p.mouseWheel = (e) => {
				// ・上ウィール：lookAt位置めがけてズームアウト（限度あり）
				// ・下ウィール：lookAt位置めがけてズームイン（限度あり）
				// NOTE:もともと慣性つき！！！！
				if (e.shiftKey) {
					camParams = updateCam({ _camParams: camParams, _dR: e.delta })
					return false //NOTE:ブラウザの標準スクロールを無効化
				} else {
					return true
				}
			}
		}
		const sketchInstance = new p5(sketch, 'sketch')
		console.log('sketchInstance: ', sketchInstance)
	},
}
</script>

<!-- SECTION:スタイルシート -->
<!-- NOTE:p5のloadFont()がうまく動かんので、CSSから読み込む -->
<style>
.enter {
	border: 10px dotted red;
}
</style>
