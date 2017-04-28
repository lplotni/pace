let webSocket = new WebSocket("ws://" + location.hostname + (location.port ? ':'+location.port: '') + "/live-results");

webSocket.onmessage = function(message) {
  let liveResultscontainer = document.getElementById("live-results");

  let resultP = document.createElement("p");

  let resultText = document.createTextNode(message.data);
  resultP.appendChild(resultText);

  liveResultscontainer.appendChild(resultP);
};