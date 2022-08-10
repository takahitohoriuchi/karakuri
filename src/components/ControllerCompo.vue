<template>
	<span v-if="isDoneLoading">
		<!-- SECTION:左メニュー -->
		<v-navigation-drawer v-model="isLeftMenu" :width=500 temporary absolute>
			<v-list>
				<v-list-item class="px-2">
					<v-list-item-avatar size="80">
						<v-img :src=photoURL></v-img>
					</v-list-item-avatar>
					<v-list-item-title class="text-h6"><h2>カラクリUI</h2></v-list-item-title>
				</v-list-item>

				<v-list-item>
					<v-list-item-content>						
						<v-list-item-subtitle>あれこれ設定</v-list-item-subtitle>
					</v-list-item-content>
				</v-list-item>
			</v-list>
			<v-divider></v-divider>
			<v-expansion-panels accordion multiple :value="[0, 1, 2, 3, 4, 5]">
				<!-- キャメラeffects -->
				<v-expansion-panel>
					<v-expansion-panel-header>{{ panelMenu[0].name }}</v-expansion-panel-header>
					<v-expansion-panel-content>
						<v-chip-group v-model="camLookAtMarkers" column>
							<v-chip v-for="info in dataInfo" :key="info.name" filter outlined @click="emitCamerer(info.id)">{{ info.name }}</v-chip>
						</v-chip-group>
						<!-- <v-switch v-model="isShowCoordinate" inset label="座標系の表示"></v-switch> -->
					</v-expansion-panel-content>
				</v-expansion-panel>
				<!-- ベーシックカラクリ -->
				<v-expansion-panel>
					<v-expansion-panel-header>{{ panelMenu[1].name }}</v-expansion-panel-header>
					<v-expansion-panel-content>
						<v-chip-group column v-model="selectedKarakuriIndex">
							<v-chip v-for="karakuri in karakuris" :key="karakuri.name" @click="emitKarakurier(karakuri.func)" filter outlined>{{
								karakuri.name
							}}</v-chip>
						</v-chip-group>
						<!-- <v-container v-if="karakuris[selectedKarakuriIndex].name == '軌跡'">
							<v-row>
								<v-slider
							label="軌跡の長さ"
							v-model="trail"
							:min=20
							:max=10
							:thumb-size="20"
							@change="emitKarakurier(karakuri.func, {trailLength: trail})"
							thumb-label="always"
						></v-slider>
							</v-row>
						</v-container> -->
					</v-expansion-panel-content>
				</v-expansion-panel>
				<!-- マーカー表示 -->
				<v-expansion-panel>
					<v-expansion-panel-header>{{ panelMenu[2].name }}</v-expansion-panel-header>
					<v-expansion-panel-content>
						<v-container
							><v-row>
								<v-col><v-btn @click="deleteAllActiveMarkers">すべて非表示</v-btn></v-col>
								<v-col><v-btn @click="setAllActiveMarkers">すべて表示</v-btn></v-col>
							</v-row></v-container
						>
						<v-switch v-model="isShowMarkerLabels" inset label="ラベルの表示"></v-switch>
						<v-chip-group v-model="activeMarkers" column multiple>
							<v-chip v-for="info in dataInfo" :key="info.name" filter outlined>{{ info.name }}</v-chip>
						</v-chip-group>
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
		<!-- SECTION: 右メニュー -->
		<v-navigation-drawer right v-model="isRightMenu" :width=400 temporary absolute>
			<v-list>
				<!-- <v-list-item class="px-2">
					<v-list-item-avatar>
						<v-img src="https://gyazo.com/47bbb080bc375399ae32c48c2f7cc674/max_size/1000"></v-img>
					</v-list-item-avatar>
				</v-list-item> -->
				<v-list-item>
					<v-list-item-content>
						<v-list-item-title class="text-h6"><h3>キー操作</h3></v-list-item-title>
						<v-list-item-subtitle>はこうやれ</v-list-item-subtitle>
					</v-list-item-content>
				</v-list-item>
				<v-divider></v-divider>

				<v-list-item three-line v-for="(item, i) in how2ControllWithKey" :key="i">
					<v-list-item-icon
						><v-icon>{{ item.icon }}</v-icon></v-list-item-icon
					>
					<v-list-item-content>
						<v-list-item-title class="text-h6"> {{ item.controllname }}</v-list-item-title>
						<v-list-item-subtitle>{{ item.discription }}</v-list-item-subtitle>
						<v-list-item-subtitle>{{ item.keyname }}</v-list-item-subtitle>
					</v-list-item-content>
				</v-list-item>
			</v-list>
		</v-navigation-drawer>
	</span>
