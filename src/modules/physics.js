// NOTE:
// 物理関数群

// TODO:
// 剛体の重心を取得する関数()
// 

// :::計算パーツ

// ベクトルを正規化
/**
 * ベクトルを正規化（
 * @param {Object} _vec 
 * @returns {Array} [0.1, 0.hoge, 0.hoge]
 */
function normalize(_vec){
    return [_vec.x / _vec.length, _vec.y / _vec.length, _vec.z / _vec.length]    
}


// function cross(_vec1, _vec2){
//     // 配列で引数ベクトルが与えられたとき
//     if(Array.isArray(_vec1) && Array.isArray(_vec2)){
//         return  {
//         x: nR[1]*nV[2] - nR[2]*nV[1],
//         y: nR[2]*nV[0] - nR[0]*nV[2],
//         z: nR[0]*nV[1] - nR[1]*nV[0],    
//     }         
        
//     }
//     // オブジェクトで引数ベクトルが与えられたとき
//     else{

//     }
// }



// :::並進運動
// 速度
/**
 * 速度を取得(from 位置obj)
 * @param {Object} _pos1 位置オブジェクト
 * @param {Object} _pos2 位置オブジェクト
 * @returns {Object} 速度オブジェクト
 */
function getV(_pos1, _pos2){    
    const x = _pos2.x - _pos1.x
    const y = _pos2.y - _pos1.y
    const z = _pos2.z - _pos1.z
    const length = Math.sqrt(x*x + y*y + z*z)
    const v =  {
        x: x,
        y: y,
        z: z,
        length: length    			        
	}
    // console.log('v: ', v)
    return v    
}

// 加速度[m/s^2]
/**
 * 加速度を取得（from 速度obj）
 * @param {Object} _v1 速度obj
 * @param {Object} _v2 速度obj
 * @returns {Object} 加速度obj{x,y,z,length}
 */
function getA(_v1, _v2){
    const x = _v2.x - _v1.x
    const y = _v2.y - _v1.y
    const z = _v2.z - _v1.z
    const length = Math.sqrt(x*x + y*y + z*z)
    const a = {
        x: x,
        y: y,
        z: z,
        length: length						
	}
	// console.log('a: ', a)
	return a
}

// 力[kg · m/s^2] = [N]
/**
 * その物体にはたらく力を取得
 * @param {Number} _m 質量
 * @param {Object} _a 加速度obj
 * @returns {Object} 力obj{x, y, z, length}
 */
function getF(_m, _a){    
    const x = _a.x * _m
    const y = _a.y * _m
    const z = _a.z * _m
    const length = Math.sqrt(x*x + y*y + z*z)    
    const F = {
		x: x,
        y: y,
        z: z,
        length: length
	}    
    return F
}

// 運動量[kg · m/s] = [N / s]
/**
 * その物体の運動量ベクトルを取得
 * @param {Number} _m 
 * @param {Object} _v 
 * @returns 運動量obj{x, y, z, length}
 */
function getMomentum(_m, _v){
    const x = _m * _v.x
    const y = _m * _v.y
    const z = _m * _v.z
    const length = Math.sqrt(x*x + y*y + z*z)
    const momentum = {
		x: x,
		y: y,
		z: z,
        length: length
	}
    return momentum
}

// 運動エネルギー[kg · m/s · m/s] = [J]
/**
 * 運動エネルギーを取得
 * @param {Number} _m 
 * @param {Object} _v 
 * @returns {NUmber} 運動エネルギー
 */
function getKineticEnergy(_m, _v){
    const e = 0.5 * _m * _v.length * _v.length
	return e
}

// 位置エネルギー[kg · m/s · m/s] = [J]
/**
 * 位置エネルギーを取得
 * @param {Number} _m 
 * @param {Object} _pos 
 * @returns {Number} 位置エネルギー
 */
function getPotentialEnergy(_m, _pos){
    // 重力加速度
    const g = 9.80665
    // 高さNOTE:yが高さ方向！！！
    const h = _pos.y
    return _m * g * h
}

// パワー（仕事率）[kg · m/s^2 · m/s]= [J / t]
/**
 * パワー（仕事率）を取得
 * @param {Object} _F 
 * @param {Object} _v 
 * @returns {Number} パワー（スカラー値）
 */
function getPower(_F, _v){
    return _F.x * _v.x + _F.y * _v.y * _F.z * _v.z
}

