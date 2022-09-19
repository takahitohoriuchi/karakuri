/*NOTE:
どのカラクリも、「plots」を元データに（引数にして）つかえ！！！
plotsの形：
	plots[indexPosition][COM] 
	↑の中身は {name: ?, x: 数値, y:数値, z:数値}といったobjになってる。
	そのobjが部位ごとにまとまったものが、「軌跡長さぶんの」コマごとにある。
 */



// スケルトン（各マーカーのデフォ親子関係）
export const skeletonModel = {
	id: 'COM',
	parent: null,
	rate: 1.0,
	children: [
		// 上半身
		{
			id:'CHE',
			parent: 'COM',
			rate: 1.0,
			children: [
				// 顔
				{
					id: 'JAW',
					parent: 'CHE',
					rate: 1.0,
					children: [
						{
							id: 'FHD',
							parent: 'JAW',
							rate: 1.0,
							children: []
						}
					]
				},
				// 右上半身
				{
					id: 'SHO_R',
					parent: 'CHE',
					rate: 1.0,
					children: [
						{
							id: 'ELB_R',
							parent: 'SHO_R',
							rate: 1.0,
							children: [
								{
									id : 'WRI_R',
									parent: 'ELB_R',
									rate: 1.0,
									children: []
								}										
							]
						}
					]
				},
				// 左上半身
				{
					id: 'SHO_L',
					parent: 'CHE',
					rate: 1.0,
					children: [
						{
							id: 'ELB_L',
							parent: 'SHO_L',
							rate: 1.0,
							children: [
								{
									id : 'WRI_L',
									parent: 'ELB_L',
									rate: 1.0,
									children: []
								}
								
							]
						}
					]
				}
			]	
		},				
		// 右下半身
		{
			id: 'ASI_R',
			parent: 'COM',
			rate: 1.0,
			children: [
				{
					id: 'KNE_R',
					parent: 'ASI_R',
					rate: 1.0,
					children: [
						{
							id: 'ANK_R',
							parent: 'KNE_R',
							rate: 1.0,
							children: [
								{
									id: 'TOE_R',
									parent: 'ANK_R',
									rate: 1.0,
									children: []
								}
							],
						}
					]

				}
			]
		},
		// 左下半身
		{
			id: 'ASI_L',
			parent: 'COM',
			rate: 1.0,
			children: [
				{
					id: 'KNE_L',
					parent: 'ASI_L',
					rate: 1.0,
					children: [
						{
							id: 'ANK_L',
							parent: 'KNE_L',
							rate: 1.0,
							children: [
								{
									id: 'TOE_L',
									parent: 'ANK_L',
									rate: 1.0,
									children: []
								}
							],
						}
					]

				}
			]
		},				
	],	
}

// TODO:どのマーカーどうしをむすぶのか？（※スケルトンとはちがうよ！）
export const edges = [
	['COM', 'CHE'],
	['COM', 'ASI_R'],
	//...以下略。TODO::あとで編集
]

