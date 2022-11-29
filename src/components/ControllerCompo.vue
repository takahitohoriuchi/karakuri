<template>
	<span v-if="isDoneLoading">
		<!-- :::左メニュー -->
		<v-navigation-drawer v-model="isLeftMenu" :width=500  absolute>
			<v-list>
				<v-list-item class="px-2">
					
					<v-list-item-title class="text-h6"><h2>カラクリUI</h2></v-list-item-title>
					<v-list-item-avatar size="80">
						<v-img :src=photoURL></v-img>
					</v-list-item-avatar>
				</v-list-item>						
				<v-list-item>
					<v-list-item-content>						
						<v-list-item-subtitle>Let's tinker around.	</v-list-item-subtitle>
					</v-list-item-content>
				</v-list-item>
			</v-list>
			<v-divider></v-divider>
			<v-expansion-panels accordion multiple :value="[0, 1, 2, 3, 4, 5]">				
				<!-- ベーシックカラクリ -->
				<v-expansion-panel>
					<v-expansion-panel-header>{{ panelMenu[1].name }}</v-expansion-panel-header>
					<v-expansion-panel-content>
						<v-chip-group column v-model="selectedKarakuriIndex">
							<v-chip v-for="karakuri in karakuris" :key="karakuri.name" @click="emitKarakurier(karakuri.func)" filter outlined>{{
								karakuri.name
							}}</v-chip>
						</v-chip-group>						
					</v-expansion-panel-content>
				</v-expansion-panel>
				<!-- マーカー表示 -->
				<v-expansion-panel>
					<v-expansion-panel-header>{{ panelMenu[2].name }}</v-expansion-panel-header>
					<v-expansion-panel-content>
						<v-container
							><v-row>								
								<v-col cols="5"><v-btn @click="updateAllActiveMarkers">すべて表示/非表示</v-btn></v-col>
								<v-col cols="5"><v-btn @click="updateActiveMarkers(edges)">孤立ノード非表示</v-btn></v-col>
							</v-row>
							<v-row>
								<v-switch v-model="isShowMarkerLabels" inset label="ラベルも見る？"></v-switch>
							</v-row>						
						</v-container>
						<!-- NOTE:20221029activeMarkerを整数値配列から、マーカーID配列にかえた -->
						<!-- <v-chip-group v-model="activeMarkers" column multiple>
							<v-chip v-for="info in dataInfo" :key="info.name" filter outlined>{{ info.name }}</v-chip>
						</v-chip-group> -->
					</v-expansion-panel-content>
				</v-expansion-panel>
				<!-- その他表示設定 -->
				<v-expansion-panel>
					<v-expansion-panel-header>{{ panelMenu[3].name }}</v-expansion-panel-header>
					<v-expansion-panel-content>
						<v-switch v-model="isShowCoordinate" inset label="座標系の表示"></v-switch>
						<v-switch v-model="isShowSphere" inset label="世界球の表示"></v-switch>
					</v-expansion-panel-content>
				</v-expansion-panel>
			</v-expansion-panels>
		</v-navigation-drawer>
		<!-- ::: 右メニュー -->
		<v-navigation-drawer hide-overlay stateless right color="rgba(255,255,255,0.6)" v-model="isRightMenu" :width=400 absolute>
			<!-- メニューのタイトル -->
			<v-list>
				<v-list-item class="px-2">					
					<v-list-item-title class="text-h6"><h2>ことば</h2></v-list-item-title>
					<v-list-item-avatar size="80">
						<v-img :src=photoURL></v-img>
					</v-list-item-avatar>
				</v-list-item>						
				<v-list-item>
					<v-list-item-content>						
						<v-list-item-subtitle>象りと指し示し</v-list-item-subtitle>
					</v-list-item-content>
				</v-list-item>
			</v-list>
			<!-- メタ認知 -->
			<div class="pa-3">
				<v-chip-group column active-class="primary" v-model="currentHyojo">
					<v-chip large close v-for="(item, i) in kotobas" :key="i" :value="item" @click:close="removeHyojo(i)"><v-icon left></v-icon>{{item.onomatopoeia}}</v-chip>					
					<v-chip large @click="addKotoba"><v-icon>mdi-plus</v-icon></v-chip>
				</v-chip-group>
				
				<div class="my-5" v-if="currentHyojo">
					<v-text-field outlined rounded label="表情名" v-model="currentHyojo.onomatopoeia"></v-text-field>				
					<v-textarea filled class="text-body-1" auto-grow label="つらつら記述" v-model="currentHyojo.text"></v-textarea>
					<v-container>
					<v-row justify="end">
						<!-- <v-switch inset v-model="currentHyojoLock" label="現在のカラクリと紐づける"></v-switch> -->
						<v-btn class="mx-5" @click="updateHyojoKarakuri">現在のカラクリと紐付ける</v-btn>
						<v-btn icon @click=kotobas.splice(i,1)><v-icon large>mdi-delete-circle</v-icon></v-btn>
					</v-row>						
					</v-container>
				</div>						
			</div>								
		</v-navigation-drawer>
	</span>
