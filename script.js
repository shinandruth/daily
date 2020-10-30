const newRoomEndpoint = 'https://fu6720epic.execute-api.us-west-2.amazonaws.com/default/dailyWwwApiDemoNewCall',
	tokenEndpoint = 'https://dwdd5s2bp7.execute-api.us-west-2.amazonaws.com/default/dailyWWWApiDemoToken';

async function createMtgRoom() {
	try {
		let response = await fetch(newRoomEndpoint),
			room = await response.json();
		return room;

	} catch (e) {
		console.error(e);
	}
}

async function createMtgLinkWithToken(room, properties = {}) {
	try {
		let response = await fetch(
			tokenEndpoint, {
			method: 'POST',
			body: JSON.stringify({
				properties: {
					room_name: room.name, ...properties
				}
			})
		},
		);
		let token = await response.text();
		return `${room.url}?t=${token}`;
	} catch (e) {
		console.error(e);
	}
}

async function createRoom() {
	room = await createMtgRoom();
	ownerLink = await createMtgLinkWithToken(
		room, {
		is_owner: true,
		enable_recording: 'local'
	}
	);

	updateRoomInfoDisplay();
	setInterval(getRoomInfo, 5000);
	setInterval(updateNetworkInfoDisplay, 5000);
	setInterval(saveRoomDataintoDB, 5000);
}

async function createFrame() {
	callFrame = window.DailyIframe.createFrame(
		document.getElementById('call-frame-container')
	);

}

async function createFrameAndRoom() {
	document.getElementById('create-a-room').style.display = 'none';
	await createRoom();
	await createFrame();
}

function updateRoomInfoDisplay() {
	let roomInfo = document.getElementById('meeting-room-info');
	roomInfo.innerHTML = `
		<div><b>room info</b></div>
		<div>
		send to invite or click to join
		<div><a href="${room.url}" target="_blank">
		${room.url.replace('.co/', '.co/&#8203;')}
		</a></div>
		</div>
		`;
}

async function updateNetworkInfoDisplay() {
	let infoEl = document.getElementById('network-info'),
		statsInfo = await callFrame.getNetworkStats();
	infoEl.innerHTML = `
		<div><b>network stats</b></div>
		<div>
		<div>
		video send:
		${Math.floor(statsInfo.stats.latest.videoSendBitsPerSecond / 1000)} kb/s
		</div>
		<div>
		video recv:
		${Math.floor(statsInfo.stats.latest.videoRecvBitsPerSecond / 1000)} kb/s
		<div>
		worst send packet loss:
		${Math.floor(statsInfo.stats.worstVideoSendPacketLoss * 100)}%</div>
		<div>worst recv packet loss:
		${Math.floor(statsInfo.stats.worstVideoRecvPacketLoss * 100)}%</div>
		</div>
		`;
}

async function getRoomInfo() {
	let infoEl = document.getElementById('room-info'),
		roomInfo = await callFrame.room();
	infoEl.innerHTML = `
		<div><b>room stats</b></div>
		<div>
		<div>
		Room ID:
		${roomInfo.id}
		</div>
		<div>
		Room name:
		${roomInfo.name}
		</div>
		`;
}

async function saveRoomDataintoDB() {
	let roomInfo = await callFrame.room();
	let statsInfo = await callFrame.getNetworkStats();
	let participantsInfo = await callFrame.participants();
	console.log(participantsInfo)
	let json = {};
	let pjson = {};

	if (localStorage) {
		var roomId;
		var videoData;
		var participants;
		if (!localStorage['roomId']) {
			roomId = [];
		} else {
			roomId = JSON.parse(localStorage['roomId']);
		}

		if (!localStorage['videoData']) {
			videoData = [];
		} else {
			videoData = JSON.parse(localStorage['videoData']);
		}

		if (!localStorage['participants']) {
			participants = [];
		} else {
			participants = JSON.parse(localStorage['participants']);
		}

		if (!(roomId instanceof Array)) roomId = [];
		if (!(roomId.includes(roomInfo.id)) && roomInfo.id != null) {
			roomId.push(roomInfo.id)
			localStorage.setItem('roomId', JSON.stringify(roomId));
		}

		if (roomInfo.id != null) {
			json.roomId = roomInfo.id;
			json.timestamp = statsInfo.stats.latest.timestamp;
			json.videoRecvBitsPerSecond = Math.floor(statsInfo.stats.latest.videoRecvBitsPerSecond / 1000);
			json.videoSendBitsPerSecond = Math.floor(statsInfo.stats.latest.videoSendBitsPerSecond / 1000);
			json.videoRecvPacketLoss = Math.floor(statsInfo.stats.videoRecvPacketLoss * 100)
			json.videoSendPacketLoss = Math.floor(statsInfo.stats.videoSendPacketLoss * 100)

			pjson.roomId =
			videoData.push(json)
			localStorage.setItem('videoData', JSON.stringify(videoData));
		}

		// Retrieve
		let storageEl = document.getElementById("result");
		storageEl.innerHTML = `
		<div><h1> Dashboard </h1></div>
		${localStorage.getItem("roomId")}
		`
	} else {
		let storageEl = document.getElementById("result");
		storageEl.innerHTML = `Sorry, your browser does not support Web Storage...`
	};
}

