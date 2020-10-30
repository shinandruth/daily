

async function getRoomInfo() {
  try {
    const data = null;
    var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    let xhr = new XMLHttpRequest();

    xhr.addEventListener("readystatechange", function () {
      if (this.readyState === this.DONE) {
        console.log(this.responseText);
      }
    });

    xhr.open("GET", "https://api.daily.co/v1/rooms");
    xhr.setRequestHeader("Authorization", "Bearer ");

    xhr.send(data);
  } catch (e) {
    console.error(e);

  }
}

getRoomInfo()