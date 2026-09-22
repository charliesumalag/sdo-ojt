console.log('STUDENTS JS IS LOADED');

$(document).ready(function () {

    // Reset filters when page opens
    resetFilters();

    // Load filter options
    loadFilters();

    // Load all students
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

                console.log('Import successful:', response);

                // Show import result
                showImportResult(response);

                // Reload students
                loadStudents();

                // Reload filters
                loadFilters();

                // Reset input
                $('#file').val('');

            },

            error: function (xhr) {

                console.error('Import error:', xhr);
                console.error('Response:', xhr.responseText);

                if (xhr.status === 422) {

                    showNotification(
                        'Please select a valid Excel or CSV file.',
                        'warning'
                    );

                } else if (xhr.status === 419) {

                    showNotification(
                        'Your session has expired. Please refresh the page and try again.',
                        'warning'
                    );

                } else {

                    showNotification(
                        'Unable to import the file. Please check the file and try again.',
                        'danger'
                    );

                }

            }

        });

    });


    // Reload students when a filter changes
    $(
        '#genderFilter, ' +
        '#gradeFilter, ' +
        '#schoolFilter, ' +
        '#sectionFilter, ' +
        '#schoolYearFilter'
    ).change(function () {

        loadStudents();

    });

});



/*
|--------------------------------------------------------------------------
| Reset Filters
|--------------------------------------------------------------------------
*/

function resetFilters() {

    $('#schoolFilter').val('');
    $('#gradeFilter').val('');
    $('#sectionFilter').val('');
    $('#genderFilter').val('');
    $('#schoolYearFilter').val('');

}



/*
|--------------------------------------------------------------------------
| Load Students
|--------------------------------------------------------------------------
*/

function loadStudents() {

    console.log('loadStudents() is running');

    console.log('Search:', $('#search').val());
    console.log('Gender:', $('#genderFilter').val());
    console.log('Grade:', $('#gradeFilter').val());
    console.log('School:', $('#schoolFilter').val());
    console.log('Section:', $('#sectionFilter').val());
    console.log('School Year:', $('#schoolYearFilter').val());


    $.ajax({

        url: '/studentslist',

        method: 'GET',

        data: {

            search: $('#search').val(),

            gender: $('#genderFilter').val(),

            grade_level: $('#gradeFilter').val(),

            school: $('#schoolFilter').val(),

            section: $('#sectionFilter').val(),

            school_year: $('#schoolYearFilter').val()

        },

        success: function (students) {

            console.log('Students from database:', students);

            console.log('Number of students:', students.length);


            // Clear current table
            $('#studentTable').empty();


            // Update record count
            $('#recordCount').text(
                students.length + ' Records Match'
            );


            // Update Generate QR count
            $('#generateCount').text(
                students.length
            );


            // Add students to table
            students.forEach(function (student) {

                console.log(
                    'Rendering:',
                    student.first_name,
                    student.last_name
                );


                const row = `

                    <tr>

                        <td>
                            ${student.lrn ?? ''}
                        </td>

                        <td class="fw-semibold">

                            ${student.last_name ?? ''},

                            ${student.first_name ?? ''}

                            ${
                                student.middle_initial
                                    ? ' ' + student.middle_initial + '.'
                                    : ''
                            }

                        </td>

                        <td>
                            ${student.school ?? ''}
                        </td>

                        <td>
                            ${student.grade_level ?? ''}
                            -
                            ${student.section ?? ''}
                        </td>

                        <td>

                            <span class="badge text-success bg-success-subtle px-4">

                                ${student.status ?? 'Active'}

                            </span>

                        </td>

                        <td>

                            <a
                                href="/students/${student.lrn}"
                                class="text-primary text-decoration-none"
                            >
                                Edit
                            </a>

                        </td>

                    </tr>

                `;


                $('#studentTable').append(row);

            });


            console.log(
                'Final table:',
                $('#studentTable').html()
            );

        },

        error: function (xhr) {

            console.error(
                'Failed to load students:',
                xhr.responseText
            );

        }

    });

}



/*
|--------------------------------------------------------------------------
| Load Filter Options
|--------------------------------------------------------------------------
*/

function loadFilters() {

    $.ajax({

        url: '/student-filters',

        method: 'GET',

        success: function (filters) {

            console.log('Filters:', filters);


            // Reset dynamic dropdowns
            $('#schoolFilter').html(
                '<option value="">All Schools</option>'
            );

            $('#sectionFilter').html(
                '<option value="">Select Section</option>'
            );

            $('#schoolYearFilter').html(
                '<option value="">All</option>'
            );


            // Schools
            filters.schools.forEach(function (school) {

                $('#schoolFilter').append(`

                    <option value="${school}">
                        ${school}
                    </option>

                `);

            });


            // Sections
            filters.sections.forEach(function (section) {

                $('#sectionFilter').append(`

                    <option value="${section}">
                        ${section}
                    </option>

                `);

            });


            // School Years
            filters.school_years.forEach(function (schoolYear) {

                $('#schoolYearFilter').append(`

                    <option value="${schoolYear}">
                        ${schoolYear}
                    </option>

                `);

            });

        },

        error: function (xhr) {

            console.error(
                'Failed to load filters:',
                xhr.responseText
            );

        }

    });

}



/*
|--------------------------------------------------------------------------
| Show Import Result
|--------------------------------------------------------------------------
*/

function showImportResult(response) {

    // Update summary
    $('#modalImported').text(response.imported);

    $('#modalSkipped').text(response.skipped);

    $('#importResultMessage').text(response.message);


    // Clear previous skipped rows
    $('#skippedRowsTable').empty();


    // Check skipped rows
    if (
        response.skipped_rows &&
        response.skipped_rows.length > 0
    ) {

        $('#skippedRowsContainer').removeClass('d-none');

        $('#skippedRowsCount').text(
            response.skipped_rows.length
        );


        response.skipped_rows.forEach(function (row) {

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
    const modalElement =
        document.getElementById('importResultModal');

    const modal =
        new bootstrap.Modal(modalElement);

    modal.show();

}



/*
|--------------------------------------------------------------------------
| Show Notification
|--------------------------------------------------------------------------
*/

function showNotification(message, type) {

    const notification = $('#notification');

    notification
        .removeClass(
            'd-none alert-success alert-danger alert-warning'
        )
        .addClass('alert-' + type)
        .text(message);


    setTimeout(function () {

        notification.addClass('d-none');

    }, 4000);

}