</template>

<script>
import Open from '@/assets/sounds/open.mp3'
import Close from '@/assets/sounds/close.mp3'
import Nijimi from '@/assets/sounds/nijimi.mp3'
import Attatch from '@/assets/sounds/attatch.mp3'
import Detatch from '@/assets/sounds/detatch.mp3'
import HyojoIcon from '@/assets/images/hyojo.png'

export default {
	name: 'ControllerCompo',
	// SECTION:コンポーネント
	components: {},
	// SECTION:変数
	data() {
		return {
			isLeftMenu: false,
			isRightMenu: false,
			camerer: {
				perspective: 'tp',
				lookAt: 'COM',
			},
			displayer: {},
			isShowMarkerLabels: true,
			isShowCoordinate: true,
			isShowSphere: false,
			karakuris: [
				{
					name: 'なし',
					func: null,
				},				
				{
					name: '基本棒人間',
					func: 'drawHuman',
				},
				{
					name: '全リセット',
					func: 'detatchAll',
				},
				{
					name: '全連結',
					func: 'attatchAll'
				},
				{
					name: '軌跡',
					func: 'drawTrails'
				},	
			],
			selectedKarakuriIndex: 0,
			trail: 10,
			dataInfo: [],
			activeMarkers: [],
			// camLookAtMarkers: [],
			isEdittingLength2: false,
			// panel:
			panelMenu: [
				{
					name: 'キャメラどこみる？',
					content: 'う',
				},
				{
					name: 'プリセットカラクリ',
					content: 'い',
				},
				{
					name: '●の表示',
				},
				{
					name: 'その他表示設定',
					content: 'あ',
				},
			],
			currentHyojo: null,
			currentHyojoLock : false,
			kotobas: [
				{
					onomatopoeia: 'さっくり',
					text: 'なんかすごいしっくりくる',
					// TODO:ほんとは、カメラなりマーカーなりの現在設定情報のオブジェクト
					// TODO:何コマから何コマかも保存されている
				}
			],
			sounds: {
				open: new Audio(Open),
				close: new Audio(Close),
				nijimi: new Audio(Nijimi),
				attatch: new Audio(Attatch),
				detatch: new Audio(Detatch),
			},
			icons: {
				HyojoIcon
			},
			
		}
	},
	props: {
		// dataInfo: Array,
		frameNum: Number,
		isDoneLoading: Boolean,
		photoURL: String,
		isEdittingLength: Boolean,
		edges: Array
	},
	// SECTION:関数
	methods: {
		emitKarakurier(_karakuriFunc) {
			// this.$emit('emitKarakurier', _karakuriFunc, _options)			
			this.$emit('emitKarakurier', _karakuriFunc)
		},
		// emitCamerer(_markerId) {
		// 	this.camerer.lookAt = _markerId
		// 	console.log('this.camerer.lookAt: ', this.camerer.lookAt)
		// 	this.$emit('emitCamerer', this.camerer)
		// },
		// emitDisplayer() {
		// 	this.$emit('emitDisplayer', this.)
		// },
		loadDataInfo(_dataInfo) {
			//NOTE::親のPlayViewから発火させられるメソッド
			this.dataInfo = _dataInfo
			// this.activeMarkers = [...Array(this.dataInfo.length)].map((_, i) => i) //NOTE:v-chipのfilterは、整数値の配列にすることに注意。
			this.activeMarkers = this.dataInfo.map(markerObj=>{return markerObj.id})
			// this.camLookAtMarkers = [...Array(this.dataInfo.length)].map((_, i) => i) //NOTE:v-chipのfilterは、整数値の配列にすることに注意。
			console.log('this.activeMarkers: ', this.activeMarkers)
		},							
		updateAllActiveMarkers() {
			if(this.activeMarkers.length > 0){
				this.activeMarkers.splice(0)
			}else{
				console.log('this.dataInfo: ', this.dataInfo)
				this.activeMarkers = this.dataInfo.map(markerObj=>{return markerObj.id})
			}			
			console.log('this.activeMarkers: ', this.activeMarkers)
		},
		updateActiveMarkers(_edges){			
			console.log('this.activeMarkers ', this.activeMarkers)
			// edgesのforEachでedgeで、[0]と「１」を調べて、
			let array = []
			_edges.forEach(edge=>{
				array.push(edge[0])
				array.push(edge[1])
			})
			// activeMarkersを削除して、
			this.activeMarkers.splice(0)
			// そこにあるものだけ、activeMarkersに登録する。（重複削除して）
			this.activeMarkers = Array.from(new Set(array))
			console.log('this.activeMarkers ', this.activeMarkers)
			
		},
		toggleLeftMenu() {
			console.log('open L menu')
			this.isLeftMenu = !this.isLeftMenu
			if (this.isLeftMenu) {
				this.sounds.open.play()
			} else {
				this.sounds.close.play()
			}
		},
		toggleRightMenu() {
			console.log('open R menu')
			this.isRightMenu = !this.isRightMenu
			if (this.isRightMenu) {
				this.sounds.open.play()
			} else {
				this.sounds.close.play()
			}
		},
		onKeyDown(e) {			
			switch (e.keyCode) {
				case 9: // tabキー・・・左メニュー
					e.preventDefault()
					this.toggleLeftMenu()
					break
				case 221: // ]}キー・・・右メニュー
					e.preventDefault()
					this.toggleRightMenu()
					break
				// case 18: //option(alt)キー・・・カラクリ
				// 	e.preventDefault()
				// 	console.log('optionキーを押した')
				// 	break
				default:
					break
			}
		},
		addKotoba(){
			const kotobaObj = {
				onomatopoeia: 'new',
				text:'',
			}
			this.kotobas.push(kotobaObj)
			const lastNum = this.kotobas.length-1
			// this.currentHyojo = null			
			this.currentHyojo = this.kotobas[lastNum]
			console.log('this.currentHyojo: ', this.currentHyojo)
		},
		removeHyojo(_i){
			if(confirm('削除していいですか？')){
				this.kotobas.splice(_i,1)
			}
			
		},
		showcurrentHyojo(){
			console.log('this.currentHyojo: ', this.currentHyojo)
		},
		updateHyojoKarakuri(){

		}
	},
	watch: {
		isEdittingLength(val){
			console.log('isEdittingLength in Controller: ', this.isEdittingLength)
			if(val == true){				
				this.sounds.nijimi.play()
			}
		},
		currentHyojo(val){
			console.log('currentHyojo: ', val)
			this.$emit('emitCurrentHyojo', val)

		}
	},
	// キーボード入力イベントの定義
	mounted() {
		document.addEventListener('keydown', this.onKeyDown)
	},
	// キーボード入力イベントを削除しとく
	beforeDestroy() {
		document.removeEventListener('keydown', this.onKeyDown)
	},
	
}
</script>


/* DEBUG:ここにkotoba.textやkotoba.onomatopoeiaのものを書く */
<style scoped>
.kotoba-text.v-text-field input {
  font-size: 0.3em;
  padding: 0 !important;
}

</style>
