<template>
	<v-app>		
		<div>
			<v-form>
				<v-overlay :value="overlay">
					<v-card min-width="400">
						<v-card-title>ログイン</v-card-title>
						<v-card-subtitle>アカウント未作成ならサインアップする</v-card-subtitle>						
						<v-card-actions>
							<v-container>
								<v-row class="mx-auto"><v-text-field v-model='userEmail' label="メールアドレス" outlined></v-text-field></v-row>
								<v-row class="mx-auto"><v-text-field  v-model='userPassword' type="password" label="パスワード" outlined></v-text-field></v-row>								
                                <v-row class="mx-auto"><v-col><v-btn @click="tryLogIn"><v-icon>mdi-login</v-icon>ログイン</v-btn></v-col></v-row>
                                <v-row class="mx-auto"><v-col><v-btn @click="trySignUp">サインアップ</v-btn></v-col></v-row>
							</v-container>
						</v-card-actions>
					</v-card>
				</v-overlay>
			</v-form>
		</div>
	</v-app>
</template>

<script>
// import { onAuthStateChanged } from 'firebase/auth'
import { setNewMemberDoc } from '@/modules/firestoreUtils.js'
import { logIn, /* auth */ signUp /* authStateChanged,  */ } from '../modules/authentication.js'
export default {
	name: 'LoginUI',
	components: {},
	data() {
		return {
            overlay: true,
			userEmail: null,
			userPassword: null,
            userIcon: null,
			userInfo: null,
            memberDocData: {},
			rules: [(value) => !value || value.size < 2000000 || '2MB以下でお願いします!'],
		}
	},
    props:{        
    },
	methods: {
		/**
		 * 管理パスワードをチェックする関数。認証成功すると、管理者用ホームページへ。
		 */
		async tryLogIn() {
			try {
				this.userInfo = await logIn(this.userEmail, this.userPassword)
				this.$router.push({ name: 'mypage'})
			} catch (error) {
				console.log(error)
			}
		},
		async trySignUp() {
			try {
				this.userInfo = await signUp(this.userEmail, this.userPassword)
                this.memberDocData = {
					dataIDs: ['test'],
                    memberID: this.userInfo.uid,
                    email: this.userInfo.email,
                    displayName: this.userInfo.displayName,
                    accessToken: this.userInfo.accessToken,
                    photoURL: this.userInfo.photoURL,                
                }
                await setNewMemberDoc(this.userInfo.uid, this.memberDocData)
                this.$router.push({ name: 'mypage'})
			} catch (error) {
				console.log(error)
			}
		},
        // emitUserInfo(){
        // },
	},
    mounted: function(){
       
    },
	// // ログインイベントリスナーはここ
	// mounted: async function () {
	// 	// ログイン状態が変化を観察
	// 	onAuthStateChanged(auth, (user) => {
	// 		if (user) {
	// 			this.userInfo = user
	// 			console.log('this.userInfo: ', this.userInfo)
	// 			this.$router.push({ name: 'home', params: { userInfo: this.userInfo } })
	// 		} else {
	// 			console.log('adminログアウトしました')
	// 		}
	// 	})
	// },
}
</script>
