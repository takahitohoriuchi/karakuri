<template>
	<v-app>
		<!-- NOTE:この部分は、全ページ共通。∴ページ遷移時も「更新」されないのだ。 -->
		<v-app-bar app color="base" dark>
			<div class="d-flex align-center">
				<v-app-bar-title>みゅーごく</v-app-bar-title>
				<!-- ここにv-imgでロゴ -->
			</div>
			<v-spacer></v-spacer>
			<!-- SECTION:ナビゲーション -->
			<v-btn text @click="$router.push({ name: 'home', params: {memberDocData0: memberDocData} })">HOME</v-btn>
			|
			<v-btn text @click="$router.push({ name: 'mypage', params:{memberDocData0: memberDocData} })">マイページ</v-btn>
			|
			<v-btn text @click="$router.push({ name: 'play', params: {memberDocData0: memberDocData}  })">再生ビュー</v-btn>
		</v-app-bar>

		<v-main>
			<!-- NOTE:↓に指定のルーティングページの<template>が読み込まれるってこと！ -->
			<router-view />
		</v-main>
	</v-app>
</template>

<script>
// DEBUG:このutilsは名前を変えて、firestore.jsに直接こうした関数を書き込む OR utilsじゃない名前にする
// import { getMemberDocDataWithLINEuID } from './modules/utils.js'
import { /* onAuthStateChanged */ } from 'firebase/auth'
import {/* auth */} from '@/modules/authentication.js'
import { /* getMemberDocDataWithMemberID */ } from './modules/firestoreUtils'
export default {
	name: 'App',
	data: () => ({
		memberDocData: {},		
	}),
	created: async function () {				
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
