var labels = JSON.parse(document.getElementById('labels').value);
var rData = JSON.parse(document.getElementById('registrationsData').value);
var cData= JSON.parse(document.getElementById('confirmationsData').value);

var ctx = document.getElementById('registrationsCtx');

var registrations = new Chart(ctx, {
  type: 'line',
  data: {
    datasets: [
      {
        data: rData,
        label: 'Registrierung/Tag',
        fill: false,
        borderColor: 'rgb(212, 64, 52)',
        backgroundColor: 'rgb(212, 64, 52)'
      },
      {
        data: cData,
        label: 'Bezahlung/Tag',
        fill: false,
        borderColor: 'rgb(90,71,58)',
        backgroundColor: 'rgb(90,71,58)'
      }],
    labels: labels
  },
  options: {
    title: {
      display: true,
      fontSize: 15,
      text: 'Verlauf der Registrierung'
    },
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: true,
          stepSize: 10
        }
      }]
    }
  }
});