import Vue from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'

// DB初期読み込みのためのモジュールたち
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/modules/authentication.js'
import { getMemberDocDataWithMemberID } from '@/modules/firestoreUtils'

Vue.config.productionTip = false

/**
 * この関数内で、グローバル変数も宣言（最初にDBから読み込んでおいて、どのページでも使いたい変数など。）
 * NOTE:コンポからグローバル変数を参照するには、「this.$変数名」で取得。
 */
async function init() {
	onAuthStateChanged(auth, async (user) => {
		if (user) {
			console.log('ログイン済みです（@main.js）')
			Vue.prototype.$memDocData = await getMemberDocDataWithMemberID(user.uid)
			console.log('Vue.prototype.$memDocData: ', Vue.prototype.$memDocData)
      // memDocDataを読み込んだあとに、Vueインスタンスを生成する
			new Vue({
				router,
				vuetify,
				render: (h) => h(App),
			}).$mount('#app')
		} else {
			console.log('未ログイン状態です')
			new Vue({
				router,
				vuetify,
				render: (h) => h(App),
			}).$mount('#app')
		}
	})
}

init()
