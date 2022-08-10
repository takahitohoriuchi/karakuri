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
 * @param {Object} _tempDrawPlots 現在フレームのプロット情報
 * @param {Array} _activeMarkers 表示ONのマーカーの配列
 */
export function drawMarkers(_p, _tempDrawPlots, _activeMarkers) {
	// （１）部位の描画
	_p.stroke(255)
	_p.strokeWeight(4)

	Object.entries(_tempDrawPlots).forEach(([key, value], i) => {
		// アクティブマーカーだけ描画
		if (_activeMarkers.includes(i)) {
			// マーカー（点）の描画
			const x = value.x
			const y = value.y
			const z = value.z
			if (key == 'COM') {
				_p.stroke('#fcf403')
			} else {
				_p.stroke('#1f1f1f')
			}
			_p.strokeWeight(10)
			_p.beginShape(_p.POINTS)
			_p.vertex(x, y, z)
			_p.endShape()
		}
	})
}



/**
 * マーカーのラベル（部位名）を描画
 * @param {Object} _p p5インスタンス
 * @param {Object} _tempDrawPlots 現在フレームのプロット情報
 * @param {Array} _activeMarkers 表示ONのマーカーの配列
 */
export function drawMarkerLabels(_p, _tempDrawPlots, _activeMarkers, _theta, _phi) {
	// （１）部位の描画
	_p.stroke(255)
	_p.strokeWeight(4)

	Object.values(_tempDrawPlots).forEach((value, i) => {
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
 * @param {String} _state
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

// export function updateDrawPlots(_drawPlots){

// }


/**
 * カメラを更新
 * @param {Object} param0 camParamsを返す
 * @returns 
 */
export function updateCam({ _camParams, _dR = 0, _dPhi = 0, _dTheta = 0, _lookAt = _camParams.lookAt }) {
	let camParams = _camParams
	// カメラ距離を更新
	camParams.r = camParams.r + _dR
	// 距離の境界条件
	if (_dR < 0 && camParams.r <= 0) camParams.r = 1
	// カメラ仰角を更新
	camParams.phi = camParams.phi + _dPhi
	// 仰角の境界条件
	if (_dPhi >= 0 && camParams.phi > Math.PI * 0.5) camParams.phi = Math.PI * 0.499999
	if (_dPhi <= 0 && camParams.phi < -Math.PI * 0.5) camParams.phi = -Math.PI * 0.499999
	// カメラ横角度を更新
	camParams.theta = camParams.theta + _dTheta

	camParams.lookAt = _lookAt

	camParams.x = camParams.lookAt[0] + camParams.r * Math.cos(camParams.phi) * Math.sin(camParams.theta)
	camParams.y = camParams.lookAt[1] + camParams.r * Math.sin(camParams.phi)
	camParams.z = camParams.lookAt[2] + camParams.r * Math.cos(camParams.phi) * Math.cos(camParams.theta)
	// console.log('camParams: ', camParams)
	return camParams
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
