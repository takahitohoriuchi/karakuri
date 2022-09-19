// SECTION:描画系
/**
 * 座標系を描画
 * @param {Object} _p p5インスタンス
 * @param {Number} _axLen 軸の長さ
 * @param {Number} _dotSize 軸頭の半径
 */
export function drawCoordinate(_p, _axLen = 100, _dotSize = 5) {
	// p.noStroke()
	_p.strokeWeight(1)
	// X軸
	_p.stroke(255, 0, 0)
	_p.push()
	_p.translate(_axLen, 0, 0)
	_p.sphere(_dotSize)
	_p.pop()
	_p.line(-_axLen, 0, 0, _axLen, 0, 0)
	// Y軸
	_p.stroke(0, 255, 0)
	_p.push()
	_p.translate(0, _axLen, 0)
	_p.sphere(_dotSize)
	_p.pop()
	_p.line(0, -_axLen, 0, 0, _axLen, 0)
	// Z軸
	_p.stroke(0, 0, 255)
	_p.push()
	_p.translate(0, 0, _axLen)
	_p.sphere(_dotSize)
	_p.pop()
	_p.line(0, 0, -_axLen, 0, 0, _axLen)
}

/**
 * 世界球の表示
 * @param {*} _p 
 * @param {*} _r 
 * NOTE:for 一人称視点
 */
export function drawSphere(_p, _r){
	_p.noFill()
	_p.strokeWeight(0.11)
	_p.stroke(255, 255, 255)
	_p.sphere(_r)
}

/**
 * マーカー点を描画
 * @param {Object} _p p5インスタンス
 * @param {Object} _tempDrawPlot 現在フレームのプロット情報
 * @param {Array} _activeMarkers 表示ONのマーカーの配列
 * @param {String} _nearestMarkerID マウス最近傍マーカーID
 * @param {Object} _camParams カメラパラメータ
 */
export function drawPlots(_p, _tempDrawPlot, _activeMarkers, _nearestMarkerID, _camParams) {	
	
	// d = 重心からカメラの距離 を測る。そのぶんを、最低ドットサイズに反映させる。
	const com = _tempDrawPlot['COM']
	const comDist = _p.dist(com.x, com.y, com.z, _camParams.x, _camParams.y, _camParams.z)
	/* TODO:tempDrawPlot(plots[]の現在コマぶん)を描くのみ

	*/
	// dが大きくなるほど、20.0のminSizeをでかくする	
	Object.entries(_tempDrawPlot).forEach(([key, value], i) => {
		// アクティブマーカーだけ描画
		if (_activeMarkers.includes(i)) {
			// マーカー（点）の描画
			const x = value.x
			const y = value.y
			const z = value.z
			const camDist = _p.dist(x, y, z, _camParams.x, _camParams.y, _camParams.z)
			const dotSize = comDist*0.05 + 50.0 * (300.0-camDist) / 300.0//NOTE:10ポイント（距離300）を基準にする。距離300はカメラ-原点の初期距離			
						
			_p.strokeWeight(dotSize)
			if (key == 'COM') {//重心は黄色
				_p.stroke('#fcf403')
			} else if(key == _nearestMarkerID){
				_p.stroke('#ff0f73')//マウス最近傍はピンク ∩ デカい
				_p.strokeWeight(dotSize * 1.5)
			}else {//その他は黒っぽい
				_p.stroke('#1f1f1f')
			}						
			_p.beginShape(_p.POINTS)
			_p.vertex(x, y, z)
			_p.endShape()						
		}
	})
	// console.log('nijigens: ', nijigens)
}

/**
 * マーカーのラベル（部位名）を描画
 * @param {Object} _p p5インスタンス
 * @param {Object} _tempDrawPlot 現在フレームのプロット情報
 * @param {Array} _activeMarkers 表示ONのマーカーの配列
 * @param {Number} _theta カメラ位置の、極座標「横回転」具合
 * @param {Number} _phi カメラ位置の、極座標「縦回転」具合
 */
export function drawMarkerLabels(_p, _tempDrawPlot, _activeMarkers, _theta, _phi) {
	// （１）部位の描画
	_p.stroke(255)
	_p.strokeWeight(4)

	Object.values(_tempDrawPlot).forEach((value, i) => {
		// console.log('key: ', key)
		// アクティブマーカーだけ描画
		if (_activeMarkers.includes(i)) {
			// マーカーの位置
			const x = value.x
			const y = value.y
			const z = value.z			
			// マーカー名の描画
			_p.push()
			_p.translate(x, y, z)
			_p.rotateY(_theta)
			_p.rotateX(-_phi)			
			_p.rotateZ(Math.PI)
			_p.fill('#eeeeee')
			_p.text(`${value.name}`, 0, 0)
			_p.pop()
		}
	})
}


// SECTION:update系
/**
 * frameCountを更新
 * @param {Number} _frameCount
 * @param {Number} _frameNum
 * @param {Number} _frameDiff
 * @returns {Number} frameCount
 */
export function updateFrameCount(_frameCount, _frameNum, _frameDiff) {
	// frameCountの更新
	let newFrameCount = _frameCount + _frameDiff
	// frameNumを超えたらframeNumがmax
	if (newFrameCount >= _frameNum-1) {
		newFrameCount = _frameNum-1
	}
	return newFrameCount
}

// export function updatePlots(_tempFrameData, _tempDrawPlot, _skeleton) {
// 	// tempDrawPlotを更新するのが目的
// 	_skeleton.children.forEach( lev0Marker =>{
// 		const markerID = lev0Marker.id

// 	})
	
	
// }

// export function updateDrawPlots(_drawPlots){

// }


/**
 * カメラを更新
 * @param {Object} param0 _camParamsを返す
 * @returns 
 * NOTE:JSでは、オブジェクトや配列を引数にすると、それはポインタになる！！！
 */
export function updateCam({_camParams, _dR = 0, _dPhi = 0, _dTheta = 0, _lookAt = _camParams.lookAt}) {	
	// カメラ距離を更新
	_camParams.r = _camParams.r + _dR
	// 距離の境界条件
	if (_dR < 0 && _camParams.r <= 0) _camParams.r = 1
	// カメラ仰角を更新
	_camParams.phi = _camParams.phi + _dPhi
	// 仰角の境界条件
	if (_dPhi >= 0 && _camParams.phi > Math.PI * 0.5) _camParams.phi = Math.PI * 0.499999
	if (_dPhi <= 0 && _camParams.phi < -Math.PI * 0.5) _camParams.phi = -Math.PI * 0.499999
	// カメラ横角度を更新
	_camParams.theta = _camParams.theta + _dTheta

	_camParams.lookAt = _lookAt
	// 直行座標でのカメラ外部パラメータも更新する
	_camParams.x = _camParams.lookAt[0] + _camParams.r * Math.cos(_camParams.phi) * Math.sin(_camParams.theta)
	_camParams.y = _camParams.lookAt[1] + _camParams.r * Math.sin(_camParams.phi)
	_camParams.z = _camParams.lookAt[2] + _camParams.r * Math.cos(_camParams.phi) * Math.cos(_camParams.theta)	
	
	
}


// SECTION:その他

/**
 * キャンバスサイズを拡大/縮小
 * @param {*} _p 
 * @param {*} _isFullScreen 
 */
export function windowResized(_p, _isFullScreen) {
	_isFullScreen = !_isFullScreen
	if (_isFullScreen) {
		_p.resizeCanvas(_p.windowWidth, _p.windowHeight)
	} else {
		_p.resizeCanvas(1600, 900)
	}
}
