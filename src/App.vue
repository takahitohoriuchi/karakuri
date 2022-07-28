<template>
	<v-app>
		<v-app-bar app color="#bdbdbd" dark>
			<div class="d-flex align-center">
				<v-app-bar-title>身体運動表情を・・・</v-app-bar-title>
				<!-- ここにv-imgでロゴ -->
			</div>
			<v-spacer></v-spacer>
		</v-app-bar>

		<v-main>
			<!-- SECTION:ナビゲーション -->
			<nav><router-link to="/"> HOME </router-link> | <router-link to="/loader"> 読み込みビュー </router-link> | <router-link to="/play"> 再生ビュー </router-link> |</nav> 
			<!-- SECTION:ナビゲーション -->

			<router-view />
		</v-main>
	</v-app>
</template>

<script>
export default {
	name: 'App',
	data: () => ({
		//
	}),
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
	font-family: 'ヒラギノ角ゴシック W7',/* 'Sawarabi Mincho',*/ Avenir,  Helvetica, Arial, sans-serif;
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
