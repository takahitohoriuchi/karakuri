/*NOTE:
どのカラクリも、「plots」を元データに（引数にして）つかえ！！！
plotsの形：
	plots[indexPosition][COM] 
	↑の中身は {name: ?, x: 数値, y:数値, z:数値}といったobjになってる。
	そのobjが部位ごとにまとまったものが、「軌跡長さぶんの」コマごとにある。
 */

import {get2dPosFrom3dPos} from './otherUtils.js'

// スケルトン（各マーカーのデフォ親子関係 & ボーン伸縮率）
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
// これを自在のクリックUIで、むすんだりはずしたりしたい。
// この変数は、書き換えられるものなので、本ファイルではなく、PlayViewとかにつくらんとダメ？あれでも配列だから？？
export const defaultEdges = [
	// NOTE:デフォは棒人間型のセット
	['COM', 'CHE'],
	['CHE', 'JAW'],['JAW', 'FHD'],
	['CHE', 'SHO_R'],['SHO_R', 'ELB_R'],['ELB_R', 'WRI_R'],
	['CHE', 'SHO_L'],['SHO_L', 'ELB_L'],['ELB_L', 'WRI_L'],
	['COM', 'ASI_R'],['ASI_R', 'KNE_R'],['KNE_R', 'ANK_R'],['ANK_R', 'TOE_R'],
	['COM', 'ASI_L'],['ASI_L', 'KNE_L'],['KNE_L', 'ANK_L'],['ANK_L', 'TOE_L']	
]


function isThisEdgeExist(_edges, _tsunagiNodeID1, _tsunagiNodeID2) {
	let result = _edges.some((v) => v.includes(_tsunagiNodeID1) && v.includes(_tsunagiNodeID2))
	console.log('result: ', result)
	return result
}

/**
 * 点どうしのむすび/ほどきを更新する
 * @param {Array} _edges 
 * @param {String} _tsunagiNodeID1 
 * @param {String} _tsunagiNodeID2 
 */
export function updateEdges(_edges, _tsunagiNodeID1, _tsunagiNodeID2){
	const bool = isThisEdgeExist(_edges, _tsunagiNodeID1, _tsunagiNodeID2)	
	if(!bool){
		_edges.push([_tsunagiNodeID1, _tsunagiNodeID2])
	}else{
		let index = _edges.indexOf([_tsunagiNodeID1, _tsunagiNodeID2])		
		_edges.splice(index, 1)
	}

}

/**
 * エッジ（点どうしをむすぶ線）を描く
 * @param {*} _p 
 * @param {*} _tempPlots 
 * @param {*} _edges 
 * @param {*} _camParams 
 */
export function drawEdges(_p, _tempPlots, _edges, _camParams){	
	const com = _tempPlots['COM']
	const comDist = _p.dist(com.x, com.y, com.z, _camParams.x, _camParams.y, _camParams.z)	
	const lineWeight = 1.0 + (20.0 * (300.0 - comDist)) / 300.0
	_p.stroke(255)
	_p.strokeWeight(lineWeight)	
	_edges.forEach((e) => {
		_p.beginShape(_p.LINES)
		_p.vertex(_tempPlots[`${e[0]}`].x, _tempPlots[`${e[0]}`].y, _tempPlots[`${e[0]}`].z)
		_p.vertex(_tempPlots[`${e[1]}`].x, _tempPlots[`${e[1]}`].y, _tempPlots[`${e[1]}`].z)
		_p.endShape()
	})
}


/**
 * 長押しクリックで、tempSHINSHUKUに部位情報をセットする
 * @param {Object} _tempSHINSHUKU 
 * @param {String} _nearestMarkerID 
 * @param {Object} _skeleton 
 */