// 基本棒人間
export function drawHuman(_p, _tempPlots, _camParams) {
	const com = _tempPlots['COM']
	const comDist = _p.dist(com.x, com.y, com.z, _camParams.x, _camParams.y, _camParams.z)
	console.log('comDist: ', comDist)
	const lineWeight = 1.0 + (20.0 * (300.0 - comDist)) / 300.0
	_p.stroke(255)
	_p.strokeWeight(lineWeight)
	_p.push()
	const comPos = _p.createVector(_tempPlots.COM.x, _tempPlots.COM.y, _tempPlots.COM.z)
	_p.translate(comPos) //右骨盤を原点に
	// SECTION:右下
	// KEY:右腰椎ボーン（右骨盤-重心）
	// _p.beginShape(_p.LINES)
	const yotsuiR = _p.createVector(_tempPlots.ASI_R.x - _tempPlots.COM.x, _tempPlots.ASI_R.y - _tempPlots.COM.y, _tempPlots.ASI_R.z - _tempPlots.COM.z)	
	// KEY:右太ももボーン（右膝-右骨盤）
	_p.push()
	_p.translate(yotsuiR) //右骨盤を原点に
	const momoR = _p.createVector(_tempPlots.KNE_R.x - _tempPlots.ASI_R.x, _tempPlots.KNE_R.y - _tempPlots.ASI_R.y, _tempPlots.KNE_R.z - _tempPlots.ASI_R.z)
	// KEY:右下腿ボーン（右足首-右膝）
	_p.translate(momoR) //右骨盤を原点に
	const suneR = _p.createVector(
		3.0 * _tempPlots.ANK_R.x - _tempPlots.KNE_R.x,
		3.0 * _tempPlots.ANK_R.y - _tempPlots.KNE_R.y,
		3.0 * _tempPlots.ANK_R.z - _tempPlots.KNE_R.z
	)
	// KEY:右足ボーン（右つま先-右足首）
	_p.push()
	_p.translate(suneR) //右足首を原点に
	const ashiR = _p.createVector(_tempPlots.TOE_R.x - _tempPlots.ANK_R.x, _tempPlots.TOE_R.y - _tempPlots.ANK_R.y, _tempPlots.TOE_R.z - _tempPlots.ANK_R.z)
	_p.pop()
	_p.pop()
	_p.pop()
	// SECTION:左
	// KEY:左腰椎ボーン（左骨盤-重心）
	const yotsuiL = _p.createVector(_tempPlots.ASI_L.x - _tempPlots.COM.x, _tempPlots.ASI_L.y - _tempPlots.COM.y, _tempPlots.ASI_L.z - _tempPlots.COM.z)
	// TODO:描画必要なし？
	// _p.vertex(0, 0, 0)
	// _p.vertex(yotsuiL.x, yotsuiL.y, yotsuiL.z)
	// _p.endShape()
	// KEY:左太ももボーン（左膝-左骨盤）
	_p.push()
	_p.translate(yotsuiL) //左骨盤を原点に
	const momoL = _p.createVector(_tempPlots.KNE_L.x - _tempPlots.ASI_L.x, _tempPlots.KNE_L.y - _tempPlots.ASI_L.y, _tempPlots.KNE_L.z - _tempPlots.ASI_L.z)
	// KEY:左下腿ボーン（左足首-左膝）
	_p.push()
	_p.translate(momoL) //左骨盤を原点に
	const suneL = _p.createVector(_tempPlots.ANK_L.x - _tempPlots.KNE_L.x, _tempPlots.ANK_L.y - _tempPlots.KNE_L.y, _tempPlots.ANK_L.z - _tempPlots.KNE_L.z)
	// KEY:左足ボーン（左つま先-左足首）
	_p.push()
	_p.translate(suneL) //左足首を原点に
	const ashiL = _p.createVector(_tempPlots.TOE_L.x - _tempPlots.ANK_L.x, _tempPlots.TOE_L.y - _tempPlots.ANK_L.y, _tempPlots.TOE_L.z - _tempPlots.ANK_L.z)
	_p.pop()
	_p.pop()
	_p.pop()
	// SECTION:上
	// KEY:胸椎ボーン（胸骨-重心）
	const kyotsui = _p.createVector(_tempPlots.CHE.x - _tempPlots.COM.x, _tempPlots.CHE.y - _tempPlots.COM.y, _tempPlots.CHE.z - _tempPlots.COM.z)
	// TODO:描画必要なし？
	// _p.vertex(0, 0, 0)
	_p.push()
	_p.translate(kyotsui) //胸骨を原点に
	// KEY:顔ボーン（おでこ-あご）
	_p.push()
	const kubi = _p.createVector(_tempPlots.JAW.x - _tempPlots.CHE.x, _tempPlots.JAW.y - _tempPlots.CHE.y, _tempPlots.JAW.z - _tempPlots.CHE.z)
	_p.translate(kubi) //あごを原点に
	const face = _p.createVector(_tempPlots.FHD.x - _tempPlots.JAW.x, _tempPlots.FHD.y - _tempPlots.JAW.y, _tempPlots.FHD.z - _tempPlots.JAW.z)
	_p.pop()
	// SECTION:右の肩以上
	// KEY:右鎖骨ボーン（右肩先-胸骨）
	_p.push()
	const sakotsuR = _p.createVector(_tempPlots.SHO_R.x - _tempPlots.CHE.x, _tempPlots.SHO_R.y - _tempPlots.CHE.y, _tempPlots.SHO_R.z - _tempPlots.CHE.z)
	// KEY:右上腕ボーン（右肘-右肩）
	_p.push()
	_p.translate(sakotsuR)
	const jowanR = [_tempPlots.ELB_R.x - _tempPlots.SHO_R.x, _tempPlots.ELB_R.y - _tempPlots.SHO_R.y, _tempPlots.ELB_R.z - _tempPlots.SHO_R.z]
	//KEY: 右前腕ボーン（右手首-右肘）
	_p.push()
	_p.translate(jowanR[0], jowanR[1], jowanR[2])
	const zenwanR = [_tempPlots.WRI_R.x - _tempPlots.ELB_R.x, _tempPlots.WRI_R.y - _tempPlots.ELB_R.y, _tempPlots.WRI_R.z - _tempPlots.ELB_R.z]
	_p.pop()
	_p.pop()
	_p.pop()
	// SECTION:左の肩以上
	// KEY:左鎖骨ボーン（左肩先-胸骨）
	_p.push()
	const sakotsuL = _p.createVector(_tempPlots.SHO_L.x - _tempPlots.CHE.x, _tempPlots.SHO_L.y - _tempPlots.CHE.y, _tempPlots.SHO_L.z - _tempPlots.CHE.z)
	// KEY:左上腕ボーン（左肘-左肩）
	_p.push()
	_p.translate(sakotsuL)
	const jowanL = [_tempPlots.ELB_L.x - _tempPlots.SHO_L.x, _tempPlots.ELB_L.y - _tempPlots.SHO_L.y, _tempPlots.ELB_L.z - _tempPlots.SHO_L.z]
	//KEY: 左前腕ボーン（左手首-左肘）
	_p.push()
	_p.translate(jowanL[0], jowanL[1], jowanL[2])
	const zenwanL = [_tempPlots.WRI_L.x - _tempPlots.ELB_L.x, _tempPlots.WRI_L.y - _tempPlots.ELB_L.y, _tempPlots.WRI_L.z - _tempPlots.ELB_L.z]
	_p.pop()
	_p.pop()
	_p.pop()
	_p.pop()
	_p.pop()
}

