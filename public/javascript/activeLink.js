$(document).ready(function() {
  var links = $('a');
  for (var i = links.length; i >= 0; i--) {
    if (document.URL.indexOf(links[i-1].getAttribute('href')) > 0) {
      links[i-1].style.color = 'black';
      break;
    }
  }
});