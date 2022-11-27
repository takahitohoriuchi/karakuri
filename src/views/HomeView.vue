<template>
	<div>
		<h1>HOME</h1>
		<LoginUI v-if="memberDocData == null" />
	</div>
</template>

<script>
import { /* onAuthStateChanged */ } from 'firebase/auth'
import { /* auth */ } from '@/modules/authentication.js'
import LoginUI from '@/components/LoginUI.vue'
import { /* getMemberDocDataWithMemberID */ } from '@/modules/firestoreUtils'

export default {
	name: 'HomeView',
	// SECTION:コンポーネント
	components: {
		LoginUI,
	},
	// SECTION:変数
	data() {
		return {			
			memberDocData: null,
		}
	},
	props: {
		memberDocData0: Object,
	},
	// SECTION:関数
	methods: {},
	// SECTION:ビュー読み込み前処理
	created: async function () {
		this.memberDocData = this.$memDocData
		console.log('memberDocData@HomeView: ', this.memberDocData)	
		this.$router.push({ name: 'mypage'})		
	},
	mounted: function () {
		console.log('Domマウント完了（@HomeView.vue)')
	},
}
</script>
