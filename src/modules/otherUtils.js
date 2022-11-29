import { Vector3 } from 'matrixgl'
import { Matrix4 /* Vector4 */ } from 'matrixgl'



/**
 * 4x4行列と4次元ベクトルをかける
 * @param {Array} _m
 * @param {Array} _v
 * @returns
 */
function mulMatAndVec(_m, _v) {
	// 行列の各部分に、列 c、行 r の番号で単純な変数名を付けます
	let c0r0 = _m[0],
		c1r0 = _m[1],
		c2r0 = _m[2],
		c3r0 = _m[3]
	let c0r1 = _m[4],
		c1r1 = _m[5],
		c2r1 = _m[6],
		c3r1 = _m[7]
	let c0r2 = _m[8],
		c1r2 = _m[9],
		c2r2 = _m[10],
		c3r2 = _m[11]
	let c0r3 = _m[12],
		c1r3 = _m[13],
		c2r3 = _m[14],
		c3r3 = _m[15]
	// 次に、点にある単純な名前を設定します
	let x = _v[0]
	let y = _v[1]
	let z = _v[2]
	let w = _v[3]
	// 1番目の列の各部分に対して点を乗算し、次に合計します
	let X = x * c0r0 + y * c0r1 + z * c0r2 + w * c0r3
	// 2番目の列の各部分に対して点を乗算し、次に合計します
	let Y = x * c1r0 + y * c1r1 + z * c1r2 + w * c1r3
	// 3番目の列の各部分に対して点を乗算し、次に合計します
	let Z = x * c2r0 + y * c2r1 + z * c2r2 + w * c2r3
	// 4番目の列の各部分に対して点を乗算し、次に合計します
	let W = x * c3r0 + y * c3r1 + z * c3r2 + w * c3r3
	return [X, Y, Z, W]
}

/**
 * 3次元点座標から、カメラを介した画面内の二次元座標を取得
 * @param {Array} _vec3d 
 * @param {Object} _camParams 
 * @param {Number} _W ウィンドウ幅
 * @param {Number} _H ウィンドウ縦
 * @returns {Array} 2次元ベクトル
 */
export function get2dPosFrom3dPos(_vec3d, _camParams, _W, _H){
	// （１）モデル行列
	const modelMat = Matrix4.identity().translate(0, 0, 0) //「原点」をあらわすモデル行列を用意
	// NOTE:ここで一般には、translate(0,0,0).ratateX(Math.PI).scale(5,5,5)というふうに変換してく

	// （２）ビュー行列
	const camPos = new Vector3(_camParams.x, _camParams.y, _camParams.z)
	const lookAt = new Vector3(_camParams.lookAt[0], _camParams.lookAt[1], _camParams.lookAt[2])
	const camUp = new Vector3(_camParams.upVec[0], _camParams.upVec[1], _camParams.upVec[2])
	const vMat = Matrix4.lookAt(camPos, lookAt, camUp)
	// console.log('vMat: ', vMat)	

	// （３）プロジェクション行列
	// もとはaspectRatioは1, nearは1, farは2ってのがある。
	const pMat = Matrix4.perspective({
		fovYRadian: _camParams.fovy,
		aspectRatio: _camParams.aspect,
		near: _camParams.near,
		far: _camParams.far,
	})
	// console.log('pMat: ', pMat)

    // （４）MVP行列を生成して、引数3次元ベクトルにかける
	const mvpMat = pMat.mulByMatrix4(vMat).mulByMatrix4(modelMat)
	// console.log('mvpMat: ', mvpMat)
	
	let vec = [_vec3d[0], _vec3d[1], _vec3d[2], 1] //４次元ベクトルにする。NOTE:wは1に！！！
	let mat = mvpMat.values
	let pos = mulMatAndVec(mat, vec)
	// console.log('pos（mvp変換後）: ', pos)

	// （4）w徐算
	pos = [pos[0] / pos[3], pos[1] / pos[3], pos[2] / pos[3], pos[3] / pos[3]]
	// console.log('pos（w徐算後）: ', pos)

	// （５）ビューポート変換（スクリーン２次元座標へ）
	const W = _W
	const H = _H
	const viewPortMat = [
		W / 2, 0, 0, 0,
		0, H / 2, 0, 0,
        0, 0, (_camParams.far - _camParams.near) / 2, 0,//NOTE:3つめはこれであってるのか謎
		W / 2, H / 2, (_camParams.far + _camParams.near) / 2, 1,//NOTE:3つめはこれであってるのか謎
	]
	const finalPos = mulMatAndVec(viewPortMat, pos)
	// DEBUG:finalPosフィナl歩shあおかしくない
	// console.log('finalPos: ',finalPos)
	// console.log('finalPos: ', finalPos)

    const resultVec2d = [finalPos[0], finalPos[1]]
	// console.log('resultVec2d: ', resultVec2d)
    return resultVec2d
}

/**
 * 
 * @param {Object} _tempDrawPlots 現在コマのdrawPlots
 * @param {Array} _activeMarkers 各マーカーに紐づけられた数値IDの配列。例：[0,3,4,...]
 * @param {Array} _mousePos マウス二次元座標
 * @param {Object} _camParams カメラパラメータ
 * @returns 
 */
export function getNearestMarkerID(_tempDrawPlots, _activeMarkers, _mousePos, _camParams, _W, _H){
    const radius = 30
	// すべてのマーカーの画面2D座標を算出して、配列に格納
	let marker2dVecs = Object.entries(_tempDrawPlots).map(([k, v]) => {
        // アクティブマーカーのみ
        if(_activeMarkers.includes(k)){
            const vec2d = get2dPosFrom3dPos([v.x, v.y, v.z], _camParams, _W, _H)
			const dist = Math.sqrt(Math.pow(_mousePos[0] - vec2d[0], 2) + Math.pow(_mousePos[1] - vec2d[1], 2))
			const obj = {
				ID: k,
				dist: dist,
			}
			return obj
        }
        // アクティブマーカー以外は、距離1000にしとく
        else{
            return {
                ID: k,
                dist: 1000,
            }
        }
		
	})
	// console.log('marker2dVecs: ', marker2dVecs)

	// マウス最近傍のマーカーを配列先頭にする（dist順に昇順ソート）
	marker2dVecs.sort((first, second) => {
		if (first.dist < second.dist) {
			return -1
		} else if (first.dist > second.dist) {
			return 1
		} else {
			return 0
		}
	})

	// マウス最近傍マーカーは、指定半径よりも近くにあるか？？
	if (marker2dVecs[0].dist < radius) {
        //あれば、そのマーカーIDを返す        
		return marker2dVecs[0].ID
	} else {
        // なければ、null返す
		return null
	}
}


