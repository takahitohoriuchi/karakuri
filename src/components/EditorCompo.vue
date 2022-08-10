<template>
	<!-- <span v-if="isDoneLoading">	 -->
	<div>		
        <v-divider></v-divider>
		<v-card color="palebase" class='mx-15' min-height="200">
			<v-card-title> 
                編集する
            </v-card-title>
			<v-card-text>
				<v-container>
					<v-row justify="center">
						<v-btn x-large dark @click="saveData">保存する</v-btn>
					</v-row>
				</v-container>
			</v-card-text>
		</v-card>

		<!-- </v-bottom-navigation> -->
	</div>
</template>

<script>
import { saveMarkeredData } from '@/modules/firestoreUtils'
// import Open from '@/assets/sounds/open.mp3'
// import Close from '@/assets/sounds/close.mp3'
export default {
	name: 'EditorCompo',
	// SECTION:コンポーネント
	components: {},
	// SECTION:変数
	data() {
		return {
            // memberDocData: null,
        }
	},
	props: {
        memberID: String,
		isDoneLoading: Boolean,
        markeredData: Array
	},
	// SECTION:関数
	methods: {
        async saveData(){
            await saveMarkeredData(this.markeredData, this.memberID, 'test')
        }
    },
	mounted() {
		// document.addEventListener('keydown', this.onKeyDown)
	},
	beforeDestroy() {
		// document.removeEventListener('keydown', this.onKeyDown)
	},
}
</script>
