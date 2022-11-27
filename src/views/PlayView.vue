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
							label="ここからcsvファイルを登録"
							filled
							:background-color="isDragging ? 'blue' : 'null'"
							@change="loadSelectedFile(file)"
						></v-file-input>
					</v-col>
					<v-col cols="3"></v-col>
				</v-row>
			</v-container>
			<!-- :::p5スケッチ -->
			<v-container>
				<v-row>
					<!-- <v-col cols="1"><v-btn @click="$refs.controller.toggleLeftMenu()">Lmenu</v-btn></v-col> -->
					<v-col cols="10"><span id="sketch"></span></v-col>
					<!-- <v-col cols="1"><v-btn @click="$refs.controller.toggleRightMenu()">Rmenu</v-btn></v-col> -->
				</v-row>
			</v-container>
			<!-- :::PlayerCompo（再生操作） -->
			<PlayerCompo ref="player" :isDoneLoading="isDoneLoading" :frameNum="frameNum" :frameCount="frameCount" @emitPlayer="catchFromPlayerCompo" />
			<EditorCompo :memberID="memberDocData.memberID" :isDoneLoading="isDoneLoading" :markeredData="markeredData" />
			<!-- :::ControllerCompo（エフェクト操作） -->
			<ControllerCompo
				ref="controller"
				:isDoneLoading="isDoneLoading"
				:frameNum="frameNum"
				:photoURL="memberDocData.photoURL"
				:isEdittingLength = "isEdittingLENGTH"
				:edges = "edges"
				@emitKarakurier="catchKarakurierFromController"				
			/>
			<!-- NOTE:emitCamererを一旦削除 -->
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
import { drawCoordinate, drawMarkerLabels, drawPlots, drawRope, updateFrameCount, updateCam, windowResized, drawSphere, drawHolding } from '@/modules/p5utils'
import { updateTempRate, defaultEdges, drawEdges, drawHuman, drawSHINSHUKU, drawTrails, initTempSHINSHUKU, setTempSHINSHUKU, skeletonModel, updateEdges, updateFramedData } from '@/modules/karakuri'
import { get2dPosFrom3dPos, getNearestMarkerID } from '@/modules/otherUtils.js'
// グローバル変数
let W = 1600
let H = 900 //キャンバスの縦横
let isFullScreen = false
let cam = null
let eyeZ = 300
let camParams = {
	// 【 1-a 】 カメラの外部パラメータ（位置と向き）。直交座標表示ver.
	// → View行列
	x: 0,
	y: 0,
	z: 300,
	lookAt: [0, 0, 0], // カメラ注視点。初期値は原点
	upVec: [0, -1, 0], //カメラ上方向（カメラローカル座標にとってのベクトルで定義）NOTE:p5.js公式の間違いのせいで、y,x,zの順になってるかも？
	// 【 1-b 】 カメラの外部パラメータ（位置と向き）。極座標表示ver.
	r: 300,
	phi: 0, //xz平面（タテY軸まわり）に対する角度、
	theta: 0, //yz平面（ヨコX軸まわり））に対する角度
	// 【 2 】：カメラの内部パラメータ
	// → Projection行列
	fovy: Math.PI / 3, // カメラ視野のタテの開き角度。
	aspect: W / H, // nearPlaneの、w/hのこと。これが現在、二次元画面と同じになってる。
	near: eyeZ / 100, // 3：nearはそのままキョリ
	far: eyeZ * 10, // 4:farもそのまま距離
}
// TODO:骨格モデル（各マーカについて、「親マーカ」と「ボーン伸縮率」を定義するObj）
// let skeleton = skeletonModel
let plots = [] //objの配列
let index = 0
let preIndex = 0
let trailLength = 10
let font

// plotsを現在コマへと更新
function updatePlots(_frameCount, _framedData) {
	plots[index] = _framedData[_frameCount]
	preIndex = index
	index = (index + 1) % trailLength
	// TODO:ガチ動的カラクリは、ここでplots[index]に変形をくわえる。
}