// 力積[kg · m/s]
/**
 * 力積ベクトルを取得
 * @param {Array} _FArray 力objの配列
 * @returns {Object} 力積オブジェクト{x, y, z, length}
 */
function getImpulse(_FArray){
    let sum = {
        x: 0,
        y: 0,
        z: 0,
        length: 0
    }
    for(let i=0; i<_FArray.length; i++){
        sum.x += _FArray[i].x    
        sum.y += _FArray[i].y
        sum.z += _FArray[i].z
    }
    sum.length = Math.sqrt(sum.x*sum.x + sum.y*sum.y + sum.z*sum.z)    
    return sum
}

// :::角運動
// TODO:あとで、重心から一気に算出する関数をつくる
// 位置を、ある原点からの相対位置ベクトルに変換
function getRelativePosFrom(_originPos, _pos){
    return {
		x: _pos.x - _originPos.x,
		y: _pos.y - _originPos.y,
		z: _pos.y - _originPos.z,
	}
    // NOTE:ある原点を重心としたとき、その物体のある質点（位置ベクトル）は、重心まわりに円運動しているとみなせる！！
}

// DEBUG:相対速度にせよ
// 角速度（その剛体が、その重心まわりに。）
/**
 * 角速度を取得する
 * @param {Object} _pos その質点の、物体重心からの相対座標（t）（回転中心からの相対座標）
 * @param {Object} _v その質点の、速度ベクトル（t）
 * @returns {Object} 角速度ベクトル
 */
function getAngV(_pos, _v){
    // 引数の位置は重心からの相対座標（グローバル位置ベクトル - 重心位置ベクトル）    
    // 位置ベクトル
    const r = _pos
    r.length = Math.sqrt(r.x*r.x + r.y*r.y + r.z*r.z)
    // 正規化
    const nR = [r.x / r.length, r.y / r.length, r.z / r.length]
    // 速度ベクトル
    const v = _v
    // 正規化
    const nV = [v.x / v.length, v.y / v.length, v.z / v.length]    
    // その外積をとる（ω = r/|r| × V/|r|）
    let omega = {
        x: nR[1]*nV[2] - nR[2]*nV[1],
        y: nR[2]*nV[0] - nR[0]*nV[2],
        z: nR[0]*nV[1] - nR[1]*nV[0],    
    }            
    // 角速度ベクトルの大きさ
    omega.length = Math.sqrt(omega.x*omega.x + omega.y*omega.y + omega.z*omega.z)    
    return omega
}

// 角加速度（その剛体が、その重心まわりに。）
/**
 * 角加速度を取得する
 * @param {Object} _angV1 角速度（t）
 * @param {Object} _angV2 角速度（t+1）
 * @returns {Object} 角加速度ベクトル
 */
function getAngA(_angV1, _angV2){
    let angA = {
		x: _angV2.x - _angV1.x,
		y: _angV2.y - _angV1.y,
		z: _angV2.z - _angV1.z,        
	}
    // 角加速度ベクトルの大きさ
    angA.length = angA.x*angA.x + angA.y*angA.y + angA.z*angA.z
    return angA
}

// トルク [m · kg · m/s^2]= []
function getTorque(_relativePos, _F){

}

// 角運動量
function getAngMomentum(){

}

// 角運動エネルギー
/**
 * 
 * @param {Number} _m 質量
 * @param {Object} _angV 角速度ベクトル
 * @returns {Number} 角運動エネルギー
 */
function getAngKineticEnergy(_m, _angV){
    const e = 0.5 * _m * _angV.length * _angV.length    
	return e
}

// 角運動のパワー
/**
 * 角運動のパワー
 * @param {Object} _T 
 * @param {Object} _omega 
 * @returns {Number} 角運動のパワー
 */
function getAngPower(_T, _omega) {
	return _T.x * _omega.x + _T.y * _omega.y * _T.z * _omega.z
}


