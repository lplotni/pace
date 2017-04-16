let webSocket = new WebSocket("ws://" + location.hostname + (location.port ? ':'+location.port: '') + "/live-results");

webSocket.onmessage = function(message) {
  let liveResultscontainer = document.getElementById("live-results");
  let m = JSON.parse(message.data);
  let nameText = document.createTextNode(m.name);
  let timeText = document.createTextNode(m.time);

  let resultDiv = document.createElement("div");
  resultDiv.className = "result";
  let nameSpan = document.createElement("span");
  nameSpan.className = "participantName";
  let timeSpan = document.createElement("span");
  timeSpan.className = "participantTime";

  nameSpan.appendChild(nameText);
  timeSpan.appendChild(timeText);
  resultDiv.appendChild(nameSpan);
  resultDiv.appendChild(timeSpan);
  liveResultscontainer.insertBefore(resultDiv, liveResultscontainer.childNodes[0]);
};
