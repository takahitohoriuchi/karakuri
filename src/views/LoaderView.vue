<!-- <template>
	<div class="loader">
		<h1>読み込みビュー</h1>
		<v-card>
			<v-list dense>
				<v-subheader>ファイル</v-subheader>
				<v-list-item-group color="primary">
					<v-list-item v-for="(file, i) in files" :key="i" @click="go2PlayView(file)">
						<v-list-item-icon>
							<v-icon v-text="file"></v-icon>
						</v-list-item-icon>
						<v-list-item-content>
							<v-list-item-title v-text="file"></v-list-item-title>
						</v-list-item-content>
					</v-list-item>
				</v-list-item-group>
			</v-list>
		</v-card>
	</div>
</template>

<script>
// import router from '@/router'
// import {showAllData} from '@/modules/loadData.js'

export default {
	name: 'LoaderView',
	// SECTION:コンポーネント
	components: {},
	// SECTION:変数
	data() {
		return {
			files: ['badSnatch.csv', 'test.txt'],
		}
	},
	// SECTION:関数
	methods: {
		go2PlayView(_file){
			const filePath = '../assets/data/' + _file
			// const filePath = _file
			// const filePath = './src/assets/data/' + _file
			
			this.$router.push({ name: 'play', params: { file: filePath } })
		},
	},
	// SECTION:ビュー読み込み前処理
	beforeCreate: async function () {
		// showAllData()
		// thi.files[]にの名前が書かれた四角く表示を羅列する。クリックでそれを読み込んでpushする。
	},
	mounted() {},
}
</script> -->
