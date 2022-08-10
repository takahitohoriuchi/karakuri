/*
AdminLoginをチェックする。
チェックした結果を、返すのか、
それともvue内でチェックした結果を
*/

import { firebaseApp } from './firebaseApp.js'
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut/* onAuthStateChanged */ /*showLoginState*/ } from 'firebase/auth'

export const auth = getAuth(firebaseApp)
console.log('auth: ', auth)

export async function signUp(_email, _password){
	return await createUserWithEmailAndPassword(auth, _email, _password)
		.then((userCredential) => {
			// Signed in
			const user = userCredential.user			
			console.log('user: ', user)			
			return user		
		})
		.catch((error) => {
			const errorCode = error.code
			const errorMessage = error.message
			console.log('errorCode: ', errorCode)
			console.log('errorMessage: ', errorMessage)
		})

}


export async function logIn(_email, _password) {
	console.log('logIn()が発火しました')
	try {
		const userCredential = await signInWithEmailAndPassword(auth, _email, _password)
		console.log('ログイン成功！')
		console.log('userCredential.user: ', userCredential.user)
		return userCredential
	} catch (error) {
		console.log(error)
		console.log('管理者ログイン失敗')
		alert('ログイン情報が間違っています')
		return null
	}
}




// TODO:ここにログアウト関数
export async function logOut(){
	try {
		await signOut(auth)
	} catch (error) {
		console.log(error)
	}

}

// export async function getLoginUserInfo() {
// 	const auth = new Promise((resolve) => {
// 		const aut = getAuth()
// 		resolve(aut)
// 	}).then(() => {
// 		const user = auth.currentUser
// 		console.log('currentUser: ', user)
// 		if (user) {
// 			const uid = user.uid
// 			console.log('ログイン中(isSignIn), uid: ', uid)
// 		} else {
// 			console.log('未ログイン(isSignIn)')
// 		}
// 		return user
// 	})
// 	return auth
// }

// export async function authStateChanged() {
// 	// const auth = getAuth()
// 	try {
// 		return await onAuthStateChanged(auth, async (user) => {
// 			if (user) {
// 				console.log('ログインuser情報: ', user)
// 				return user
// 			} else {
// 				console.log('ログアウト')
// 			}
// 		})
// 		// return userObj
// 	} catch (error) {
// 		console.log(error)
// 	}
// }