// 軌跡モード
/**
 * 軌跡
 * @param {*} _p
 * @param {*} _plots
 * @param {*} _indexPosition
 * @param {Number} _trailLength 軌跡の長さ
 * @param {Array} _activeMarkers マーカーに割り当てられた数値の、配列。[0,2,5,...]
 */
export function drawTrails(_p, _plots, _indexPosition, _trailLength, _activeMarkers, _camParams) {
	_p.noFill()
	_p.stroke('#1f1f1f')
	const com = _plots[_indexPosition]['COM']
	const comDist = _p.dist(com.x, com.y, com.z, _camParams.x, _camParams.y, _camParams.z)
	console.log('comDist: ', comDist)
	// アクティブなマーカーIDの配列を生成
	const markerIDs = Object.keys(_plots[0])
		.map((id, i) => {
			return _activeMarkers.includes(i) ? id : null
		})
		.filter((e) => e != null)

	// それぞれのマーカー部位に対して
	// const preIndexPosition = (_indexPosition + _trailLength-1) % _trailLength
	markerIDs.forEach((id) => {
		// 軌跡コマぶんを数珠つなぎする
		let j = _indexPosition
		for (let i = 0; i < _trailLength; i++) {
			let lineWeight = 2 * i + (5.0 * (300.0 - comDist)) / 300.0
			const x = _plots[j][id].x
			const y = _plots[j][id].y
			const z = _plots[j][id].z
			_p.strokeWeight(lineWeight)
			_p.beginShape()
			_p.vertex(x, y, z)
			// リングバッファのjindexを生成してから
			j = (_indexPosition + i) % _trailLength
			console.log('j: ', j)
			// そのjindexコマ目の座標を格納
			const xx = _plots[j][id].x
			const yy = _plots[j][id].y
			const zz = _plots[j][id].z
			_p.vertex(xx, yy, zz)
			_p.endShape()
		}
	})
}

