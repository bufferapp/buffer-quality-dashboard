$(function() {

    var ctx = document.getElementById('issuesChart');

    var myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ["3 Weeks Ago", "2 Weeks Ago", "Last Week", "Today"],
            datasets: [
                {
                    label: 'Important Issues',
                    data: [12, 19, 3, 5],
                    backgroundColor: [
                       'rgba(54, 162, 235, 0.2)'
                    ],
                    borderColor: [
                        'rgba(54, 162, 235, 1)'
                    ],
                    borderWidth: 1
                },
                {
                    label: 'Total Issues',
                    data: [12, 19, 3, 5],
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.2)'
                    ],
                    borderColor: [
                        'rgba(75, 192, 192, 1)'
                    ],
                    borderWidth: 1
                },

            ]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero:true
                    },
                    stacked: true
                }]
            }
        }
    });

});