export function setTempSHINSHUKU(_p, _tempPlots, _tempSHINSHUKU, _nearestMarkerID, _camParams, _skeleton=skeletonModel){	
	const child = _nearestMarkerID
	if(child == 'COM'){
		console.log('COMはダメ')
	}else{
		// Lv1の部位
		let parent = null
		let rate = null//NOTE:1.0のほうがいい？？
		const lv1Objs = _skeleton.children		
		lv1Objs.forEach(lv1Obj=>{
			if(lv1Obj.id == child){
				parent = lv1Obj.parent
				rate = lv1Obj.rate
			}else{
				// Lv２の部位
				const lv2Objs = lv1Obj.children
				lv2Objs.forEach((lv2Obj) => {
					if (lv2Obj.id == child) {
						parent = lv2Obj.parent
						rate = lv2Obj.rate
					} else {
						// Lv３の部位
						const lv3Objs = lv2Obj.children
						lv3Objs.forEach((lv3Obj) => {
							if (lv3Obj.id == child) {
								parent = lv3Obj.parent
								rate = lv3Obj.rate
							} else {
								// Lv４の部位
								const lv4Objs = lv3Obj.children
								lv4Objs.forEach((lv4Obj) => {
									if (lv4Obj.id == child) {
										parent = lv4Obj.parent
										rate = lv4Obj.rate
									} else {
										console.log('no data')
									}
								})
							}
						})
					}
				})
			}
		})
		console.log('parent: ', parent)
		console.log('rate: ', rate)
		_tempSHINSHUKU.id = child
		_tempSHINSHUKU.parent = parent
		_tempSHINSHUKU.rate = rate

		// 親ノードと子ノードの3Dの差分ベクトル
		const childNode3dPos = [_tempPlots[child].x, _tempPlots[child].y, _tempPlots[child].z]
		const parentNode3dPos = [_tempPlots[parent].x, _tempPlots[parent].y, _tempPlots[parent].z]
		console.log('childNode3dPos: ', childNode3dPos)
		console.log('parentNode3dPos: ', parentNode3dPos)
		const p2cVec3d = _p.createVector(
			childNode3dPos[0] - parentNode3dPos[0], 
			childNode3dPos[1] - parentNode3dPos[1], 
			childNode3dPos[2] - parentNode3dPos[2], 
		)
		_tempSHINSHUKU.p2cVec3d = p2cVec3d				

		// 親ノードと子ノードの2Dキャンバス座標を求め、		
		const childNode2dPos = get2dPosFrom3dPos(childNode3dPos, _camParams)
		const parentNode2dPos = get2dPosFrom3dPos(parentNode3dPos, _camParams)

		// 「親→子」ベクトルをもとめる
		let p2cVec2d = _p.createVector(
			childNode2dPos[0] - parentNode2dPos[0],		
			childNode2dPos[1] - parentNode2dPos[1]
		)
		
		_tempSHINSHUKU.p2cVec2d = p2cVec2d
		console.log('_tempSHINSHUKU: ', _tempSHINSHUKU)
	}	
}

/**
 * tempSHINSHUKUを元に戻す
 * @param {Object} _tempSHINSHUKU 
 */
export function initTempSHINSHUKU(_tempSHINSHUKU){	
	_tempSHINSHUKU.id = null
	_tempSHINSHUKU.parent = null
	_tempSHINSHUKU.rate = null
	_tempSHINSHUKU.p2cVec2d = null
	_tempSHINSHUKU.p2cVec3d = null
	console.log('_tempSHINSHUKU: ', _tempSHINSHUKU)
}

/**
 * tempSHINSHUKU.rateを、マウスドラッグにしたがいリアルタイム伸び縮み更新
 * @param {Object} _p 
 * @param {Object} _tempPlots 
 * @param {Object} _tempSHINSHUKU 
 * @param {Object} _camParams 
 */
export function updateTempRate(_p, _tempSHINSHUKU){
	const p2cVec2d = _tempSHINSHUKU.p2cVec2d
	
	// （1） マウスムーブベクトルをもとめる
	let mouseMove = _p.createVector(
		_p.mouseX - _p.pmouseX,
		_p.mouseY - _p.pmouseY
	)
	mouseMove.normalize()
	p2cVec2d.normalize()
	// （2) p2cVecとマウスムーブの、両者の内積をとる		
	const dot = p2cVec2d.dot(mouseMove)
	console.log('dot: ', dot)

	// （3） 内積によってtempRateをいじる	
	if(Math.abs(dot) > 0.707106){
		//...45度(1/√2)以内だけ有効
		let rate
		// 同じ向き
		if (dot > 0) {
			rate = 0.01
		}
		// 逆向き
		else {
			rate = -0.01
		}
		// （4） rateを更新
		_tempSHINSHUKU.rate += rate
		console.log('tempSHINSHUKU: ', _tempSHINSHUKU)
	}		
}

