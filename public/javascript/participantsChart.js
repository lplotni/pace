var participants = JSON.parse(document.getElementById('participants').value);

var participantsCtx = document.getElementById('participantsCtx');

var pChart = new Chart(participantsCtx, {
  type: 'bar',
  data: {
    labels: ['Bezahlt', 'Nicht bezahlt'],
    datasets: [
      {
        label: 'Anzahl',
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)'
        ],
        borderColor: [
          'rgba(255,99,132,1)',
          'rgba(54, 162, 235, 1)'
        ],
        borderWidth: 1,
        data: [participants.confirmed, participants.unconfirmed],
      }
    ]
  },
  options: {
    title: {
      display: true,
      fontSize: 15,
      text: 'Zahlungsmoral (Anmeldungen)'
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
