<template>
	<v-app>
		<!-- <div class="play"> -->
		<v-card>
			<div><input type="file" title @change="loadSelectedFile" /></div>
			<!-- SECTION:ControllerCompo（エフェクト操作） -->
			<ControllerCompo
				ref="controller"
				:frameNum="frameNum"
				:isDoneLoading="isDoneLoading"
				@emitKarakurier="catchKarakurierFromController"
				@emitCamerer="catchCamererFromController"
			/>
			<!-- SECTION:p5スケッチ -->
			<v-container>
				<!-- <span
					id="sketch"
					class="drop_area"
					@dragenter="dragEnter"
					@dragleave="dragLeave"
					@dragover.prevent
					@drop.prevent="dropFile"
					:class="{ enter: isEnter }"
				></span> -->
				<span id="sketch"></span>
			</v-container>

			<!-- SECTION:PlayerCompo（再生操作） -->
			<PlayerCompo ref="player" :frameNum="frameNum" :frameCount="frameCount" :isDoneLoading="isDoneLoading" @emitPlayer="catchFromPlayerCompo" />
		</v-card>
		<!-- </div> -->
	</v-app>
</template>

<script src="https://freshfork.github.io/p5.EasyCam/p5.easycam.min.js"></script>
<script>
import ControllerCompo from '@/components/ControllerCompo.vue'
import PlayerCompo from '@/components/PlayerCompo.vue'
// import KousokudouroGothic from '@/assets/fonts/GDhwGoJA-TTF108b.ttf'
import SawarabiGothic from '@/assets/fonts/sawarabi-gothic-medium.ttf'
import { genMarkeredData, genFramedData } from '@/modules/loadData.js'
import p5 from 'p5'
import { drawCoordinate, drawMarkerLabels, drawMarkers, updateFrameCount, updatePreDrawPlots, updateTempDrawPlots } from '@/modules/p5utils'
// グローバル変数
let isFullScreen = false
let cam = null
let camParameters = {
	r: 300,
	phi: 0, //xz平面（水平面？）に対して
	theta: 0, //yz平面に対して
	lookAt: [0, 0, 0], //原点
}
let tempDrawPlots = {} //NOTE:drawの毎フレームごとに書き換えるテンポラルなプロット
let preDrawPlots = {} //NOTE:for only カメラのlookAt。現在コマのその部位がNanだったときのために、tempDrawPlotsをコピーしとく。
let font