export default {
	name: 'PlayView',
	// :::コンポーネント
	components: { ControllerCompo, PlayerCompo, EditorCompo },
	// :::変数
	data() {
		return {
			memberDocData: null,
			markeredData: [], //データ:マーカーごとver.（SEE:loadData.js）構造は、[{マーカー1の全コマデータ}, {マーカー2の全コマデータ}, ...（以下マーカーの数だけ続く）]
			framedData: [], //データ：コマごとver.（SEE:loadData.js）構造は、[{コマ1の全マーカーデータ}, {コマ2の全マーカーデータ}, ...（以下コマの数だけ続く）]
			edges: [], //どのマーカーどうしを結んでるか？デフォでは、karakuri.jsのedgesから代入。
			dataInfo: null, //↑markeredDataのうち、マーカー名一覧・フレーム数をとって加工
			isDoneLoading: false,
			skeleton: skeletonModel,
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
			isEdittingLENGTH: false,
			
		}
	},
	// :::関数
	methods: {
		catchFromPlayerCompo(_dataObj) {
			this.state = _dataObj.state
			this.frameCount = _dataObj.frameCount
			this.frameDiff = _dataObj.frameDiff
			console.log('this.frameCount: ', this.frameCount)
			updatePlots(this.frameCount, this.framedData)
		},
		catchKarakurierFromController(_selectedKarakuri) {
			this.selectedKarakuri = _selectedKarakuri
			//NOTE:watch()起動。edges[]を更新する。
		},
		// catchCamererFromController(_camerer) {
		// 	this.camLookAt = _camerer.lookAt
		// 	console.log('camLookAt: ', this.camLookAt)
		// },
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
			console.log('ファイルあり')
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
	// :::ビュー読み込み前処理
	beforeCreate: async function () {
		// ./modules/loadData.jsでファイル読み込み
		document.title = 'karakuri'
	},
	created: async function () {
		this.memberDocData = this.$memDocData
		console.log('this.selectedFileData: ', this.selectedFileData)
		this.isDoneLoading = this.selectedFileData ? true : false
		console.log('this.skeleton: ', this.skeleton)
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
			var thi = this //NOTE:vueインスタンスのthisがわり for 以下の自作関数群
			let fontReady = false
			
			let mousePushDuration = 0 //マウス押してから離すまでの時間
			let nearestMarkerID = null
			let isEdittingTSUNAGI = false //つなぐ/はずすのロープの描画モード
			let tsunagiNodeID1 = null
			let tsunagiNodeID2 = null
			let tempSHINSHUKU = {
				id: null,//子ノードID（のばす/ちじめるときにマウスで押したり引っ張ったりするとき）
				parent: null,//親ノードID（のばす/ちじめるの起点になる）
				rate: 1.0,
				p2cVec2d: null,//子ノード-親ノード
				p2cVec3d: null
			}			
						
			function fontRead() {
				fontReady = true
			}

			
			// マウス最近傍マーカーを取得
			function getNearestMarkerID0() {
				// マウスがキャンバス内にあったら
				const m = [p.mouseX, p.mouseY]
				if (m[0] >= 0 && m[0] < W && m[1] >= 0 && m[1] < H) {
					return getNearestMarkerID(plots[preIndex], thi.$refs.controller.activeMarkers, m, camParams)
				} else {
					return null
				}
			}
			p.preload = () => {
				// font = p.loadFont('../assets/sawarabi-mincho-medium.ttf')
			}
			p.setup = () => {
				// p.noLoop()
				// console.log('\n\n!!!!!!!!!!CAUTION!!!!!!!!\nいまはnoLoop()にしてるから映像動かない！！\n!!!!!!!!!!CAUTION!!!!!!!!\n\n')
				p.loadFont(SawarabiGothic, (font) => {
					console.log('Success loading font!')
					p.textFont(font)
					p.textSize(10)
					p.textAlign('CENTER', 'CENTER')
				})
				p.createCanvas(W, H, p.WEBGL)
				p.setAttributes('alpha', false)
				cam = p.createCamera()
				// NOTE:【p5公式のミス】・・・cam.camera()の引数(7,8,9)番目は、(upY, upX, upZ)の順番？？？(upX,upY,upZ)じゃない！！！！！ cam.camera(0, 0, 78, 0, 0, 0, 0, 0, -1, 0)//これにするとupZが-1になって、 cam.camera(0, 0, 78, 0, 0, 0, 0, 0, 0, -1)//これにするとupZが0になる
				cam.camera(0, 0, 300, 0, 0, 0, 0, -1, 0, 0) //これにすると所望通り、upYが-1になる。
				// ↓Projection行列に相当？？
				cam.perspective(camParams.fovy, camParams.aspect, camParams.near, camParams.far)
				console.log('cam: ', cam)
				console.log('trailLength: ', trailLength)
				console.log('いまからupdatePlots()をsetup()内で実行するよ')
				//  plotを初期化しておく（trailLength個）
				for (let i = 0; i < trailLength; i++) {
					let obj = {}
					this.markeredData.forEach((markerObj) => {
						obj[markerObj.id] = {
							name: markerObj.name,
							x: 0,
							y: 0,
							z: 0,
						}
					})
					plots.push(obj)
					// TODO:ここにおいて、テストします
				}
				// console.log('plots: ', plots)
			}

			// :::draw()
			p.draw = () => {
				// NOTE:作業のため、isDoneLoadingにかかわらずキャンバス表示しとく
				if (this.isDoneLoading) {
					const t = this.frameCount
					const OPTIONKEY = p.keyIsDown(p.OPTION) || p.keyIsDown(p.ALT) ? true : false
					const bgColor = OPTIONKEY ? 100 : 200
					p.background(bgColor)

					// 座標系の描画
					if (this.$refs.controller.isShowCoordinate) {
						drawCoordinate(p)
					}

					// 世界球の描画
					if (this.$refs.controller.isShowSphere) {
						drawSphere(p, 300)
					}

					// カラクリの描画
					drawEdges(p, plots[preIndex], this.edges, camParams)

					// optionキー押しっぱで、マウス最近傍マーカーON
					nearestMarkerID = OPTIONKEY ? getNearestMarkerID0() : null


					// マーカーの描画
					drawPlots(p, plots[preIndex], this.$refs.controller.activeMarkers, nearestMarkerID, camParams)
					if(this.selectedKarakuri == 'drawTrails'){
						drawTrails(p, plots, preIndex, trailLength, this.$refs.controller.activeMarkers, camParams)
					}

					// マーカーラベルの描画
					if (this.$refs.controller.isShowMarkerLabels) {
						drawMarkerLabels(p, plots[preIndex], this.$refs.controller.activeMarkers, camParams.theta, camParams.phi)
					}

					// カメラの更新
					const lookPoint = plots[preIndex][this.camLookAt]
					updateCam({ _camParams: camParams, _lookAt: [lookPoint.x, lookPoint.y, lookPoint.z] })
					cam.camera(
						camParams.x,
						camParams.y,
						camParams.z,
						camParams.lookAt[0],
						camParams.lookAt[1],
						camParams.lookAt[2],
						camParams.upVec[0],
						camParams.upVec[1],
						camParams.upVec[2]
					)
					// ⌥キー ∩ クリック中 ∩ 最近傍マーカーあり
					if(OPTIONKEY && p.mouseIsPressed && nearestMarkerID){
						//マウス「ぐーーっ」て押しっぱカウントup					
						if(mousePushDuration <= 40){
							mousePushDuration += 1
							drawHolding(p, plots[preIndex][nearestMarkerID], mousePushDuration)								
						}							
						// 「⌥+長クリック」判定に切り替わった瞬間
						if(!this.isEdittingLENGTH && mousePushDuration > 40){
							this.isEdittingLENGTH = true
							console.log('nearestMarkerID: ', nearestMarkerID)								
							setTempSHINSHUKU(p, plots[preIndex], tempSHINSHUKU, nearestMarkerID, camParams)								
						}
					
					}		
					// TSUNAGI編集中の見た目
					if (isEdittingTSUNAGI) {						
						console.log('isEdittingTSUNAGI なう')			
						drawRope(p, plots[preIndex], tsunagiNodeID1, nearestMarkerID, camParams)
					}
					// NOBASHICHIJIMI編集中の見た目
					if(this.isEdittingLENGTH){
						console.log('isEdittingLENGH: ', this.isEdittingLENGTH)						
						drawSHINSHUKU(p, plots[preIndex], tempSHINSHUKU, camParams)						
					}

					// コマの更新（frameCount）					
					if (this.state == 'play') {
						this.frameCount = updateFrameCount(t, this.frameNum, this.frameDiff)
						this.$refs.player.player.frameCount = this.frameCount //NOTE:PlayerCompoのframeCountも連動させる
						updatePlots(this.frameCount, this.framedData)
					}

					// 最後コマまでいったら、stateをstopにする
					if (this.frameCount == this.frameNum - 1) {
						this.state = 'stop'
						this.$refs.player.player.state = 'stop'
					}
				}
			}
			// :::キータイプ操作
			p.keyReleased = (e) => {								
				//optionキーを離したとき
				if (e.keyCode == 18) {
					console.log('altKeyが離された')
					isEdittingTSUNAGI = false
					tsunagiNodeID1 = null
					tsunagiNodeID2 = null
					this.isEdittingLENGTH = false
					console.log('this.isEdittingLenght: ', this.isEdittingLENGTH)
					initTempSHINSHUKU(tempSHINSHUKU)
				}
				// switch () {
				// 	case 'f':
				// 		windowResized(p, isFullScreen)
				// 		break
				// }
				// NOTE:再生制御のキーボード操作（すべて特殊キー）は、Controllerコンポ内でやる
			}
			// :::マウス操作		
			// マウスを離したとき
			p.mouseClicked = (e) => {
				// console.log('マウス位置: ', p.mouseX)
				// optionキー ∩ 短クリック ∩ 最近傍マーカーあり
				if (e.altKey && (mousePushDuration < 40) && nearestMarkerID) {
					console.log('マウス押してた時間: ', mousePushDuration)
					console.log('⌥ + 短クリック（【むすぶ/ほどく】モード発火')				
					// tsunagiNodeID1だけ選択してる状態
					if(tsunagiNodeID1 && !tsunagiNodeID2){
						tsunagiNodeID2 = nearestMarkerID
						console.log('tsunagiNodeID2: ', tsunagiNodeID2)
						// むすぶ/ほどくを実行
						updateEdges(this.edges, tsunagiNodeID1, tsunagiNodeID2)
						isEdittingTSUNAGI = false
						tsunagiNodeID1 = null, tsunagiNodeID2 = null
					}					
					// tsunagiNodeIDをまだどちらも選択してないとき
					else{
						isEdittingTSUNAGI = true
						console.log('isEdittingTSUNAGI: ', isEdittingTSUNAGI)
						tsunagiNodeID1 = nearestMarkerID
						console.log('tsunagiNodeID1: ', tsunagiNodeID1)
					}					
				}
				// optionキー ∩ 長クリック
				else if(e.altKey && (mousePushDuration > 40)){
					console.log('⌥ + 長いクリックが終わった。のばしおわり。')					
					updateFramedData(tempSHINSHUKU, this.framedData, this.skeleton)
					this.isEdittingLENGTH = false
					console.log('this.isEdittingLENGTH: ', this.isEdittingLENGTH)					
					initTempSHINSHUKU(tempSHINSHUKU)
				}				
				mousePushDuration = 0
			}
			// ダブルクリック
			p.doubleClicked = (e) => {
				if (e.shiftKey) {
					console.log('SHIFT + ダブルクリック')
					// TODO:マウスからの半径をとって、
					this.camLookAt = getNearestMarkerID0()
					console.log('camLookAt: ', this.camLookAt)
					const lookPoint = plots[preIndex][this.camLookAt]
					updateCam({ _camParams: camParams, _lookAt: [lookPoint.x, lookPoint.y, lookPoint.z] })
				}
			}
			// マウスドラッグ
			p.mouseDragged = (e) => {
				// カメラ操作（SHIFT）
				if (e.shiftKey) {
					console.log('shift + ドラッグ')
					const bigger = Math.abs(e.movementX) - Math.abs(e.movementY) >= 0 ? 'x' : 'y'
					// 横ドラッグ（カメラtheta回転）
					if (bigger == 'x') {
						// 度数表記→ラジアン表記
						const degree = e.movementX * (Math.PI / 180)
						updateCam({ _camParams: camParams, _dTheta: degree })
					}
					// 縦ドラッグ（カメラphi回転）
					else {
						const degree = e.movementY * (Math.PI / 180)
						updateCam({ _camParams: camParams, _dPhi: degree })
					}
					return false //NOTE:ブラウザの標準スクロールを無効化
				}else if(this.isEdittingLENGTH){

					updateTempRate(p, tempSHINSHUKU)					
				}else{
					return true
				}
			}				
			// マウスウィール
			p.mouseWheel = (e) => {
				// ・上ウィール：lookAt位置めがけてズームアウト（限度あり）
				// ・下ウィール：lookAt位置めがけてズームイン（限度あり）
				// NOTE:もともと慣性つき！！！！
				if (e.shiftKey) {
					updateCam({ _camParams: camParams, _dR: e.delta })
					return false //NOTE:ブラウザの標準スクロールを無効化
				} else {
					return true
				}
			}
		}
		const sketchInstance = new p5(sketch, 'sketch')
		console.log('sketchInstance: ', sketchInstance)
	},
	watch: {
		// :::プリセットカラクリを選択したとき
		selectedKarakuri(val) {
			if (val == 'drawHuman') {
				this.edges.splice(0)		
				defaultEdges.forEach(edge=>{
					const vec = edge
					this.edges.push(vec)				
				})						
				console.log('this.edges: ', this.edges)	
			}
			// else if(val == 'drawTrails'){
			// 	drawTrails(p, )
			// }
		},
	},
}
</script>

<!-- :::スタイルシート -->
<!-- NOTE:p5のloadFont()がうまく動かんので、CSSから読み込む -->
<style>
.enter {
	border: 10px dotted red;
}
</style>
