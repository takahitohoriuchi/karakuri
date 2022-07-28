// /* firestoreへの参照をつくる
// 将来のリファクタリングを考えると、ここで独自関数をつくっとくのが得策か？
// firestoreの構文は、SEE:https://scrapbox.io/discus4372-18115953/firestore%E3%81%82%E3%82%8C%E3%81%93%E3%82%8C
// */

// // NOTE:ESMの場合SEE:https://cloud.google.com/firestore/docs/quickstart-mobile-web?hl=ja
// // import { initializeApp } from 'firebase/app'
// import { firebaseApp } from './firebaseApp'
// import { getFirestore, collection, doc, getDoc, addDoc, setDoc, updateDoc, query, where, getDocs, deleteDoc } from 'firebase/firestore'

// export const db = getFirestore(firebaseApp)

// /**
//  * collectionへの参照をgetする
//  * @param {string} _collectionName
//  * @returns
//  * NOTE:新規collection作成したいときは、未存在のdocのpathを、_pathに渡せばよい
//  */
// export function getCollectionRef(_path) {
// 	let ref
// 	// 通常コレクション
// 	if (_path.indexOf('/') == -1) {
// 		ref = collection(db, _path)
// 	}
// 	// サブコレクション
// 	else {
// 		const paths = _path.split('/')
// 		ref = collection(db, paths[0], paths[1], paths[2])
// 	}
// 	return ref
// }

// /**
//  * docへの参照をgetする
//  * @param {string} _path refを得たいdocのパス。「/」で区切る！！例：「members/doc名」
//  * @returns {docref} ref
//  * NOTE:新規doc作成したいときは、未存在のdocのpathを、_pathに渡せばよい
//  */
// export function getDocRef(_path) {
// 	const collectionName = _path.split('/')[0]
// 	const docName = _path.split('/')[1]
// 	let ref
// 	// 通常の場合
// 	if (_path.split('/').length == 4) {
// 		const subCollectionName = _path.split('/')[2]
// 		const subDocName = _path.split('/')[3]
// 		ref = doc(db, collectionName, docName, subCollectionName, subDocName)
// 	}
// 	// サブコレクションアリの場合
// 	else {
// 		ref = doc(db, collectionName, docName)
// 	}
// 	return ref
// }

// /**
//  * docのsnapshotを取得する
//  * @param {docref} _docRef
//  * @returns {docsnap}
//  */
// export async function getDocSnap(_docRef) {
// 	try {
// 		const docSnap = await getDoc(_docRef)
// 		return docSnap
// 		// NOTE:「data = docSnap.data()」でデータ中身取得。「data.フィールド名」で、あるフィールド値を取得。
// 	} catch (error) {
// 		console.log(error)
// 	}
// }

// /**
//  * docにデータをセットする
//  * @param {docref} _docRef docref
//  * @param {Object} _data オブジェクトで表した、セットしたいデータ
//  * @param {boolean} _merge （デフォでマージする）
//  * NOTE:↓の関数内注意書き参照。
//  */
// export async function setaDoc(_docRef, _data, _merge = true) {
// 	try {
// 		await setDoc(_docRef, _data, _merge)
// 		/* 
// 		そのdocがなかったら、docを新規作成。
// 		そのdocがもともとあったら、既存のところに統合される。
// 		統合は、_dataで指定したフィールドのみ新規追加or更新され、その他フィールドは、もとあったまま保たれる。
// 		*/
// 	} catch (error) {
// 		console.log(error)
// 	}
// }

// /**
//  * docにデータをセットする（docのidをランダム生成してもらう場合）
//  * @param {*} _collectionRef
//  * @param {*} _data
//  */
// export async function addaDoc(_collectionRef, _data) {
// 	try {
// 		const docRef = await addDoc(_collectionRef, _data)
// 		console.log('Document written with ID: ', docRef.id)
// 	} catch (error) {
// 		console.log(error)
// 	}
// }

