/* NOTE:firebaseAppの初期化専用。
firestore.jsとかauthentication.jsではまずコイツが読み込まれる。
*/

import { initializeApp } from 'firebase/app'

export const firebaseApp = initializeApp({
	// NOTE:APIキーは、GCPで設定・閲覧するものっぽい。GCPの「APIとサービス」の「認証情報」にて、自動でキーがつくられている
	apiKey: 'AIzaSyCmUfavPCEgGgfQCkMx6ei6QyWLCTB3TBQ',
	//※プロジェクトID.appspot.com（プロジェクト名じゃないよ）
	authDomain: 'karakuri-2eee3.appspot.com',
	// ※プロジェクトID
	projectId: 'karakuri-2eee3',
	storageBucket: 'karakuri-2eee3.appspot.com',
})
