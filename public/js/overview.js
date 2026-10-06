

$(document).ready(function () {
    getEmployeeCount();
    getStudentCount();

})


function getEmployeeCount() {
    console.log('get employee count');

    $.ajax({
        url: '/getEmployeeCount',
        method: 'GET',
        success: function (employeeCount) {
            console.log(employeeCount)
            $('#employee-count').text(Number(employeeCount).toLocaleString());
            $('#employee-card').show();
        },
        error: function (xhr) {
            console.error('Failed to get employee count:', xhr);
        }

    })
}


function getStudentCount() {
    $.ajax({
        url: '/get-student-count',
        method: 'GET',
        success: function (studentCount) {
            $('#student-count').text(Number(studentCount).toLocaleString());
            $('#student-card').show();
        },
        error: function (xhr) {
            console.error('Failed to get student count:', xhr);
        }

    })
}

f