// TODO:optiondで伸ばしたら、framedDataを更新する。
export function updateFramedData(_tempSHINSHUKU, _framedData, _skeleton){
	// NOTE:クエリはsetSHINSHUKUを参考にした	
	// (1)_skeletonのうち、_markerIDぶんのrateのみを更新する・・・updateSkeleton			
	const _markerID = _tempSHINSHUKU.id
	const _rate = _tempSHINSHUKU.rate
	const lv1Objs = _skeleton.children //NOTE:Lv1の部位から順番に！
	lv1Objs.forEach((lv1Obj) => {
		if (lv1Obj.id == _markerID) {
			// parent = lv1Obj.parent
			lv1Obj.rate = _rate			
		} else {
			// Lv２の部位
			const lv2Objs = lv1Obj.children
			lv2Objs.forEach((lv2Obj) => {
				if (lv2Obj.id == _markerID) {
					lv2Obj.rate = _rate
				} else {
					// Lv３の部位
					const lv3Objs = lv2Obj.children
					lv3Objs.forEach((lv3Obj) => {
						if (lv3Obj.id == _markerID) {
							lv3Obj.rate = _rate
						} else {
							// Lv４の部位
							const lv4Objs = lv3Obj.children
							lv4Objs.forEach((lv4Obj) => {
								if (lv4Obj.id == _markerID) {
									lv4Obj.rate = _rate
								} else {
									console.log('no data')
								}
							})
						}
					})
				}
			})
		}
	})
	// (2)_framedDataに対して、_markerIDの子供たちをすべて、rateを反映させる。・・・skeletonをつかって
	let childrenID4Update = getChildren(_markerID, _skeleton)	
	
	console.log('childrenID4Update: ', childrenID4Update)
	_framedData.forEach(data=>{
		childrenID4Update.forEach(childID4Update=>{
			data[childID4Update].x += _tempSHINSHUKU.p2cVec3d.x
			data[childID4Update].y += _tempSHINSHUKU.p2cVec3d.y
			data[childID4Update].z += _tempSHINSHUKU.p2cVec3d.z
		})		
	})
	console.log('framedDataのアプデ完了')
}

function getChildren(_markerID, _skeleton){
	// とりあえず全マーカーリストにしといて、「子どもと本人」以外取り去るという方針
	let resultChildren = []
	const lv1Objs = _skeleton.children //NOTE:Lv1の部位から順番に！
	lv1Objs.forEach((lv1Obj) => {
		if (lv1Obj.id == _markerID) {
			// TODO:ここに処理
			resultChildren.push(_markerID) // 追加
			// TODO:childrenがundefinedだったら、これ以上求めない
			if('children' in lv1Obj){
				let tempLv2Objs = lv1Obj.children
				tempLv2Objs.forEach((lv2Obj) => {
					resultChildren.push(lv2Obj.id) // 追加
					if('children' in lv2Obj){
						let tempLv3Objs = lv2Obj.children
						tempLv3Objs.forEach((lv3Obj) => {
							resultChildren.push(lv3Obj.id) // 追加
							if('children' in lv3Obj){
								let tempLv4Objs = lv3Obj.children
								tempLv4Objs.forEach((lv4Obj) => {
									resultChildren.push(lv4Obj.id) //追加
								})
							}else{
								console.log('children')
							}							
						})
					}else{
						console.log('no data')
					}					
				})				
			}else{
				console.log('no data')				
			}			
		}
		else {
			// Lv２の部位
			if('children' in lv1Obj){
				const lv2Objs = lv1Obj.children
				lv2Objs.forEach((lv2Obj) => {
					if (lv2Obj.id == _markerID) {
						resultChildren.push(lv2Obj.id) // 追加
						if ('children' in lv2Obj) {
							let tempLv3Objs = lv2Obj.children
							tempLv3Objs.forEach((lv3Obj) => {
								resultChildren.push(lv3Obj.id) // 追加
								if ('children' in lv3Obj) {
									let tempLv4Objs = lv3Obj.children
									tempLv4Objs.forEach((lv4Obj) => {
										resultChildren.push(lv4Obj.id) //追加
									})
								} else {
									console.log('children')
								}
							})
						} else {
							console.log('no data')
						}
					} else {
						// Lv３の部位
						if('children' in lv2Obj){
							const lv3Objs = lv2Obj.children
							lv3Objs.forEach((lv3Obj) => {
								if (lv3Obj.id == _markerID) {
									resultChildren.push(lv3Obj.id) // 追加
									if ('children' in lv3Obj) {
										let tempLv4Objs = lv3Obj.children
										tempLv4Objs.forEach((lv4Obj) => {
											resultChildren.push(lv4Obj.id) //追加
										})
									} else {
										console.log('children')
									}
								} else {
									// Lv４の部位
									if('children' in lv3Obj){
										const lv4Objs = lv3Obj.children
										lv4Objs.forEach((lv4Obj) => {
											if (lv4Obj.id == _markerID) {
												resultChildren.push(lv4Obj.id) // 追加
											} else {
												console.log('no data')
											}
										})										
									}else{
										console.log('no data')
									}									
								}
							})
						}else{
							console.log('no data')
						}						
					}
				})
			}else{
				console.log('no data')
			}			
		}
	})
	console.log('resultChildren: ', resultChildren)
	return resultChildren
}

/**
 * 伸縮中のゴムひもを描画する
 * @param {*} _p 
 * @param {*} _tempPlot 
 * @param {*} _tempSHINSHUKU 
 * @param {*} _camParams 
 */
