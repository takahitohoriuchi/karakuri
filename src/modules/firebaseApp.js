// /* NOTE:firebaseAppの初期化専用。
// firestore.jsとかauthentication.jsではまずコイツが読み込まれる。
// */

// import { initializeApp } from 'firebase/app'

// export const firebaseApp = initializeApp({
// 	// NOTE:APIキーは、GCPで設定・閲覧するものっぽい。GCPの「APIとサービス」の「認証情報」にて、自動でキーがつくられている
// 	apiKey: '40文字くらいのAPIキー文字列',
// 	//※プロジェクトID.appspot.com（プロジェクト名じゃないよ）
// 	authDomain: 'プロジェクトID.appspot.com',	
// 	// ※プロジェクトID
// 	projectId: 'プロジェクトID',
// })
