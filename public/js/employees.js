$(document).ready(function() {
    console.log('employee js running')

    loadFilters();



})

function loadFilters() {

    $.ajax({
        url: '/employees-filters',
        method: 'GET',
        success: function(employees){
            //dropdown Select disable option
            $('#stationFilter').html('<option value="" selected disabled>Station</option>');
            $('#positionFilter').html('<option value="" selected disabled>Position</option>');
            $('#statusFilter').html('<option value="" selected disabled>Status</option>');


            //disabled other dropdown when station is not selected.
            $('#positionFilter').prop('disabled', true);
            $('#statusFilter').prop('disabled', true);

            //get now the available school on database
            console.log(employees.station);
            employees.station.forEach(function (station){
                $('#stationFilter').append(`<option value="${station}">${station}</option>`)
            })
        },
    })

}
