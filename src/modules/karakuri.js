// 基本棒人間
export function drawHuman(_p, _framedData) {
	// TODO:マーカーの表示/非表示をこれにも対応させる？？	
	let m = {}
	Object.entries(_framedData).forEach(([k, v]) => {
		// NOTE:これで「m['マーカー名'].x」みたいな取得・指定ができるようになる
		m[k] = v
	})
	// いざ描画
	_p.stroke(255)
	_p.strokeWeight(1)

	// 各線を登録
	let lines = [
		['FHD', 'JAW'],
		['SHO_R', 'SHO_L'],
		['SHO_R', 'CHE'],
		['CHE', 'SHO_L'],
		['SHO_R', 'ELB_R'],
		['ELB_R', 'WRI_R'],
		['SHO_L', 'ELB_L'],
		['ELB_L', 'WRI_L'],
		['ASI_R', 'ASI_L'],
		['ASI_R', 'KNE_R'],
		['KNE_R', 'ANK_R'],
		['ANK_R', 'TOE_R'],
		['ASI_L', 'KNE_L'],
		['KNE_L', 'ANK_L'],
		['ANK_L', 'TOE_L'],
	]
	// 線たちを描画
	lines.forEach((line) => {
		_p.beginShape(_p.LINES)
		_p.vertex(m[line[0]].x, m[line[0]].y, m[line[0]].z)
		_p.vertex(m[line[1]].x, m[line[1]].y, m[line[1]].z)
		_p.endShape()
	})
}

/**
 * 軌跡
 * @param {*} _p
 * @param {*} _plots2Draw
 * @param {*} _indexPosition
 * @param {*} _trailLength
 * @param {*} _activeMarkers
 */
export function drawTrails(_p, _plots2Draw, _indexPosition, _trailLength, _activeMarkers) {
	_p.noFill()
	_p.strokeWeight(1)
	console.log('_plots2Draw; ', _plots2Draw)

	// アクティブなマーカーIDの配列を生成
	const markerIDs = Object.keys(_plots2Draw[0])
		.map((id, i) => {
			return _activeMarkers.includes(i) ? id : null
		})
		.filter((e) => e != null)	

	// それぞれのマーカー部位に対して
	// const preIndexPosition = (_indexPosition + _trailLength-1) % _trailLength
	markerIDs.forEach((id) => {		
		_p.beginShape()
		// 軌跡コマぶんを数珠つなぎする
		for (let i = 0; i < _trailLength; i++) {
			// リングバッファのjindexを生成してから
			const j = (_indexPosition + i) % _trailLength
			console.log('j: ', j)
			// そのjindexコマ目の座標を格納
			const x = _plots2Draw[j][id].x
			const y = _plots2Draw[j][id].y
			const z = _plots2Draw[j][id].z
			_p.vertex(x, y, z)
		}
		_p.endShape()
	})
	// NOTE:単に点を増やすモードも残しとく
	// // （１）部位の描画
	// _p.strokeWeight(4)
	// const bgColor = 200
	// let color = 31

	// for (let i = 0; i < _trailLength; i++) {
	// 	let idx = (_indexPosition + i) % _trailLength
	// 	color = color + (bgColor - color) * (i / _trailLength)
	// 	Object.entries(_plots2Draw[idx]).forEach(([key, value], j) => {
	// 		// アクティブマーカーだけ描画
	// 		if (_activeMarkers.includes(j)) {
	// 			// マーカー（点）の描画
	// 			const x = value.x
	// 			const y = value.y
	// 			const z = value.z
	// 			if (key == 'COM') {
	// 				_p.stroke(252, 244, 3)
	// 			} else {
	// 				_p.stroke(color)
	// 			}
	// 			_p.strokeWeight(10)
	// 			_p.beginShape(_p.POINTS)
	// 			_p.vertex(x, y, z)
	// 			_p.endShape()
	// 		}
	// 	})
	// }
}

// // 鏡像
// 	['drawMirror']: () => {
// 		/*
// 					tempDrawPointsか、それをコピーしたオブジェクトを生成。m[]みたいな
// 					コピーしたほうのポジションを、骨盤やら重心を「起点」にして、そこから末端へと位置を決めていく
// 					鏡像にするには、180°反転するわけだが、鏡像のポジションも、「どの方向から眺めて180°回転か」がある。
// 					つねに「Y+方向から」でよいのか、あるいはそれはカメラ方向に依存するのか？
// 					*/
// 	},
