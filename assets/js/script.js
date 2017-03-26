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
                       '#BAE2F1'
                    ],
                    borderColor: [
                        '#5FB6ED'
                    ],
                    borderWidth: 1
                },
                {
                    label: 'Total Issues',
                    data: [12, 19, 3, 5],
                    backgroundColor: [
                        '#DBF2F2'
                    ],
                    borderColor: [
                        '#4BC0C0'
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