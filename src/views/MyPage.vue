<template>
	<div>
		<LoginUI v-if="memberDocData == null" />
		<!-- {{ memberDocData }} -->
		<h2 class="my-10">{{ userName }}さん</h2>
		<v-container class="my-10">
			<v-row justify="center">
				<v-img v-if="photoURL" class="round" max-height="200" max-width="200" :src="photoURL"></v-img>
			</v-row>
			<v-row justify="center" @dragover.prevent @dragenter="onDragEnter" @dragleave="onDragLeave" @drop="onDrop">
				<v-col cols="3"></v-col>
				<v-col cols="6">
					<v-file-input
						v-model="file"
						accept="image/png, image/jpeg, image/bmp"
						prepend-icon="mdi-camera"
						clearable
						counter
						label="画像"
						placeholder="ここに画像をD&D"
						filled						
						:background-color="isDragging ? 'blue' : 'null'"
					>
					</v-file-input>
				</v-col>
				<v-col cols="3"><v-btn v-if="file" dark x-large @click="update">プロフィール画像を更新する</v-btn></v-col>
			</v-row>
		</v-container>
		<v-divider></v-divider>
		<v-card class="mx-auto" max-width="500">
			<v-card-title> 保存データ一覧 </v-card-title>
			<v-card-text>
				<v-list>
					<!-- <v-list-item-group v-model="selectedData"> -->
					<v-list-item v-for="item in memberDocData.dataIDs" :key="item" @click="loadSelectedData(item)">
						<v-list-item-icon><v-icon>mdi-file</v-icon></v-list-item-icon>
						<v-list-item-content>
							<v-list-item-title>{{ item }}</v-list-item-title>
						</v-list-item-content>
					</v-list-item>
					<!-- </v-list-item-group> -->
				</v-list>
			</v-card-text>
		</v-card>
	</div>
</template>

<script>
import { updateMemberDoc, getDataDocData } from '@/modules/firestoreUtils'
import { /* downloadImageFromMembers */ uploadImage2Members, deleteImage, downloadImageFromMembers } from '@/modules/storage'
// import LoginUI from '@/components/LoginUI.vue'

export default {
	name: 'HomeView',
	// SECTION:コンポーネント
	components: {
		// LoginUI,
	},
	// SECTION:変数
	data() {
		return {
			memberDocData: null,
			userName: null,
			userIcon: null,
			photoURL: '',
			file: null,
			isDragging: false,
			dragCount: 0,
			// rules: [(value) => !value || value.size < 2000000 || '2MB以下でお願いします!'],
		}
	},
	props: {
		memberDocData0: Object,
	},
	// SECTION:関数
	methods: {
		async update() {
			console.log('更新ボタンがおされた')
			console.log('this.file: ', this.file)
			try {
				// 画像inputに画像がはいってたら
				if (this.file) {
					// すでにアイコン画像設定済みの場合、storageからその画像を削除
					if (this.memberDocData.photoURL) {
						// docのphotoFileNameを取得し、storageからその該当ファイルを削除する
						const oldFullPath = `members/${this.memberDocData.photoFileName}`
						await deleteImage(oldFullPath)
					}
					// 画像をアップロードする。
					const fileName = this.file.name
					const newFullPath = `members/${fileName}`
					await uploadImage2Members(newFullPath, this.file)
					const url = await downloadImageFromMembers(newFullPath)
					// docのimageURLとphotoFileNameをアップデートする
					const data = {
						photoURL: url,
						photoFileName: fileName,
					}
					const memberID = this.memberDocData.memberID
					await updateMemberDoc(memberID, data)
					location.reload()
				}
				// 画像inputに画像がないとき、画像関連はなにもしない
				// else{

				// }
			} catch (error) {
				console.log(error)
			}
		},
		onDrop(e) {
			e.preventDefault()
			e.stopPropagation()
			this.file = e.dataTransfer.files[0]
			console.log('set file: ', this.file)
			if (this.file.type == 'image/png' || this.file.type == 'image/jpeg' || this.file.type == 'image/bmp') {
				this.isDragging = false
				// NOTE:ここ書き換えてみた↓
				this.file = e.dataTransfer.files[0]
				console.log('set file: ', this.file)
			} else {
				this.file = null
				alert('画像ファイルにしてください！')
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
		async loadSelectedData(_item) {
			console.log(_item)
			try {
				const dataDocData = await getDataDocData(this.memberDocData.memberID, _item)
				console.log('dataDocData: ', dataDocData)
				this.$router.push({ name: 'play', params: { selectedFileData: dataDocData } })
			} catch (error) {
				console.log(error)
			}
		},
	},
	// SECTION:ビュー読み込み前処理
	created: async function () {
		this.memberDocData = this.$memDocData
		console.log('memberDocData@MyPage: ', this.memberDocData)
		this.photoURL =
			this.memberDocData.photoURL != null
				? this.memberDocData.photoURL
				: 'https://firebasestorage.googleapis.com/v0/b/karakuri-2eee3.appspot.com/o/members%2F20200501_noimage.png?alt=media&token=580ec63c-fe20-4308-aac3-431f93c5517b'
		this.userName = this.memberDocData.displayName != null ? this.memberDocData.displayName : this.memberDocData.email
	},
	mounted: async function () {},
}
</script>

<!-- SECTION:CSSスタイルシート -->
<style>
.round {
	border-radius: 50%;
	border: 3px solid #aaaaaa;
}
</style>
