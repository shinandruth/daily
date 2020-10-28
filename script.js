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
	setInterval(updateNetworkInfoDisplay, 15000);
	setInterval(saveRoomDataintoDB, 15000);
}

async function createFrame() {
	// let customLayout = !!document
	// 	.querySelector('input[name="customLayout"]:checked')
	// 	.value,
	// 	cssFile = customLayout ? 'style.css' : null;

	callFrame = window.DailyIframe.createFrame(
		document.getElementById('call-frame-container')
		// { customLayout, cssFile }
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
		<div><b>network stats</b></div>
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
	let json = {};

	if (localStorage) {
		var roomId;
		var videoData;
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
			videoData.push(json)
			localStorage.setItem('videoData', JSON.stringify(videoData));
		}
		console.log(localStorage);

		// Retrieve
		let storageEl = document.getElementById("result");
		storageEl.innerHTML = `
		<div><h1> Dashboard </h1></div>
		${localStorage.getItem("roomId")}
		`

		let DatastorageEl = document.getElementById("videoData");
		DatastorageEl.innerHTML = `
			<div><h1> Video Data </h1></div>
				${localStorage.getItem("videoData")}
		`
	} else {
		let storageEl = document.getElementById("result");
		storageEl.innerHTML = `Sorry, your browser does not support Web Storage...`
	};
}