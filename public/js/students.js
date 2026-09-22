$(document).ready(function () {
    // Load students when page opens
    loadStudents();

    // Open file picker
    $('#importButton').click(function () {
        $('#file').click();
    });

    // File selected
    $('#file').change(function () {
        const file = this.files[0];
        if (!file) {
            return;
        }
        console.log('Selected file:', file.name);
        const formData = new FormData();

        formData.append('file', file);
        // Send file to Laravel
        $.ajax({
            url: '/students/import',
            method: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            headers: {
                'X-CSRF-TOKEN':
                    $('meta[name="csrf-token"]').attr('content')
            },
            success: function (response) {
                console.log('Import successful:',response);
                // Show result
                showImportResult(response);
                // Reload students
                loadStudents();
                // Reset input
                $('#file').val('');
            },
            error: function (xhr) {
                console.error('Import error:',xhr);
                console.error('Response:',xhr.responseText);
                if (xhr.status === 422) {
                    showNotification('Please select a valid Excel or CSV file.','warning');
                } else if (xhr.status === 419) {
                     showNotification('Your session has expired. Please refresh the page and try again.','warning');
                } else {
                     showNotification('Unable to import the file. Please check the file and try again.','danger');
                }
            }
        });
    });
});


/**
 * Load students from Laravel
 */
function loadStudents() {
    $.ajax({
        url: '/studentslist',
        method: 'GET',
        success: function (students) {
            console.log('Students from database:',students);
            $('#studentTable').empty();
            $('#recordCount').text(students.length + ' Records Match');
            $('#generateCount').text(students.length);

            students.forEach(function (student) {
                // list
                $('#studentTable').append(`
                    <tr>
                        <td>${student.lrn ?? ''}</td>
                        <td class="fw-semibold">${student.last_name ?? ''},${student.first_name ?? ''} ${student.middle_initial ? ' ' + student.middle_initial + '.' : '' }</td>
                        <td>Rizal High School</td>
                        <td>${student.grade_level ?? ''}-${student.section ?? ''}</td>
                        <td><span class="badge text-success bg-success-subtle px-4">${student.status ?? 'Active'}</span></td>
                        <td><a href="/students/${student.lrn}" class="text-primary text-decoration-none">Edit</a></td>
                    </tr>
                `);
            });
        },
        error: function (xhr) {
            console.error( 'Failed to load students:', xhr.responseText);
        }
    });
}


/**
 * Show import result modal
 */
function showImportResult(response) {

    // Update summary
    $('#modalImported').text(response.imported);
    $('#modalSkipped').text(response.skipped);
    $('#importResultMessage').text(response.message);

    // Clear previous skipped rows
    $('#skippedRowsTable').empty();

    // Check if there are skipped rows
    if (response.skipped_rows && response.skipped_rows.length > 0) {

        $('#skippedRowsContainer').removeClass('d-none');

        $('#skippedRowsCount').text(response.skipped_rows.length);

        response.skipped_rows.forEach(function(row) {

            $('#skippedRowsTable').append(`
                <tr>
                    <td class="fw-semibold">
                        ${row.excel_row}
                    </td>

                    <td>
                        <span class="text-danger">
                            ${row.reason}
                        </span>
                    </td>
                </tr>
            `);

        });

    } else {

        $('#skippedRowsContainer').addClass('d-none');

    }

    // Show Bootstrap modal
    const modalElement = document.getElementById('importResultModal');

    const modal = new bootstrap.Modal(modalElement);

    modal.show();
}


function showNotification(message, type) {
    const notification = $('#notification');

    notification
        .removeClass('d-none alert-success alert-danger alert-warning')
        .addClass('alert-' + type)
        .text(message);

    setTimeout(function () {
        notification.addClass('d-none');
    }, 4000);
}