function createTable() {
	let data = JSON.parse(localStorage['roomId']),
		table = document.createElement('table'),
		thead = document.createElement('thead'),
		tbody = document.createElement('tbody'),
		th,
		tr,
		td;

	th = document.createElement('th'),
		th.innerHTML = "Room ID";
	table.appendChild(th);
	table.appendChild(thead);
	table.appendChild(tbody);
	document.body.insertBefore(table, document.body.firstChild);

	for (var i = 0; i < data.length; i++) {
		tr = document.createElement('tr');
		td = document.createElement('td');
		td.innerHTML = data[i];
		td.onclick = function () {
			const items = document.querySelectorAll('table > tbody > tr > td');
			items.forEach(item => {
				item.addEventListener('click', (e) => {
					renderBitsChart(e.target.textContent);
					renderPacketChart(e.target.textContent);
				}
				)
			})
		}
		tr.appendChild(td);

		tbody.appendChild(tr);
	}
}

// function timeConverter(UNIX_timestamp){
//   var a = new Date(UNIX_timestamp * 1000);
//   var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
//   var year = a.getFullYear();
//   var month = months[a.getMonth()];
//   var date = a.getDate();
//   var hour = a.getHours();
//   var min = a.getMinutes();
//   var sec = a.getSeconds();
//   var time = date + ' ' + month + ' ' + hour + ':' + min + ':' + sec ;
//   return time;
// }


function renderBitsChart(roomId) {
	// console.log(localStorage.videoData)
	let timestamp = [],
		videoRecvBitsPerSecond = [],
		videoSendBitsPerSecond = [],
		backgroundColorRecv = [],
		borderColorRecv = [];
	backgroundColorSend = [],
		borderColorSend = [];

	for (var i = 0; i < (JSON.parse(localStorage.videoData)).length; i++) {
		// date = timeConverter(JSON.parse(localStorage.videoData)[i]["timestamp"]);
		// console.log(JSON.parse(localStorage.videoData)[i]["timestamp"])
		// console.log(JSON.parse(localStorage.videoData)[i]['roomId'])
		// console.log('ROOM ID VARIABLE IS', roomId)
		if (JSON.parse(localStorage.videoData)[i]['roomId'] == roomId) {
			timestamp.push(JSON.parse(localStorage.videoData)[i]["timestamp"])
			videoRecvBitsPerSecond.push(JSON.parse(localStorage.videoData)[i]["videoRecvBitsPerSecond"]);
			videoSendBitsPerSecond.push(JSON.parse(localStorage.videoData)[i]["videoSendBitsPerSecond"]);

			backgroundColorRecv.push('rgba(54, 162, 235, 0.2)');
			borderColorRecv.push('rgba(54, 162, 235, 1)');

			backgroundColorSend.push('rgba(255, 206, 86, 0.2)');
			borderColorSend.push('rgba(255, 206, 86, 1)');
		}
	}
	var ctx = document.getElementById("bits").getContext("2d");
	new Chart(ctx, {
		type: 'line',
		data: {
			labels: timestamp,
			datasets: [{
				label: 'Video Recv Bits/Sec',
				data: videoRecvBitsPerSecond,
				backgroundColor: backgroundColorRecv,
				borderColor: borderColorRecv,
				borderWidth: 1
			},
			{
				label: 'Video Send Bits/Sec',
				data: videoSendBitsPerSecond,
				backgroundColor: backgroundColorSend,
				borderColor: borderColorSend,
				borderWidth: 1
			}
			],
		},
		options: {
			scales: {
				yAxes: [{
					ticks: {
						beginAtZero: true
					}
				}]
			}
		}
	});

}

function renderPacketChart(roomId) {
	// console.log(localStorage.videoData)
	let timestamp = [],
		videoRecvPacketLoss = [],
		videoSendPacketLoss = [],
		backgroundColorRecv = [],
		borderColorRecv = [],
		backgroundColorSend = [],
		borderColorSend = [];

	for (var i = 0; i < (JSON.parse(localStorage.videoData)).length; i++) {
		// date = timeConverter(JSON.parse(localStorage.videoData)[i]["timestamp"]);
		if ((JSON.parse(localStorage.videoData)[i]['roomId'] == roomId)) {
			timestamp.push(JSON.parse(localStorage.videoData)[i]["timestamp"])
			videoRecvPacketLoss.push(JSON.parse(localStorage.videoData)[i]["videoRecvPacketLoss"] * 100);
			videoSendPacketLoss.push(JSON.parse(localStorage.videoData)[i]["videoSendPacketLoss"] * 100);

			backgroundColorRecv.push('rgba(75, 192, 192, 0.2)');
			borderColorRecv.push('rgba(75, 192, 192, 1)');

			backgroundColorSend.push('rgba(153, 102, 255, 0.2)');
			borderColorSend.push('rgba(153, 102, 255, 1)');
		}
	}
	var ctx = document.getElementById("packet").getContext("2d");
	new Chart(ctx, {
		type: 'line',
		data: {
			labels: timestamp,
			datasets: [{
				label: 'Video Recv Pack Loss (%)',
				data: videoRecvPacketLoss,
				backgroundColor: backgroundColorRecv,
				borderColor: borderColorRecv,
				borderWidth: 1
			},
			{
				label: 'Video Send Pack Loss (%)',
				data: videoSendPacketLoss,
				backgroundColor: backgroundColorSend,
				borderColor: borderColorSend,
				borderWidth: 1
			}
			],
		},
		options: {
			scales: {
				yAxes: [{
					ticks: {
						beginAtZero: true
					}
				}]
			}
		}
	});

}
