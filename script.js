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
	setInterval(updateNetworkInfoDisplay, 15000);
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
}