export function drawSHINSHUKU(_p, _tempPlot, _tempSHINSHUKU, _camParams){
	const child = _tempPlot[_tempSHINSHUKU.id]
	const parent = _tempPlot[_tempSHINSHUKU.parent]
	const p2cVec3d = _tempSHINSHUKU.p2cVec3d
	const rate = _tempSHINSHUKU.rate		

	// parentのノード位置はそのまま
	const modifiedChild = {
		x: parent.x + p2cVec3d.x * rate,
		y: parent.y + p2cVec3d.y * rate,
		z: parent.z + p2cVec3d.z * rate,
		id: child.id,
	}				
	// d = 重心からカメラの距離 を測る。そのぶんを、最低ドットサイズに反映させる。
	const com = _tempPlot['COM']
	const comDist = _p.dist(com.x, com.y, com.z, _camParams.x, _camParams.y, _camParams.z)
	// （１） parentNodeの描画
	const camDist = _p.dist(parent.x, parent.y, parent.z, _camParams.x, _camParams.y, _camParams.z)
	const dotSize = comDist * 0.05 + (50.0 * (300.0 - camDist)) / 300.0 //NOTE:10ポイント（距離300）を基準にする。距離300はカメラ-原点の初期距離
	_p.strokeWeight(dotSize)
	_p.stroke('rgba(100%, 5.9%, 45.1%, 0.9)')
	_p.beginShape(_p.POINTS)
	_p.vertex(parent.x, parent.y, parent.z)
	_p.endShape()
	// (2) modifiedChildNodeの描画
	const camDist2 = _p.dist(modifiedChild.x, modifiedChild.y, modifiedChild.z, _camParams.x, _camParams.y, _camParams.z)
	const dotSize2 = comDist * 0.05 + (50.0 * (300.0 - camDist2)) / 300.0 //NOTE:10ポイント（距離300）を基準にする。距離300はカメラ-原点の初期距離		
	_p.strokeWeight(dotSize2)
	_p.stroke('rgba(100%, 5.9%, 45.1%, 0.9)')	
	_p.beginShape(_p.POINTS)
	_p.vertex(modifiedChild.x, modifiedChild.y, modifiedChild.z)
	_p.vertex(0, 0, 0)
	_p.endShape()
	// (3) あいだのエッジの描画 	
	const lineWeight = 1.0 + (20.0 * (300.0 - comDist)) / 300.0
	_p.strokeWeight(lineWeight)
	_p.beginShape()
	_p.vertex(parent.x, parent.y, parent.z)
	_p.vertex(modifiedChild.x, modifiedChild.y, modifiedChild.z)
	_p.endShape()
	// (4) rateの数値描画
	const mid = _p.createVector((parent.x + modifiedChild.x) * 0.5, (parent.y + modifiedChild.y) * 0.5, (parent.z + modifiedChild.z) * 0.5)		
	_p.push()
	_p.translate(mid.x, mid.y, mid.z)
	_p.rotateY(_camParams.theta)
	_p.rotateX(-_camParams.phi)
	_p.rotateZ(Math.PI)
	_p.fill('#eeeeee')
	_p.text(`${rate.toFixed(2)}`, 0, 0)	
	_p.pop()
	// console.log('rate: ', rate)
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
// export function drawTrails(_p, _plots, _indexPosition, _trailLength, _activeMarkers, _camParams) {
// 	_p.noFill()
// 	_p.stroke('#1f1f1f')
// 	const com = _plots[_indexPosition]['COM']
// 	const comDist = _p.dist(com.x, com.y, com.z, _camParams.x, _camParams.y, _camParams.z)
// 	console.log('comDist: ', comDist)
// 	// アクティブなマーカーIDの配列を生成
// 	const markerIDs = Object.keys(_plots[0])
// 		.map((id, i) => {
// 			return _activeMarkers.includes(i) ? id : null
// 		})
// 		.filter((e) => e != null)

// 	// それぞれのマーカー部位に対して
// 	// const preIndexPosition = (_indexPosition + _trailLength-1) % _trailLength
// 	markerIDs.forEach((id) => {
// 		// 軌跡コマぶんを数珠つなぎする
// 		let j = _indexPosition
// 		for (let i = 0; i < _trailLength; i++) {
// 			let lineWeight = 2 * i + (5.0 * (300.0 - comDist)) / 300.0
// 			const x = _plots[j][id].x
// 			const y = _plots[j][id].y
// 			const z = _plots[j][id].z
// 			_p.strokeWeight(lineWeight)
// 			_p.beginShape()
// 			_p.vertex(x, y, z)
// 			// リングバッファのjindexを生成してから
// 			j = (_indexPosition + i) % _trailLength
// 			console.log('j: ', j)
// 			// そのjindexコマ目の座標を格納
// 			const xx = _plots[j][id].x
// 			const yy = _plots[j][id].y
// 			const zz = _plots[j][id].z
// 			_p.vertex(xx, yy, zz)
// 			_p.endShape()
// 		}
// 	})
// }

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