</template>

<script>
import Open from '@/assets/sounds/open.mp3'
import Close from '@/assets/sounds/close.mp3'
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
					name: '軌跡',
					func: 'drawTrails'
				},
				{
					name: '鏡像',
					func: 'drawMirror',
				},
			],
			selectedKarakuriIndex: 0,
			trail: 10,
			dataInfo: null,
			activeMarkers: [],
			camLookAtMarkers: [],
			// panel:
			panelMenu: [
				{
					name: 'キャメラどこみる？',
					content: 'う',
				},
				{
					name: 'ベーシックカラクリ',
					content: 'い',
				},
				{
					name: 'マーカー表示',
				},
				{
					name: 'その他表示設定',
					content: 'あ',
				},
			],
			how2ControllWithKey: [
				{
					icon: 'mdi-apple-keyboard-control',
					controllname: '再生/一時停止',
					discription: '',
					keyname: 'スペースキー',
				},
				{
					icon: '→/←',
					controllname: 'コマ送り/戻し',
					discription: '※一時停止中のみ',
					keyname: '左右矢印キー',
				},
				{
					controllname: 'ズームin/out',
					discription: '（to カメラ注視点）',
					keyname: 'shift + scroll(等)',
				},
				{
					icon: "'mdi-apple-keyboard-shift'",
					controllname: 'カメラ移動',
					discription: '（カメラ注視点まわり）',
					keyname: 'shift + ドラッグ',
				},
				{
					controllname: '左menu出し入れ',
					discription: '',
					keyname: '"ctrl"キー（左小指に）',
				},
				{
					controllname: '右menu出し入れ',
					discription: '',
					keyname: ' "]}"キー（右小指に）',
				},
			],
			sounds: {
				open: new Audio(Open),
				close: new Audio(Close),
			},
		}
	},
	props: {
		// dataInfo: Array,
		frameNum: Number,
		isDoneLoading: Boolean,
		photoURL: String	
	},
	// SECTION:関数
	methods: {
		emitKarakurier(_karakuriFunc) {
			// this.$emit('emitKarakurier', _karakuriFunc, _options)			
			this.$emit('emitKarakurier', _karakuriFunc)
		},
		emitCamerer(_markerId) {
			this.camerer.lookAt = _markerId
			console.log('this.camerer.lookAt: ', this.camerer.lookAt)
			this.$emit('emitCamerer', this.camerer)
		},
		// emitDisplayer() {
		// 	this.$emit('emitDisplayer', this.)
		// },
		loadDataInfo(_dataInfo) {
			//NOTE::親のPlayViewから発火させられるメソッド
			this.dataInfo = _dataInfo
			this.activeMarkers = [...Array(this.dataInfo.length)].map((_, i) => i) //NOTE:v-chipのfilterは、整数値の配列にすることに注意。
			this.camLookAtMarkers = [...Array(this.dataInfo.length)].map((_, i) => i) //NOTE:v-chipのfilterは、整数値の配列にすることに注意。
			console.log('this.activeMarkers: ', this.activeMarkers)
		},
		deleteAllActiveMarkers() {
			this.activeMarkers.splice(0)
			console.log('this.activeMarkers: ', this.activeMarkers)
		},
		setAllActiveMarkers() {
			this.activeMarkers = [...Array(this.dataInfo.length)].map((_, i) => i)
			console.log('this.activeMarkers: ', this.activeMarkers)
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
				case 17: // ctrlキー
					e.preventDefault()
					this.toggleLeftMenu()
					break
				case 221: // ]}キー
					e.preventDefault()
					this.toggleRightMenu()
					break
				default:
					break
			}
		},
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

<style></style>
