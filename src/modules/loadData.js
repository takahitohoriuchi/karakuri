/*TODO:markerdDataの時点で、ORIGINを足す。
{
	0: {
		id: "ORIGIN",
		name: "原点",
		plots: [
			{
				x: 0,
				y: 0,
				z: 0
			},
			{},{},...（フレーム数だけある）

		]
	}
}
コイツをpushする。
*/

/**
 * 元csvをロードして、markerごとに整理した配列を生成する
 * @param {*} _file
 * @returns 配列
 * NOTE:出力データの構造
 *
 */
export async function genMarkeredData(_file) {
	let file = _file.target.files[0]

	if (!file.type.match('text/csv')) {
		console.log('csvにしてください')
		return 'csvじゃないよ！'
	}

	let reader = new FileReader()
	reader.readAsText(file)
	return new Promise((resolve, reject) => {
		reader.onload = async () => {
			let rows = reader.result.split('\r\n') //NOTE:「\n」の場合と場合分けしたい。TODO:
			rows.splice(0, 3) //1-4行目を削除
			rows.splice(2, 2) //もとの6,7行目を削除
			console.log('rows[0]: ', rows[0])
			console.log('rows[1]: ', rows[1])
			let tempCol = rows[0].split(',')
			// ラベル行の列数だけの空配列要素をもつ配列を生成
			let cols = tempCol.map(() => [])

			// colsを生成（1行目から順に、「（部位名）、ID, 1コマ目値, 2コマ目値, ...」 ）
			rows.forEach((row) => {
				let tempCells = row.split(',')
				tempCells.forEach((cell, j) => {
					cols[j].push(cell)
				})
			})

			console.log('cols: ', cols)
			// Frame列はいらない
			// 調整する
			// cols[0][0] = 'time'/

			let finalData = []
			const markerNum = (cols.length - 2) / 3 //「-2」は、「frame列」と「time列」をのぞいてる

			console.log('markerNum: ', markerNum)

			for (let i = 0; i < markerNum; i++) {
				// const name = cols[3 * i + 2][0] //+2なのは、frame列とtime列をとばした
				const id = cols[3 * i + 2][0] //+2なのは、frame列とtime列をとばした
				const name = cols[3 * i + 2][1] //+2なのは、frame列とtime列をとばした
				let plots = []
				for (let j = 0; j < cols[3 * i + 1].length; j++) {
					//NOTE:空白セルぶんのx,y,zは「NaN」になる！
					const x = parseFloat(cols[3 * i + 2][j]) * 100
					const y = parseFloat(cols[3 * i + 3][j]) * 100
					const z = parseFloat(cols[3 * i + 4][j]) * 100
					const plot = { x: x, y: y, z: z }
					plots.push(plot)
				}
				const markerObj = {
					id: id,
					name: name,
					plots: plots,
				}
				finalData.push(markerObj)
				/* NOTE:再構造化する
					[
						{
							name: 'C80C0',（マーカーID。最終的には部位IDにする）
							plots: [
								{x: 0.24, y: 0.56, z:6.4},//1コマ目
								{x: 0.26, y: 0.84, z: 4.3},//2コマ目
								...,
								{},（空オブジェクトも許容）
								...,
							],                
						},
						{
							name: 'C8100',
							plots: [
								{x: --, y: --, z: --},
								...
							]
						},
						...
						{
							time: [0.000, 0.002, 0.0043,...]
						}
					]
				*/
			}
			// finalDataに{id: "ORIGIN",name: "原点", plots: [{x: 0,y: 0,z: 0},{},{},...（フレーム数だけある）]}をつけたす
			let frameNum = finalData[0].plots.length
			let originData = {
				id: 'ORIGIN',
				name: '原点',
				plots: [],
			}
			for (let i = 0; i < frameNum; i++) {
				originData.plots.push({ x: 0, y: 0, z: 0 })
			}
			finalData.push(originData)

			// finalDataに{name:'重心', id: 'COM', plots:[{},{},{}...]}をつけたす
			const comData = await calcCOM(finalData)
			finalData.push(comData)

			console.log('finalData: ', finalData)
			resolve(finalData)
		}
		reader.onerror = (e) => reject(e)
	})
}

/**
 * 【重心を計算する関数】
 * @param {*} _finalData {Object}。そのコマの全マーカーをあらわすobj
 * @returns comのオブジェクト
 */
async function calcCOM(_finalData) {
	return new Promise((resolve) => {
		//重心初期化
		let com = {
			id: 'COM',
			name: '重心',
			plots: [],
		}
		// plots[]フィールドにコマ数ぶんの初期化objを代入
		com.plots = _finalData[1].plots.map(() => {
			return { x: 0, y: 0, z: 0 }
		}) //TODO:[1]でいいか確認

		// comのx,y,zを、全コマぶん足し込んでいく
		_finalData.forEach((markerObj) => {
			// NOTE:markerObj:{id:部位ID, name:部位名, plots:[{コマ1データ, コマ2データ, ...}]}
			markerObj.plots.forEach((plot, i) => {
				com.plots[i].x += plot.x
				com.plots[i].y += plot.y
				com.plots[i].z += plot.z
			})
		})

		// 足し込んだものを、部位数（マーカー数）で割る
		const markerNum = Object.keys(_finalData).length
		com.plots.forEach((plot) => {
			plot.x /= markerNum
			plot.y /= markerNum
			plot.z /= markerNum
		})

		console.log('com: ', com)
		resolve(com)
	})
}

/**
 * markeredデータから、framedDataに加工する
 * @param {Array} _markeredData
 * @returns [{部位ID1: {x:●, y:●, z:●}, 部位ID2:{x:●,y:●,z:●}, ...}]
 */
export async function genFramedData(_markeredData) {
	return new Promise((resolve) => {
		//コマ数ぶんの空obj↓が入った配列を生成
		let resultArray = _markeredData[0].plots.map(() => {
			return new Object()
		})

		_markeredData.forEach((marker) => {
			const id = marker.id
			const name = marker.name
			// NOTE:ここ、キーがidで、バリューの中にnameを含める
			marker.plots.forEach((plot, j) => {
				resultArray[j][id] = {
					x: plot.x,
					y: plot.y,
					z: plot.z,
					name: name,
				}
			})
		})
		console.log('resultArray(genFramedData): ', resultArray)
		resolve(resultArray)
	})
}
