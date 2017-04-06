$(function() {

     $("#menu-toggle").click(function(e) {
        e.preventDefault();
        $("#wrapper").toggleClass("toggled");
        $(this).text(function(i, text){
          return text === "exit full screen" ? "full screen" : "exit full screen";
        })
    });

    var ctx = document.getElementById('issuesChart');

    $.get( '/data', function( data ) {
        $( ".result" ).html( data );
            var myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
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
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        boxWidth: 15
                    }
                },

                scales: {
                    yAxes: [{
                        ticks: {
                            //beginAtZero: true,
                            stepSize: 5
                        },
                        stacked: false
                    }]
                }
            }
        });
    });

});