export default {
	name: 'PlayView',
	// SECTION:コンポーネント
	components: { ControllerCompo, PlayerCompo },
	// SECTION:変数
	data() {
		return {
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
			isEnter: false, //D&Dの実装
			files: [],
			dataContent: null,
		}
	},
	// SECTION:関数
	methods: {
		catchFromPlayerCompo(_dataObj) {
			this.state = _dataObj.state
			this.frameCount = _dataObj.frameCount
			this.frameDiff = _dataObj.frameDiff
			console.log('_dataObj（catch from 子コンポ）: ', _dataObj)
		},
		catchKarakurierFromController(_selectedKarakuri) {
			this.selectedKarakuri = _selectedKarakuri
			console.log('this.selectedKarakuri(@親view): ', this.selectedKarakuri)
		},
		catchCamererFromController(_camerer) {
			this.camLookAt = _camerer.lookAt
			console.log('camLookAt: ', this.camLookAt)
		},
		// dragEnter() {
		// 	console.log('Enter Drop Area')
		// 	this.isEnter = true
		// },
		// dragLeave() {
		// 	this.isEnter = false
		// },
		// dropFile(event) {
		// 	// console.log('Dropped File')
		// 	// this.files = [...event.dataTransfer.files]
		// 	// console.log('this.files: ', this.files)
		// 	// const text = load(this.files[0])
		// 	// console.log('loadしたあと: ', text)
		// },
		async loadSelectedFile(_file) {
			this.markeredData = await genMarkeredData(_file)
			this.framedData = await genFramedData(this.markeredData)
			console.log('this.framedData: ', this.framedData)
			this.frameNum = this.markeredData[1].plots.length
			console.log('this.frameNum: ', this.frameNum)
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
			console.log('this.markeredData: ', this.markeredData)
			console.log('this.dataInfo: ', this.dataInfo)
			this.isDoneLoading = true
			window.alert('読み込み完了')
		},
	},
	props: {
		file: {
			type: String,
		},
	},
	// SECTION:ビュー読み込み前処理
	beforeCreate: async function () {
		// ./modules/loadData.jsでファイル読み込み
		document.title = 'karakuri'
	},
	mounted() {
		console.log('isDoneLoading: ', this.isDoneLoading)
		const sketch = (p) => {
			var thi = this //NOTE:vueインスタンスのthisがわり for 自作関数群 TODO:でもthisそれ自体をコピーするってすごく重いんじゃ？？？要チェック。
			let fontReady = false

			function fontRead() {
				fontReady = true
			}
			p.preload = () => {
				// font = p.loadFont('../assets/sawarabi-mincho-medium.ttf')
			}
			// SECTION:setup()
			p.setup = () => {
				// フォント
				p.loadFont(SawarabiGothic, (font) => {
					console.log('Success loading font!')
					p.textFont(font)
					p.textSize(10)
					p.textAlign('CENTER', 'CENTER')
				})
				p.createCanvas(1600, 900, p.WEBGL)
				cam = p.createCamera()
				// NOTE:cam.camera()の引数(7,8,9)番目は、(upY, upX, upZ)の順番？？？(upX,upY,upZ)じゃない！！！！！
				// cam.camera(0, 0, 78, 0, 0, 0, 0, 0, -1, 0)//これにするとupZが-1になって、
				// cam.camera(0, 0, 78, 0, 0, 0, 0, 0, 0, -1)//これにするとupZが0になる
				cam.camera(0, 0, 300, 0, 0, 0, 0, -1, 0, 0) //これにすると所望通り、upYが-1になる。
				console.log('cam: ', cam)
			}
			// SECTION:draw()
			p.draw = () => {
				const t = this.frameCount
				console.log('frameCount: ', t)
				p.background(200)
				if (this.$refs.controller.isShowCoordinate) {
					drawCoordinate(p)
				}
				if (this.isDoneLoading) {
					// 直前フレームプロットの更新（frameCount==0だけ場合わけ）
					preDrawPlots = t == 0 ? this.framedData[t] : updatePreDrawPlots(preDrawPlots, tempDrawPlots)
					// 現在フレームプロットの更新
					tempDrawPlots = updateTempDrawPlots(this.framedData[t])
					// マーカーの描画
					drawMarkers(p, tempDrawPlots, this.$refs.controller.activeMarkers)
					// マーカーラベルの描画
					if (this.$refs.controller.isShowMarkerLabels) {
						drawMarkerLabels(p, tempDrawPlots, this.$refs.controller.activeMarkers)
					}

					// カラクリの描画
					if (this.selectedKarakuri != null) {
						//NOTE:コントローラーで「指定なし」の場合はnull
						karakuriFuncs['drawHuman'](t)
					}
					const lookPoint = preDrawPlots[this.camLookAt]

					updateCam({ _lookAt: [lookPoint.x, lookPoint.y, lookPoint.z] })
					this.frameCount = this.state == 'play' ? updateFrameCount(t, this.frameNum, this.frameDiff) : this.frameCount
				}
			}
			// SECTION:キータイプ操作
			p.keyPressed = () => {
				switch (p.key) {
					case 'f':
						windowResized()
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
						updateCam({ _dTheta: degree })
					}
					// 縦ドラッグ（カメラphi回転）
					else {
						const degree = e.movementY * (Math.PI / 180)
						updateCam({ _dPhi: degree })
					}
					return false //NOTE:ブラウザの標準スクロールを無効化
				} else {
					return true
				}
			}
			// マウスウィール
			p.mouseWheel = (e) => {
				// ・if(上ウィール)lookAt方向にズームアウト（限度あり）
				// ・if(下ウィール)lookAt方向にズームイン（限度あり）
				// NOTE:もともと慣性つき！！！！
				// console.log(e)
				if (e.shiftKey) {
					updateCam({ _dR: e.delta })
					return false //NOTE:ブラウザの標準スクロールを無効化
				} else {
					return true
				}
			}
			// SECTION:p5の自作関数群

			/* 【カメラをアップデートする関数】
			NOTE:lookAt以外の引数は、カメラを変化させたい「差分」
			*/
			function updateCam({ _dR = 0, _dPhi = 0, _dTheta = 0, _lookAt = camParameters.lookAt }) {
				camParameters.r = camParameters.r + _dR
				if (_dR < 0 && camParameters.r <= 0) camParameters.r = 1
				camParameters.phi = camParameters.phi + _dPhi
				if (_dPhi >= 0 && camParameters.phi > Math.PI * 0.5) camParameters.phi = Math.PI * 0.499999
				if (_dPhi <= 0 && camParameters.phi < -Math.PI * 0.5) camParameters.phi = -Math.PI * 0.499999
				camParameters.theta = camParameters.theta + _dTheta

				camParameters.lookAt = _lookAt

				const x = camParameters.lookAt[0] + camParameters.r * Math.cos(camParameters.phi) * Math.sin(camParameters.theta)
				const y = camParameters.lookAt[1] + camParameters.r * Math.sin(camParameters.phi)
				const z = camParameters.lookAt[2] + camParameters.r * Math.cos(camParameters.phi) * Math.cos(camParameters.theta)
				// console.log('camParameters: ', camParameters)

				cam.camera(x, y, z, _lookAt[0], _lookAt[1], _lookAt[2], 0, -1, 0)
				// console.log('cam(updated): ', cam)
			}

			/*【カラクリ描く関数群】
			NOTE:関数名を変数にするテクニック（objでやりくりできちゃう！）
			*/
			const karakuriFuncs = {
				// 基本棒人間
				['drawHuman']: (_frameCount) => {
					// TODO:マーカーの表示/非表示をこれにも対応させる？？
					const t = _frameCount
					let m = {}
					Object.entries(thi.framedData[t]).forEach(([k, v]) => {
						// NOTE:これで「m['マーカー名'].x」みたいな取得・指定ができるようになる
						m[k] = v
					})
					// いざ描画
					p.strokeWeight(1)

					// 各線を登録
					let lines = [
						['FHD', 'JAW'],
						['SHO_R', 'SHO_L'],
						['SHO_R', 'CHE'],
						['CHE', 'SHO_L'],
						['SHO_R', 'ELB_R'],
						['ELB_R', 'WRI_R'],
						['SHO_L', 'ELB_L'],
						['ELB_L', 'WRI_L'],
						['ASI_R', 'ASI_L'],
						['ASI_R', 'KNE_R'],
						['KNE_R', 'ANK_R'],
						['ANK_R', 'TOE_R'],
						['ASI_L', 'KNE_L'],
						['KNE_L', 'ANK_L'],
						['ANK_L', 'TOE_L'],
					]
					// 線たちを描画
					lines.forEach((line) => {
						p.beginShape(p.LINES)
						p.vertex(m[line[0]].x, m[line[0]].y, m[line[0]].z)
						p.vertex(m[line[1]].x, m[line[1]].y, m[line[1]].z)
						p.endShape()
					})
				},
				// 鏡像
				['drawMirror']: () => {
					/*
					tempDrawPointsか、それをコピーしたオブジェクトを生成。m[]みたいな
					コピーしたほうのポジションを、骨盤やら重心を「起点」にして、そこから末端へと位置を決めていく
					鏡像にするには、180°反転するわけだが、鏡像のポジションも、「どの方向から眺めて180°回転か」がある。
					つねに「Y+方向から」でよいのか、あるいはそれはカメラ方向に依存するのか？
					*/
				},
			}
			/*【ウィンドウサイズを変更する関数】*/
			function windowResized() {
				isFullScreen = !isFullScreen
				if (isFullScreen) {
					p.resizeCanvas(p.windowWidth, p.windowHeight)
				} else {
					p.resizeCanvas(1600, 900)
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
