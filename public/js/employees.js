$(document).ready(function() {
    console.log('employee js running')

    loadFilters();
    resetFilters();



    $('#stationFilter').change(function () {
        const station = $(this).val();
console.log(station)
        //heaer names of  all next dropdowns
        //$('#positionFilter').html(``)

        //this is for table display conditional continue later
        if(!station){
            return;
        }

        //endable next dropdown which is the position
        $('#positionFilter').prop('disabled', false);

        //request dropdown data for position
        $.ajax({
            url: '/employees-positions',
            method: 'GET',
            data: {
                station: station,
            },
            success: function (positions){
                console.log(positions);
                positions.forEach(function (position) {
                    $('#positionFilter').append(`<option value="${position}">${position}</option>`)

                })
           },
            error: function (xhr) {
                console.error('Failed to load grades:',xhr.responseText);
            }


        })

    })

})
//end of document . ready

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
function resetFilters(){
    $('#stationFilter').val('');
    $('#positionFilter').val('').prop('disabled', true);
    $('#statusFilter').val('').prop('disabled', true);
}
