// console.log('STUDENTS JS IS LOADED');

$(document).ready(function () {

    // --------------------------------------------------
    // Update Student Records heading
    // --------------------------------------------------

    $('#schoolFilter, #gradeFilter, #sectionFilter').change(function () {

        const school = $('#schoolFilter').val();
        const grade = $('#gradeFilter').val();
        const section = $('#sectionFilter').val();

        let heading = '';

        if (school) {
            heading += ' <i class="bi bi-chevron-right"></i>  ' + school;
        }

        if (grade) {
            heading += ' <i class="bi bi-chevron-right"></i>  Grade ' + grade;
        }

        if (section) {
            heading += ' <i class="bi bi-chevron-right"></i>  ' + section;
        }

        $('#studentRecordsHeading').html(heading);

    });


    // --------------------------------------------------
    // Reset filters when page opens
    // --------------------------------------------------

    resetFilters();


    // --------------------------------------------------
    // Load filter options
    // --------------------------------------------------

    loadFilters();


    // --------------------------------------------------
    // Show empty student state
    // --------------------------------------------------

    showEmptyStudentState();


    // --------------------------------------------------
    // Search students
    // --------------------------------------------------

    $('#search').on('input', function () {

        loadStudents(1);

    });


    // --------------------------------------------------
    // Clear filters
    // --------------------------------------------------

    $('#clearFilters').click(function () {

        resetFilters();

        // Reset heading
        $('#studentRecordsHeading').text('Student Records');

        showEmptyStudentState();

    });


    // --------------------------------------------------
    // Open file picker
    // --------------------------------------------------

    $('#importButton').click(function () {

        $('#file').click();

    });


    // --------------------------------------------------
    // File selected
    // --------------------------------------------------

    $('#file').change(function () {

        const file = this.files[0];

        if (!file) {
            return;
        }

        // console.log('Selected file:', file.name);

        const formData = new FormData();

        formData.append('file', file);


        // --------------------------------------------------
        // Send file to Laravel
        // /students/import
        // --------------------------------------------------

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

                // console.log('Import successful:', response);

                // Show import result
                showImportResult(response);

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
                        'Please select a valid Excel file (.xlsx or .xls).',
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

        // End AJAX request /students/import

    });


    // --------------------------------------------------
    // School filter
    // --------------------------------------------------

    $('#schoolFilter').change(function () {

        const school = $(this).val();


        // Clear Grade and Section
        $('#gradeFilter').val('');

        $('#sectionFilter').val('');


        // Reset Section dropdown
        $('#sectionFilter').html(
            '<option value="" selected disabled>Select Section</option>'
        );


        // Disable Section
        $('#sectionFilter').prop('disabled', true);


        // If School is not selected
        if (!school) {

            $('#gradeFilter').prop('disabled', true);

            showEmptyStudentState();

            return;

        }


        // Enable Grade Level
        $('#gradeFilter').prop('disabled', false);


        // Reset Grade Level dropdown
        $('#gradeFilter').html(
            '<option value="" selected disabled>Select Grade Level</option>'
        );


        // --------------------------------------------------
        // Load grades for selected school
        // --------------------------------------------------

        $.ajax({

            url: '/student-grades',

            method: 'GET',

            data: {

                school: school

            },

            success: function (grades) {

                grades.forEach(function (grade) {

                    $('#gradeFilter').append(

                        `<option value="${grade}">
                            Grade ${grade}
                        </option>`

                    );

                });

            },

            error: function (xhr) {

                console.error(
                    'Failed to load grades:',
                    xhr.responseText
                );

            }

        });


        showEmptyStudentState();

    });


    // --------------------------------------------------
    // Grade Level filter
    // --------------------------------------------------

    $('#gradeFilter').change(function () {

        const school = $('#schoolFilter').val();

        const grade = $(this).val();


        // Clear current section
        $('#sectionFilter').val('');


        // Reset Section dropdown
        $('#sectionFilter').html(
            '<option value="" selected disabled>Select Section</option>'
        );


        // If School or Grade is missing
        if (!school || !grade) {

            $('#sectionFilter').prop('disabled', true);

            showEmptyStudentState();

            return;

        }


        // Enable Section
        $('#sectionFilter').prop('disabled', false);


        // --------------------------------------------------
        // Load sections for selected School + Grade
        // --------------------------------------------------

        $.ajax({

            url: '/student-section',

            method: 'GET',

            data: {

                school: school,

                grade_level: grade

            },

            success: function (sections) {

                sections.forEach(function (section) {

                    $('#sectionFilter').append(

                        `<option value="${section}">
                            ${section}
                        </option>`

                    );

                });

            },

            error: function (xhr) {

                console.error(
                    'Failed to load sections:',
                    xhr.responseText
                );

            }

        });


        showEmptyStudentState();

    });


    // --------------------------------------------------
    // Section filter
    // --------------------------------------------------

    $('#sectionFilter').change(function () {

        const section = $(this).val();


        if (section) {

            // All 3 required selections are now complete
            loadStudents(1);

        } else {

            showEmptyStudentState();

        }

    });


    // --------------------------------------------------
    // Generate QR
    // --------------------------------------------------

    $('#generateQrButton').click(function () {

        const filters = {

            search: $('#search').val(),

            gender: $('#genderFilter').val(),

            grade_level: $('#gradeFilter').val(),

            school: $('#schoolFilter').val(),

            section: $('#sectionFilter').val(),

            school_year: $('#schoolYearFilter').val()

        };


        // Build query string
        const params = new URLSearchParams();

        Object.keys(filters).forEach(function (key) {

            if (filters[key]) {

                params.append(key, filters[key]);

            }

        });


        // Print URL
        const printUrl =
            '/students/print?' + params.toString();


        // Get iframe
        const printFrame =
            document.getElementById('printFrame');


        // Show loading
        showLoading('Generating QR Codes...');


        // Remove previous load event
        $('#printFrame').off('load');


        // When print page finishes loading
        $('#printFrame').one('load', function () {

            // Give browser a moment to finish rendering
            setTimeout(function () {

                hideLoading();

                printFrame.contentWindow.focus();

                printFrame.contentWindow.print();

            }, 300);

        });


        // Load print page inside hidden iframe
        printFrame.src = printUrl;

    });


    // --------------------------------------------------
    // End of .ready()
    // --------------------------------------------------

});


