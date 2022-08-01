// vue変数やグローバル変数を、読み取ってるだけの関数と書き換えている関数の両方ある
// 【読み取りだけの関数】
// ・おもにdraw系の関数
// ・vueインスタンスまるごと引数にしなくてオッケー

// 【書き換えもしてる関数】
// ・update系の関数
// ・これら関数は、「return」を返すように書き換える。すると、メイン関数内で、「グローバル変数 = この関数()」の形でかける。

// class P5util{
//     constructor()
// }

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
export function drawMarkerLabels(_p, _tempDrawPlots, _activeMarkers) {
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
			// _p.rotateY(camParameters.theta)
			_p.rotateZ(Math.PI)
			_p.fill('#eeeeee')
			_p.text(`${value.name}`, 0, 0)
			_p.pop()
		}
	})
}

/**
 * frameCountをアップデート
 * @param {String} _state
 * @param {Number} _frameCount
 * @param {Number} _frameNum
 * @param {Number} _frameDiff
 * @returns {Number} frameCount
 */
export function updateFrameCount(_frameCount, _frameNum, _frameDiff) {
	let newFrameCount = _frameCount
	// frameCountの更新

	console.log('_frameCount: ', _frameCount)
	console.log('_frameNum: ', _frameNum)
	if (_frameCount < _frameNum) {
		newFrameCount = _frameCount + _frameDiff
		// FPSを小さくすると、frameCount+=のハバが広がるので、frameNumを超えないよう調整↓
		newFrameCount = newFrameCount >= _frameNum ? _frameNum - 1 : newFrameCount
		// thi.$refs.player.player.frameCount = _frameCount
		// console.log('thi.$refs.player.framecount: ', thi.$refs.player.player.frameCount)
	} else {
		newFrameCount = _frameNum
		// this.$refs.player.player.frameCount = this.frameCount
	}
	return newFrameCount
}

export function updatePreDrawPlots(_preDrawPlots, _tempDrawPlots) {
	// let _newPreDrawPlots = _preDrawPlots
	let newPreDrawPlots = {}
	// 一コマ前のものをpreDrawPlotsにコピー

	Object.entries(_tempDrawPlots).forEach(([key, value]) => {
		// tempDrawPlotsのこの部位座標がNaNだったら、preDrawPlotsは据えおく！
		newPreDrawPlots[key] = !Number.isNaN(value.x) ? value : _preDrawPlots[key]
	})

	return newPreDrawPlots
}

export function updateTempDrawPlots(_thisFramePlots) {
	// TODO:一時停止状態のときは更新しない（stateで条件分岐）
	// NOTE:二倍にのばしたりするのは、karakuriFuncsそれぞれでやる！
	// if (thi.state == 'play') {
	return _thisFramePlots
}
