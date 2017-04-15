var shirts = JSON.parse(document.getElementById('shirts').value);

var slimCtx = document.getElementById('slimShirtsCtx');
var regularCtx = document.getElementById('regularShirtsCtx');

var s = new Chart(slimCtx, {
  type: 'bar',
  data: {
    labels: ['XS', 'S', 'M', 'L'],
    datasets: [
      {
        label: 'Bestellt & bezahlt',
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)'
        ],
        borderColor: [
          'rgba(255,99,132,1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 1,
        data: [shirts.slim.xs, shirts.slim.s, shirts.slim.m, shirts.slim.l],
      }
    ]
  },
  options: {
    title: {
      display: true,
      fontSize: 15,
      text: 'Tallierte T-Shirts'
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

var n = new Chart(regularCtx, {
  type: 'bar',
  data: {
    labels: ['S', 'M', 'L', 'XL'],
    datasets: [
      {
        label: 'Bestellt & bezahlt',
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)'
        ],
        borderColor: [
          'rgba(255,99,132,1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 1,
        data: [shirts.regular.s, shirts.regular.m, shirts.regular.l, shirts.regular.xl],
      }
    ]
  },
  options: {
    title: {
      display: true,
      fontSize: 15,
      text: 'Normale T-Shirts'
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