// ======================================================
// RESET FILTERS
// ======================================================

function resetFilters() {

    $('#search').val('');

    $('#schoolFilter').val('');

    $('#gradeFilter').val('');

    $('#sectionFilter').val('');

    $('#genderFilter').val('');

    $('#schoolYearFilter').val('');


    // Sequential filter state

    // Grade disabled until School is selected
    $('#gradeFilter').prop('disabled', true);

    // Section disabled until Grade is selected
    $('#sectionFilter').prop('disabled', true);

}


// ======================================================
// LOAD STUDENTS
// ======================================================

function loadStudents(page = 1) {

    const school = $('#schoolFilter').val();

    const grade = $('#gradeFilter').val();

    const section = $('#sectionFilter').val();


    // Require School, Grade Level, and Section

    if (!school || !grade || !section) {

        showEmptyStudentState();

        return;

    }


    $.ajax({

        url: '/studentslist',

        method: 'GET',

        data: {

            page: page,

            search: $('#search').val(),

            gender: $('#genderFilter').val(),

            grade_level: grade,

            school: school,

            section: section,

            school_year: $('#schoolYearFilter').val()

        },


        beforeSend: function () {

            showLoading('Loading students...');

        },


        success: function (response) {

            $('#studentTable').empty();


            // --------------------------------------------------
            // Update record count
            // --------------------------------------------------

            $('#recordCount').text(

                response.from +
                '-' +
                response.to +
                ' of ' +
                response.total +
                ' Records'

            );


            // --------------------------------------------------
            // Update Generate QR count
            // --------------------------------------------------

            $('#generateCount').text(

                response.total

            );


            // --------------------------------------------------
            // Add students to table
            // --------------------------------------------------

            if (response.data.length === 0) {

                // Hide table
                $('#studentTableContainer').addClass('d-none');


                // Show empty message
                $('#noStudentsMessage').removeClass('d-none');


                // Hide pagination
                $('#pagination').empty();

            } else {

                // Show table
                $('#studentTableContainer').removeClass('d-none');


                // Hide empty message
                $('#noStudentsMessage').addClass('d-none');


                response.data.forEach(function (student) {

                    const row = `

                        <tr>

                            <td>
                                ${student.lrn ?? ''}
                            </td>

                            <td>
                                ${student.last_name ?? ''},
                                ${student.first_name ?? ''}
                                ${student.middle_initial
                                    ? ' ' + student.middle_initial + '.'
                                    : ''}
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
                                ${student.gender ?? ''}
                            </td>

                        </tr>

                    `;

                    $('#studentTable').append(row);

                });

            }


            // --------------------------------------------------
            // Render pagination
            // --------------------------------------------------

            if (response.total === 0) {

                $('#pagination').empty();

            } else {

                renderPagination(response);

            }

        },


        error: function (xhr) {

            console.error(
                'Failed to load students:',
                xhr.responseText
            );

        },


        complete: function () {

            hideLoading();

        }

    });

}


