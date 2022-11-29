<template>
	<v-app>
		<!-- NOTE:この部分は、全ページ共通。∴ページ遷移時も「更新」されないのだ。 -->
		<v-app-bar app hide-on-scroll scroll-threshold="20" color="white"  height="100"> 
			<v-app-bar-nav-icon class="mx-1" height=80 width="80" @click.stop="showMenu"></v-app-bar-nav-icon>		
			<div class="d-flex align-center">
				<v-app-bar-title>KARAKURI</v-app-bar-title>
				<!-- ここにv-imgでロゴ -->
			</div>
			<v-spacer></v-spacer>
			
		</v-app-bar>

		<v-navigation-drawer v-model="drawer" absolute temporary>
			<v-list>
				<v-list-item-group active-class="blue--text text--accent-4">	
					<v-list-item						
						@click="$router.push({ name: 'home', params: { memberDocData0: memberDocData } })"
					>
						<v-list-item-title>HOME</v-list-item-title>
					</v-list-item>
					<v-list-item						
						@click="$router.push({ name: 'mypage', params: { memberDocData0: memberDocData } })"
					>
						<v-list-item-title>My Page</v-list-item-title>
					</v-list-item>
					<v-list-item						
						@click="$router.push({ name: 'play', params: { memberDocData0: memberDocData } })"
					>
						<v-list-item-title>Play Page</v-list-item-title>
					</v-list-item>
				</v-list-item-group>
			</v-list>
		</v-navigation-drawer>

		<v-main>
			<!-- NOTE:↓に指定のルーティングページの<template>が読み込まれるってこと！ -->
			<router-view />
		</v-main>
	</v-app>
</template>

<script>
// DEBUG:このutilsは名前を変えて、firestore.jsに直接こうした関数を書き込む OR utilsじゃない名前にする
// import { getMemberDocDataWithLINEuID } from './modules/utils.js'
import {/* onAuthStateChanged */} from 'firebase/auth'
import {/* auth */} from '@/modules/authentication.js'
import {/* getMemberDocDataWithMemberID */} from './modules/firestoreUtils'
export default {
	name: 'App',
	data: () => ({
		memberDocData: {},
		// メニュー展開するかいなか
		drawer: false,
	}),
	methods: {
		// ナビゲーションメニュー
		showMenu() {
			this.$vuetify.goTo(0) //一番上までスクロール
			this.drawer = !this.drawer //ドロワー表示
		},
	},
	created: async function () {
		document.title = 'カラクリ'
	},
}
</script>

<style>
/* NOTE:テスト（16進数で色チェックしたいためだけにある） */
#test {
	color: #d2bc40;
	color: #89d2ca;
	color: #dc395f;
}

#app {
	font-family: 'ヒラギノ角ゴシック W7', /* 'Sawarabi Mincho',*/ Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #2c3e50;
}

nav {
	padding: 30px;
}

nav a {
	font-weight: bold;
	color: #2c3e50;
}

nav a.router-link-exact-active {
	color: #f25ed2;
}
</style>