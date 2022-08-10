/* NOTE:
さまざまな汎用的な便利関数をここで保管
*/

import { getCollectionRef, getDocSnaps, getDocRef, setaDoc, getDocSnap, updateaDoc, deleteaDoc } from './firestore.js'
// import Hashids from 'hashids'

// SECTION:なんでも系
/**
 * 好きな時間処理を止めて、その後に指定した関数を実行する
 * @param {*} waitSec
 * @param {*} callbackFunc
 */
export function sleep(waitSec, callbackFunc) {
	// 経過時間（秒）
	var spanedSec = 0
	// 1秒間隔で無名関数を実行
	var id = setInterval(function () {
		spanedSec++
		// 経過時間 >= 待機時間の場合、待機終了。
		if (spanedSec >= waitSec) {
			// タイマー停止
			clearInterval(id)
			// 完了時、コールバック関数を実行
			if (callbackFunc) callbackFunc()
		}
	}, 1000)
}

// SECTION:DB操作（会員doc系）
/**
 * その会員のdocを検索して返す関数（LINEuIDをキーに）
 * @param {string} _collectionName
 * @param {string} _LINEuID
 * @returns {object} docData（会員docの内容）
 */
export async function searchMyDocData(_collectionName, _LINEuID) {
	const membersCollectionRef = getCollectionRef('members')
	const queryObj = {
		1: ['LINEuID', '==', _LINEuID],
	}
	let docData = null
	try {
		const docsnaps = await getDocSnaps(membersCollectionRef, queryObj)
		docsnaps.forEach((docsnap) => {
			docData = docsnap.data()
		})
		console.log('docData: ', docData)
	} catch (error) {
		console.log(error)
	}
	return docData
}

/**
 * 新しい会員docを生成する関数
 * @param {*} _memberID
 * @param {*} _data
 */
export async function setNewMemberDoc(_uid, _data) {
	const memberID = _uid
	console.log('memberID: ', memberID)
	// 生成docデータに「memberID」キーを追加する
	let data = _data
	data.memberID = memberID
	const docRef = getDocRef(`members/${memberID}`)
	try {
		await setaDoc(docRef, _data)
	} catch (error) {
		console.log(error)
	}
}

/**
 * 会員docを取得（memberIDで指定ver.）
 * @param {string} _memberID
 * @returns {object / null}
 */
export async function getMemberDocDataWithMemberID(_memberID) {
	const docRef = getDocRef(`members/${_memberID}`)
	try {
		const docSnap = await getDocSnap(docRef)
		if (docSnap != null) {
			const data = docSnap.data()
			return data
		} else {
			return null
		}
	} catch (error) {
		console.log(error)
	}
}

/**
 * 会員docを更新（memberIDで指定）
 * @param {*} _memberID
 * @param {*} _data
 * NOTE:更新のさいのキーは「memeberID」のみ（LINEuIDではやらない）
 */
export async function updateMemberDoc(_memberID, _data) {
	const docRef = getDocRef(`members/${_memberID}`)
	try {
		await updateaDoc(docRef, _data)
	} catch (error) {
		console.log(error)
	}
}

/**
 * 条件にあてはまる会員docたちを取得
 * @param {*} _queryObj
 * @returns
 */
export async function searchMemberDocs(_queryObj) {
	const collectionRef = getCollectionRef('members')
	let docDatas = []
	try {
		const docsnaps = await getDocSnaps(collectionRef, _queryObj)
		if (docsnaps != null) {
			docsnaps.forEach((docsnap) => {
				docDatas.push(docsnap.data())
			})
			return docDatas
		} else {
			return null
		}
	} catch (error) {
		console.log(error)
		return null
	}
}
/**
 * 会員docを削除（memberIDで指定）
 * @param {*} _memberID
 * NOTE:削除のさいのキーは「memberID」のみ（LINEuIDではやらない）
 */
export async function deleteMemberDoc(_memberID) {
	const docRef = getDocRef(`members/${_memberID}`)
	try {
		await deleteaDoc(docRef)
	} catch (error) {
		console.log(error)
	}
}

// SECTION:プロットデータ

/**
 * このmemberのサブコレにサブdocを新規登録
 * @param {*} _markeredData 
 * @param {*} _memberID 
 * @param {*} _fileName 
 */
export async function saveMarkeredData(_markeredData, _memberID, _fileName){
	let data = {}
	_markeredData.forEach(markerObj=>{		
		const id = markerObj.id
		data[id] = {
			id: id,
			name: markerObj.name,
			plots: markerObj.plots
		}
	})
	console.log('サブdocに保存するデータ内容: ', data)
	const docRef = getDocRef(`members/${_memberID}/data/${_fileName}`)
	try {
		await setaDoc(docRef, data)		
	} catch (error) {
		console.log(error)
	}
}

// TODO:サブコレにあるサブdoc名一覧を取得
// memberDocに保存dataIDの配列を作る必要アリ。

// TODO:選択したサブdocの中身を取得
export async function getDataDocData(_memberID, _dataID){
	const subDocRef = getDocRef(`members/${_memberID}/data/${_dataID}`)
	try {
		const docsnap = await getDocSnap(subDocRef)
		return docsnap.data()
	} catch (error) {
		console.log(error)
	}
}

// TODO:再生中のサブdocのfavSettingsを保存する（サブdocの一部update）