// ======================================================
// PAGINATION CLICK
// ======================================================

$(document).on('click', '.page-button', function () {

    const page = $(this).data('page');

    // console.log('Loading page:', page);

    loadStudents(page);

});


// ======================================================
// RENDER PAGINATION
// ======================================================

function renderPagination(response) {

    $('#pagination').empty();


    // Previous button

    if (response.current_page > 1) {

        $('#pagination').append(

            `<button
                class="btn btn-sm btn-outline-secondary page-button"
                data-page="${response.current_page - 1}">
                Previous
            </button>`

        );

    }


    // Page numbers

    for (
        let page = 1;
        page <= response.last_page;
        page++
    ) {

        $('#pagination').append(

            `<button
                class="btn btn-sm ${
                    page === response.current_page
                        ? 'btn-primary'
                        : 'btn-outline-secondary'
                }
                px-3 p-2 page-button"
                data-page="${page}">
                ${page}
            </button>`

        );

    }


    // Next button

    if (
        response.current_page <
        response.last_page
    ) {

        $('#pagination').append(

            `<button
                class="btn btn-sm btn-outline-secondary page-button"
                data-page="${response.current_page + 1}">
                Next
            </button>`

        );

    }

}


// ======================================================
// LOAD FILTERS
// ======================================================

function loadFilters() {

    $.ajax({

        url: '/student-filters',

        method: 'GET',

        success: function (filters) {

            // --------------------------------------------------
            // Reset dropdowns
            // --------------------------------------------------

            $('#schoolFilter').html(

                '<option value="" selected disabled>' +
                'Select School' +
                '</option>'

                 

            );


            $('#gradeFilter').html(

                '<option value="" selected disabled>' +
                'Select Grade Level' +
                '</option>'

            );


            $('#sectionFilter').html(

                '<option value="" selected disabled>' +
                'Select Section' +
                '</option>'

            );


            // --------------------------------------------------
            // Disable dependent dropdowns
            // --------------------------------------------------

            $('#gradeFilter').prop('disabled', true);

            $('#sectionFilter').prop('disabled', true);


            // --------------------------------------------------
            // Load schools only
            // --------------------------------------------------

            filters.schools.forEach(function (school) {

                $('#schoolFilter').append(

                    `<option value="${school}">
                        ${school}
                    </option>`

                );

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


// ======================================================
// SHOW IMPORT RESULT
// ======================================================

function showImportResult(response) {

    // Update summary

    $('#modalImported').text(
        response.imported
    );

    $('#modalSkipped').text(
        response.skipped
    );

    $('#importResultMessage').text(
        response.message
    );


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


// ======================================================
// SHOW NOTIFICATION
// ======================================================

function showNotification(message, type) {

    const notification = $('#notification');


    notification
        .removeClass(
            'd-none alert-success alert-danger alert-warning'
        )
        .addClass('alert-' + type)
        .text(message);


    // Hide notification after 4 seconds

    setTimeout(function () {

        notification.addClass('d-none');

    }, 4000);

}


// ======================================================
// LOADING
// ======================================================

function showLoading(message = 'Loading...') {

    $('.loading-text').text(message);

    $('#loadingOverlay').css(
        'display',
        'flex'
    );

}


function hideLoading() {

    $('#loadingOverlay').hide();

}


// ======================================================
// EMPTY STUDENT STATE
// ======================================================

function showEmptyStudentState() {

    // Hide student table

    $('#studentTableContainer')
        .addClass('d-none');


    // Show empty message

    $('#noStudentsMessage').removeClass('d-none').text('Select a school, grade level, and section to view student records and generate QR codes.');

    // Clear pagination

    $('#pagination').empty();


    // Reset counts

    $('#recordCount').text('');

    $('#generateCount').text('0');

}