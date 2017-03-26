$(function() {

    var ctx = document.getElementById('issuesChart');

    $.get( '/data', function( data ) {
        $( ".result" ).html( data );
            var myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ["3 Weeks Ago", "2 Weeks Ago", "Last Week", "Today"],
                datasets: [
                    {
                        label: 'Important Issues',
                        data: data.importantIssues,
                        backgroundColor: [
                           '#BAE2F1'
                        ],
                        fillColor: [
                           '#BAE2F1'
                        ],

                        borderColor: [
                            '#5FB6ED'
                        ],
                        strokeColor: [
                            '#5FB6ED'
                        ],
                        borderWidth: 1
                    },
                    {
                        label: 'Total Issues',
                        data: data.totalIssues,
                        backgroundColor: [
                            '#DBF2F2'
                        ],
                        fillColor: [
                            '#DBF2F2'
                        ],
                        borderColor: [
                            '#4BC0C0'
                        ],
                        strokeColor: [
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

});