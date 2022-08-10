import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
const storage = getStorage()
console.log('storage: ', storage)

// const folderRef = ref(storage, 'members/bananis.png')

// アップするファイルの参照を取得する関数
function getImageRef(_fullPath) {
	const refference = ref(storage, _fullPath)
	console.log('refferece: ', refference)
	return refference
}

// 画像をダウンロードする関数
async function downloadImage(_storageRef) {
	try {
		const url = await getDownloadURL(_storageRef)
		console.log('uri: ', url)
		return url		
	} catch (error) {
		console.log(error)
	}
}

// 画像をアップロードする関数
async function uploadImage(_storageRef, _file) {
	try {
		const snapshot = await uploadBytes(_storageRef, _file)
		console.log('snapshot: ', snapshot)
		return snapshot
	} catch (error) {
		console.log(error)
	}
}

// 画像を削除する
export async function deleteImage(_fullPath){
	const imageRef = getImageRef(_fullPath)
	try {
		await deleteObject(imageRef)
		return 'ok'		
	} catch (error) {
		console.log(error)
		return null
	}
}

// SECTION:このプロジェクトに特化したutils関数群
// membersフォルダに画像をアップロードする関数
export async function uploadImage2Members(_fullPath, _file) {
	const imageRef = getImageRef(_fullPath)
	try {
		const snapshot = await uploadImage(imageRef, _file)
		console.log('snapshot: ', snapshot)
	} catch (error) {
		console.log(error)
	}
}

export async function downloadImageFromMembers(_fullPath) {
	const imageRef = getImageRef(_fullPath)
	try {
		const url = await downloadImage(imageRef)
		console.log('url: ', url)
        return url
	} catch (error) {
		console.log(error)
	}
}