// // TODO:updateDoc
// export async function updateaDoc(_docRef, _data) {
// 	try {
// 		await updateDoc(_docRef, _data)
// 	} catch (error) {
// 		console.log(error)
// 	}
// }

// /**
//  * クエリにあった複数docsnapを取得
//  * @param {*} _collectionRef
//  * @param {*} _queryObj
//  * @returns {array} docsnapの配列
//  */
// export async function getDocSnaps(_collectionRef, _queryObj) {
// 	/*
// 	EX:
// 	const queryObj = {
// 					1: ['LINEuID', '==', this.LINEuID],
// 					2: ['sex', '==', 'man'],
// 				}
// 	 */
// 	let q
// 	// １つのクエリのとき
// 	if (Object.keys(_queryObj).length == 1) {
// 		q = query(_collectionRef, where(_queryObj['1'][0], _queryObj['1'][1], _queryObj['1'][2]))
// 	}
// 	// ２つのクエリのとき（AND条件）
// 	else if (Object.keys(_queryObj).length == 2) {
// 		q = query(
// 			_collectionRef,
// 			where(_queryObj['1'][0], _queryObj['1'][1], _queryObj['1'][2]),
// 			where(_queryObj['2'][0], _queryObj['2'][1], _queryObj['2'][2])
// 		)
// 	}
// 	// ３つのクエリのとき（AND条件）
// 	else if (Object.keys(_queryObj).length == 3) {
// 		q = query(
// 			_collectionRef,
// 			where(_queryObj['1'][0], _queryObj['1'][1], _queryObj['1'][2]),
// 			where(_queryObj['2'][0], _queryObj['2'][1], _queryObj['2'][2]),
// 			where(_queryObj['3'][0], _queryObj['3'][1], _queryObj['3'][2])
// 		)
// 	}
// 	try {
// 		const docsnaps = await getDocs(q)
// 		// NOTE:ここで「.docs」をとっていることが重要！詳細は公式docmentを参照。https://firebase.google.cn/docs/reference/js/firestore_.querysnapshot?hl=ja
// 		const resultDocs = docsnaps.docs
// 		return resultDocs
// 		// NOTE:↑検索結果が１docsnapでも、その後forEachでデータ取得せよ！！∵returnはdocsnapの「配列」だから！
// 		/*
// 		【NOTE:クエリの文法】
// 		where()は必ず３つの引数をもつ。
// 		例：where('name', '==', 'taro')
// 		例：where('height', '>', 170)
// 		例：where('married', '!=', false)
// 		例：where('hobbies', 'array-contains', 'guitar')・・・趣味のなかにギターが含まれてるひと
// 		例：where('hobbies', 'array-contains-any', ['guitar', 'manga', 'bonsai'])・・・趣味のなかにギターor漫画or盆栽が含まれてるひと
// 		例：where('nearestStation', 'in', ['hashimoto', 'sagamihara', 'yabe'])・・・最寄りが橋本or相模原or矢部のひとってこと
// 		例：where('nearestStation', 'not-in', ['hashimoto', 'sagamihara', 'yabe'])・・・最寄りが橋本でも相模原でも矢部でもないってこと

// 		【NOTE:複合クエリの注意点】
// 		https://firebase.google.com/docs/firestore/query-data/queries
// 		（１）<,<=,>,>=,!=を含むクエリはひとつのフィールドでだけ可能。
// 		（「身長170cm以上」をつかったら、同じクエリで「体重80kg未満」は使えない）
// 		（２）'array-contains'と'array-contains-any'は、どちらかひとつのみ    
// 		*/
// 	} catch (error) {
// 		console.log(error)
// 	}
// }

// /**
//  * docを削除する
//  * @param {*} _docRef
//  */
// export async function deleteaDoc(_docRef) {
// 	try {
// 		await deleteDoc(_docRef)
// 	} catch (error) {
// 		console.log(error)
// 	}
// }