// ボーンの「変形」について

// // 鏡像
// 	['drawMirror']: () => {
// 		/*
// 					tempDrawPointsか、それをコピーしたオブジェクトを生成。m[]みたいな
// 					コピーしたほうのポジションを、骨盤やら重心を「起点」にして、そこから末端へと位置を決めていく
// 					鏡像にするには、180°反転するわけだが、鏡像のポジションも、「どの方向から眺めて180°回転か」がある。
// 					つねに「Y+方向から」でよいのか、あるいはそれはカメラ方向に依存するのか？
// 					*/
// 	},

// NOTE:drawHumanのメモコピー
// export function drawHuman(_p, _tempPlots, _camParams) {
// 	const com = _tempPlots['COM']
// 	const comDist = _p.dist(com.x, com.y, com.z, _camParams.x, _camParams.y, _camParams.z)
// 	console.log('comDist: ', comDist)
// 	const lineWeight = 1.0 + (20.0 * (300.0 - comDist)) / 300.0

// 	_p.stroke(255)
// 	_p.strokeWeight(lineWeight)
// 	_p.push()
// 	const comPos = _p.createVector(_tempPlots.COM.x, _tempPlots.COM.y, _tempPlots.COM.z)
// 	_p.translate(comPos) //右骨盤を原点に
// 	// SECTION:右下
// 	// KEY:右腰椎ボーン（右骨盤-重心）
// 	// _p.beginShape(_p.LINES)
// 	const yotsuiR = _p.createVector(_tempPlots.ASI_R.x - _tempPlots.COM.x, _tempPlots.ASI_R.y - _tempPlots.COM.y, _tempPlots.ASI_R.z - _tempPlots.COM.z)
// 	// TODO:描画必要なし？
// 	// _p.vertex(0, 0, 0)
// 	// _p.vertex(yotsuiR.x, yotsuiR.y, yotsuiR.z)
// 	// _p.endShape()
// 	// KEY:右太ももボーン（右膝-右骨盤）
// 	_p.push()
// 	_p.beginShape(_p.LINES)
// 	// _p.beginShape(_p.LINES)
// 	_p.translate(yotsuiR) //右骨盤を原点に
// 	const momoR = _p.createVector(_tempPlots.KNE_R.x - _tempPlots.ASI_R.x, _tempPlots.KNE_R.y - _tempPlots.ASI_R.y, _tempPlots.KNE_R.z - _tempPlots.ASI_R.z)
// 	_p.vertex(0, 0, 0)
// 	_p.vertex(momoR.x, momoR.y, momoR.z)
// 	_p.endShape()
// 	// KEY:右下腿ボーン（右足首-右膝）
// 	_p.push()
// 	_p.beginShape(_p.LINES)
// 	_p.translate(momoR) //右骨盤を原点に
// 	const suneR = _p.createVector(
// 		3.0 * _tempPlots.ANK_R.x - _tempPlots.KNE_R.x,
// 		3.0 * _tempPlots.ANK_R.y - _tempPlots.KNE_R.y,
// 		3.0 * _tempPlots.ANK_R.z - _tempPlots.KNE_R.z
// 	)
// 	_p.vertex(0, 0, 0)
// 	_p.vertex(suneR.x, suneR.y, suneR.z)
// 	_p.endShape()
// 	// KEY:右足ボーン（右つま先-右足首）
// 	_p.push()
// 	_p.beginShape(_p.LINES)
// 	_p.translate(suneR) //右足首を原点に
// 	const ashiR = _p.createVector(_tempPlots.TOE_R.x - _tempPlots.ANK_R.x, _tempPlots.TOE_R.y - _tempPlots.ANK_R.y, _tempPlots.TOE_R.z - _tempPlots.ANK_R.z)
// 	_p.vertex(0, 0, 0)
// 	_p.vertex(ashiR.x, ashiR.y, ashiR.z)
// 	_p.endShape()
// 	_p.pop()
// 	_p.pop()
// 	_p.pop()
// 	// SECTION:左
// 	// KEY:左腰椎ボーン（左骨盤-重心）
// 	// _p.beginShape(_p.LINES)
// 	const yotsuiL = _p.createVector(_tempPlots.ASI_L.x - _tempPlots.COM.x, _tempPlots.ASI_L.y - _tempPlots.COM.y, _tempPlots.ASI_L.z - _tempPlots.COM.z)
// 	// TODO:描画必要なし？
// 	// _p.vertex(0, 0, 0)
// 	// _p.vertex(yotsuiL.x, yotsuiL.y, yotsuiL.z)
// 	// _p.endShape()
// 	// KEY:左太ももボーン（左膝-左骨盤）
// 	_p.push()
// 	_p.beginShape(_p.LINES)
// 	_p.translate(yotsuiL) //左骨盤を原点に
// 	const momoL = _p.createVector(_tempPlots.KNE_L.x - _tempPlots.ASI_L.x, _tempPlots.KNE_L.y - _tempPlots.ASI_L.y, _tempPlots.KNE_L.z - _tempPlots.ASI_L.z)
// 	_p.vertex(0, 0, 0)
// 	_p.vertex(momoL.x, momoL.y, momoL.z)
// 	_p.endShape()
// 	// KEY:左下腿ボーン（左足首-左膝）
// 	_p.push()
// 	_p.beginShape(_p.LINES)
// 	_p.translate(momoL) //左骨盤を原点に
// 	const suneL = _p.createVector(_tempPlots.ANK_L.x - _tempPlots.KNE_L.x, _tempPlots.ANK_L.y - _tempPlots.KNE_L.y, _tempPlots.ANK_L.z - _tempPlots.KNE_L.z)
// 	_p.vertex(0, 0, 0)
// 	_p.vertex(suneL.x, suneL.y, suneL.z)
// 	_p.endShape()
// 	// KEY:左足ボーン（左つま先-左足首）
// 	_p.push()
// 	_p.beginShape(_p.LINES)
// 	_p.translate(suneL) //左足首を原点に
// 	const ashiL = _p.createVector(_tempPlots.TOE_L.x - _tempPlots.ANK_L.x, _tempPlots.TOE_L.y - _tempPlots.ANK_L.y, _tempPlots.TOE_L.z - _tempPlots.ANK_L.z)
// 	_p.vertex(0, 0, 0)
// 	_p.vertex(ashiL.x, ashiL.y, ashiL.z)
// 	_p.endShape()
// 	_p.pop()
// 	_p.pop()
// 	_p.pop()
// 	// SECTION:上
// 	// KEY:胸椎ボーン（胸骨-重心）
// 	const kyotsui = _p.createVector(_tempPlots.CHE.x - _tempPlots.COM.x, _tempPlots.CHE.y - _tempPlots.COM.y, _tempPlots.CHE.z - _tempPlots.COM.z)
// 	// TODO:描画必要なし？
// 	// _p.vertex(0, 0, 0)
// 	// _p.vertex(kyotsui, kyotsui, kyotsui)
// 	_p.push()
// 	_p.translate(kyotsui) //胸骨を原点に
// 	// KEY:顔ボーン（おでこ-あご）
// 	_p.push()
// 	_p.beginShape(_p.LINES)
// 	const kubi = _p.createVector(_tempPlots.JAW.x - _tempPlots.CHE.x, _tempPlots.JAW.y - _tempPlots.CHE.y, _tempPlots.JAW.z - _tempPlots.CHE.z)
// 	_p.translate(kubi) //あごを原点に
// 	const face = _p.createVector(_tempPlots.FHD.x - _tempPlots.JAW.x, _tempPlots.FHD.y - _tempPlots.JAW.y, _tempPlots.FHD.z - _tempPlots.JAW.z)
// 	_p.vertex(0, 0, 0)
// 	_p.vertex(face.x, face.y, face.z)
// 	_p.endShape()
// 	_p.pop()
// 	// SECTION:右の肩以上
// 	// KEY:右鎖骨ボーン（右肩先-胸骨）
// 	_p.push()
// 	_p.beginShape(_p.LINES)
// 	const sakotsuR = _p.createVector(_tempPlots.SHO_R.x - _tempPlots.CHE.x, _tempPlots.SHO_R.y - _tempPlots.CHE.y, _tempPlots.SHO_R.z - _tempPlots.CHE.z)
// 	_p.vertex(0, 0, 0)
// 	_p.vertex(sakotsuR.x, sakotsuR.y, sakotsuR.z)
// 	_p.endShape()
// 	// KEY:右上腕ボーン（右肘-右肩）
// 	_p.push()
// 	_p.beginShape(_p.LINES)
// 	_p.translate(sakotsuR)
// 	const jowanR = [_tempPlots.ELB_R.x - _tempPlots.SHO_R.x, _tempPlots.ELB_R.y - _tempPlots.SHO_R.y, _tempPlots.ELB_R.z - _tempPlots.SHO_R.z]
// 	_p.vertex(0, 0, 0)
// 	_p.vertex(jowanR[0], jowanR[1], jowanR[2])
// 	_p.endShape()
// 	//KEY: 右前腕ボーン（右手首-右肘）
// 	_p.push()
// 	_p.beginShape(_p.LINES)
// 	_p.translate(jowanR[0], jowanR[1], jowanR[2])
// 	const zenwanR = [_tempPlots.WRI_R.x - _tempPlots.ELB_R.x, _tempPlots.WRI_R.y - _tempPlots.ELB_R.y, _tempPlots.WRI_R.z - _tempPlots.ELB_R.z]
// 	_p.vertex(0, 0, 0)
// 	_p.vertex(zenwanR[0], zenwanR[1], zenwanR[2])
// 	_p.endShape()
// 	_p.pop()
// 	_p.pop()
// 	_p.pop()
// 	// SECTION:左の肩以上
// 	// KEY:左鎖骨ボーン（左肩先-胸骨）
// 	_p.push()
// 	_p.beginShape(_p.LINES)
// 	const sakotsuL = _p.createVector(_tempPlots.SHO_L.x - _tempPlots.CHE.x, _tempPlots.SHO_L.y - _tempPlots.CHE.y, _tempPlots.SHO_L.z - _tempPlots.CHE.z)
// 	_p.vertex(0, 0, 0)
// 	_p.vertex(sakotsuL.x, sakotsuL.y, sakotsuL.z)
// 	_p.endShape()
// 	// KEY:左上腕ボーン（左肘-左肩）
// 	_p.push()
// 	_p.beginShape(_p.LINES)
// 	_p.translate(sakotsuL)
// 	const jowanL = [_tempPlots.ELB_L.x - _tempPlots.SHO_L.x, _tempPlots.ELB_L.y - _tempPlots.SHO_L.y, _tempPlots.ELB_L.z - _tempPlots.SHO_L.z]
// 	_p.vertex(0, 0, 0)
// 	_p.vertex(jowanL[0], jowanL[1], jowanL[2])
// 	_p.endShape()
// 	//KEY: 左前腕ボーン（左手首-左肘）
// 	_p.push()
// 	_p.beginShape(_p.LINES)
// 	_p.translate(jowanL[0], jowanL[1], jowanL[2])
// 	const zenwanL = [_tempPlots.WRI_L.x - _tempPlots.ELB_L.x, _tempPlots.WRI_L.y - _tempPlots.ELB_L.y, _tempPlots.WRI_L.z - _tempPlots.ELB_L.z]
// 	_p.vertex(0, 0, 0)
// 	_p.vertex(zenwanL[0], zenwanL[1], zenwanL[2])
// 	_p.endShape()
// 	_p.pop()
// 	_p.pop()
// 	_p.pop()
// 	_p.pop()
// 	_p.pop()
// }