// :::テスト
// 並進
let posArray = [] // 位置（絶対）
let comArray = [] // 重心位置（相対）
let vArray = [] // 速度（絶対）
let aArray = [] // 加速度（絶対）
let FArray = [] // 力（絶対）
let pArray = [] // 運動量（絶対）
let kineticEnergyArray = []// 運動エネルギー（絶対）
let powerArray = [] // パワー（絶対）
let potentialEnergyArray = [] // 位置エネルギー
// 回転
let angVArray = [] // 角速度
let angAArray = [] // 角加速度
let TorqueArray = [] // トルク
let LArray = [] //角運動量ベクトル
let angKineticEnergyArray = [] // 角運動エネルギー
let angPowerArray = [] // 角運動のパワー
const num = 10
const m = 13//質量
// posベクトル配列をランダム生成
for(let i=0; i<num; i++){
    const x = 2 * Math.random()
    const y = 2 * Math.random()
    const z = 2 * Math.random()
    posArray.push(
        {
            x: x,
            y: y,
            z: z
        }
    )
}
// comベクトル配列をランダム生成
for (let i = 0; i < num; i++) {
	const x = posArray[i].x + 0.1 * Math.random()
    const y = posArray[i].y + 0.1 * Math.random()
    const z = posArray[i].z + 0.1 * Math.random()		
	comArray.push({
		x: x,
		y: y,
		z: z,
	})
}

// vベクトル配列
for(let i=0; i<num; i++){    
    if(i+1 == num-1){
        break
    }else{
        const v = getV(posArray[i], posArray[i + 1])
		vArray.push(v)
    }    
}
// aベクトル配列
for (let i = 0; i < vArray.length; i++) {
	if (i + 1 == vArray.length - 1) {
		break
	} else {
		const a = getA(vArray[i], vArray[i + 1])
		aArray.push(a)
	}
}
// Fベクトル配列
for (let i = 0; i < aArray.length; i++) {			
	const f = getF(m, aArray[i])
	FArray.push(f)	
}
// 運動量
for (let i = 0; i < vArray.length; i++) {			
	const p = getMomentum(m, vArray[i])
	pArray.push(p)	
}
// 運動エネルギー
for (let i = 0; i < vArray.length; i++) {
	const e = getKineticEnergy(m, vArray[i])
	kineticEnergyArray.push(e)
}
// 位置エネルギー
for (let i = 0; i < vArray.length; i++) {
    if(i>0){
        const e = getPotentialEnergy(m, posArray[i + 1])
		potentialEnergyArray.push(e)
    }	
}
// パワー
for (let i = 0; i < FArray.length; i++) {			
    const power = getPower(FArray[i], vArray[i+1])//NOTE:いっこずれ
    powerArray.push(power)	
}
// 角速度
for (let i = 0; i <vArray.length; i++) {
    const relativePos = getRelativePosFrom(comArray[i], posArray[i])
    const angV = getAngV(relativePos[i+1], vArray[i])//NOTE:いっこずれ
    angVArray.push(angV)
}

// 角加速度ベクトル
for (let i = 0; i < angVArray.length; i++) {
	if (i + 1 == angVArray.length - 1) {
		break
	} else {
		const angA = getAngA(angVArray[i], angVArray[i + 1])
		angAArray.push(angA)
	}
}
// 角運動エネルギー
for (let i = 0; i < angVArray.length; i++) {
	const e = getAngKineticEnergy(m, angVArray[i])
	angKineticEnergyArray.push(e)
}

// 力積
const impulse = getImpulse(FArray)


console.log('====================')
console.log('【並進運動】')
console.log(`（位置）posArray[0]: `, JSON.stringify(posArray[0]))
console.log(`（速度）vArray[0]: `, JSON.stringify(vArray[0]))
console.log(`（加速度）aArray[0]: `, JSON.stringify(aArray[0]))
console.log(`（力）FArray[0]: `, JSON.stringify(FArray[0]))
console.log(`（運動量）momentum[0]: `, JSON.stringify(pArray[0]))
console.log(`（力積）impulse: `, JSON.stringify(impulse))
console.log('-----')
console.log('【角運動】')
console.log(`(角速度ベクトル)angVArray[0]: `, JSON.stringify(angVArray[0]))
console.log(`(角加速度ベクトル)angAArray[0]: `, JSON.stringify(angAArray[0]))
console.log('【エネルギー】')
console.log('(運動エネルギー)kineticEnergyArray[0]:', JSON.stringify(kineticEnergyArray[0]))
console.log('(位置エネルギー)potentialEnergyArray[0]:', JSON.stringify(potentialEnergyArray[0]))
console.log('(角運動エネルギー)angKineticEnergyArray[0]:', JSON.stringify(angKineticEnergyArray[0]))
console.log('（角運動のパワー）power: ', power[])
console.log('====================')

// const m = 20
// const F = getF(m, a)

// console.log('a.x: ', a.x)

// const F = getF(a, m)