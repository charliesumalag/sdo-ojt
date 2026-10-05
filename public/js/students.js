$(document).ready(function () {
    loadFilters();
    resetFilters();
    showEmptyStudentState();

    $('#schoolFilter, #gradeFilter, #sectionFilter, #statusFilter').change(function () {
        updateStudentRecordsHeading();
    });

    $('#clearFilters').click(function () {
        resetFilters();
        $('#studentRecordsHeading').text('');
        showEmptyStudentState();
        showNotificationFilterRequires('Please Select Station','warning','school');
    });

    $('#importButton').click(function () {
        $('#file').click();
    });

    $('#file').change(function () {
        const file = this.files[0];

        if (!file) {
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        $.ajax({
            url: '/students/import',
            method: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            beforeSend: function () {
                showLoading('Uploading Student Records');
            },
            success: function (response) {
                showImportResult(response);
                resetFilters();
                loadFilters();
                showEmptyStudentState();
                $('#file').val('');
            },
            error: function (xhr) {
                if (xhr.status === 422) {
                    const message = xhr.responseJSON?.message || 'The Excel file format is incorrect.';
                    showNotification(message,'warning');
                }
                else if (xhr.status === 419) {
                    showNotification('Your session has expired. Please refresh the page and try again.','warning');
                }
                else {
                    showNotification('Unable to import the file. Please check the file and try again.','danger');
                }
            },
            complete: function () {
                hideLoading();
            }
        });
    });

    $('#schoolFilter').change(function () {
        const school = $(this).val();
        showNotificationFilterRequires('Please Select Grade Level','warning','school');
        resetGradeFilter();
        resetSectionFilter();
        resetStatusFilter();
        updateStudentRecordsHeading();

        if (!school) {
            showEmptyStudentState();
            return;
        }

        $('#gradeFilter').prop('disabled',false);

        $.ajax({
            url: '/student-grades',
            method: 'GET',
            data: {
                school: school
            },
            success: function (grades) {
                grades.forEach(function (grade) {
                    $('#gradeFilter').append(`<option value="${grade}">Grade ${grade}</option>`);
                });
            },
            error: function (xhr) {
                console.error('Failed to load grades:',xhr.responseText);
            }
        });
        showEmptyStudentState();
    });

    $('#gradeFilter').change(function () {
        const school = $('#schoolFilter').val();
        const grade = $(this).val();
        showNotificationFilterRequires('Please Select Section','warning','grade');
        resetSectionFilter();
        resetStatusFilter();
        updateStudentRecordsHeading();

        if (!school || !grade) {
            showEmptyStudentState();
            return;
        }

        $('#sectionFilter').prop('disabled',false);

        $.ajax({
            url: '/student-section',
            method: 'GET',
            data: {
                school: school,
                grade_level: grade
            },
            success: function (sections) {
                sections.forEach(function (section) {
                    $('#sectionFilter').append(`<option value="${section}">${section}</option>`);
                });
            },
            error: function (xhr) {
                console.error('Failed to load sections:',xhr.responseText);
            }
        });
        showEmptyStudentState();
    });

    $('#sectionFilter').change(function () {
        const section = $(this).val();
        const school = $('#schoolFilter').val();
        const grade = $('#gradeFilter').val();
        showNotificationFilterRequires('','','section');
        resetStatusFilter();
        updateStudentRecordsHeading();

        if (!section) {
            showEmptyStudentState();
            return;
        }

        $.ajax({
            url: '/status',
            method: 'GET',
            data: {
                school: school,
                section: section,
                grade_level: grade
            },
            success: function (statuses) {
                $('#statusFilter').empty();

                if (!statuses || statuses.length === 0) {
                    $('#statusFilter').append('<option value="" selected disabled>' + 'No Status' +'</option>').prop('disabled',true);
                    showEmptyStudentState();
                    return;
                }

                statuses.forEach(function (status) {
                    $('#statusFilter').append(`<option value="${status}">${status}</option>`);
                });

                if (statuses.includes('Not Printed')) {
                    $('#statusFilter').val('Not Printed');
                }
                else {
                    $('#statusFilter').val(statuses[0]);
                }
                $('#statusFilter').prop('disabled',false);
                updateStudentRecordsHeading();
                loadStudents(1);
            },
            error: function (xhr) {
                console.error('Failed to load statuses:',xhr.responseText);
                resetStatusFilter();
            }
        });
    });

    $('#statusFilter').change(function () {
        updateStudentRecordsHeading();
        loadStudents(1);
    });

    $('#generateQrButton').click(function () {

    const filters = getStudentFilters();

    const selectedStudents = [];

    $('.student-checkbox:checked').each(function () {
        selectedStudents.push($(this).val());
    });

    // Do not continue if nothing was selected.
    if (selectedStudents.length === 0) {
        showNotification(
            'Please select at least one student.',
            'warning'
        );
        return;
    }

    // Create URL query parameters.
    const params = new URLSearchParams();

    // Add active filters.
    Object.keys(filters).forEach(function (key) {

        if (filters[key]) {
            params.append(key, filters[key]);
        }

    });

    // Add selected student LRNs.
    selectedStudents.forEach(function (lrn) {

        params.append('lrns[]', lrn);

    });

    // Build the print page URL.
    const printUrl =
        '/students/print?' +
        params.toString();

    // Go directly to the Laravel print page.
    window.location.href = printUrl;

});



    // ========================================================
    // CHECK ALL STUDENTS
    // ========================================================

    $('#checkAll').on(
        'change',
        function () {

            // Match all student checkboxes
            // to the Select All checkbox.
            $('.student-checkbox').prop(
                'checked',
                this.checked
            );


            // Update selected student count.
            updateGenerateCount();

        }
    );


    // ========================================================
    // INDIVIDUAL STUDENT CHECKBOX
    // ========================================================

    $(document).on(
        'change',
        '.student-checkbox',
        function () {

            // Update selected count.
            updateGenerateCount();

            // Update Select All state.
            updateCheckAllState();

        }
    );


    // ========================================================
    // PRINT CONFIRMATION
    // ========================================================

    $('#confirmPrintButton').click(function () {

        const printFrame =
            document.getElementById(
                'printFrame'
            );


        // Retrieve student codes stored during QR generation.
        const studentCodes =
            JSON.parse(
                printFrame.dataset.studentCodes ||
                '[]'
            );


        // Stop if no codes were found.
        if (
            !studentCodes ||
            studentCodes.length === 0
        ) {

            console.error(
                'No student codes found.'
            );

            return;
        }


        // Tell Laravel that the QR codes were printed.
        $.ajax({

            url: '/students/print-confirmed',

            type: 'POST',

            data: {

                _token:
                    $('meta[name="csrf-token"]')
                        .attr('content'),

                codes: studentCodes

            },


            beforeSend: function () {

                showLoading(
                    'Loading students'
                );

            },


            success: function (response) {

                console.log(
                    response.message
                );

                console.log(
                    'Updated:',
                    response.updated
                );


                // Close confirmation modal.
                const modalElement =
                    document.getElementById(
                        'printConfirmationModal'
                    );

                const printModal =
                    bootstrap.Modal.getInstance(
                        modalElement
                    );

                if (printModal) {

                    printModal.hide();

                }


                // Notify user.
                showNotification(
                    'Printed successfully',
                    'success'
                );


                // Add Printed option if necessary.
                if (
                    $('#statusFilter option[value="Printed"]')
                        .length === 0
                ) {

                    $('#statusFilter').append(
                        '<option value="Printed">' +
                        'Printed' +
                        '</option>'
                    );

                }


                // Select Printed.
                $('#statusFilter').val(
                    'Printed'
                );


                // Update heading.
                updateStudentRecordsHeading();


                // Reload student records.
                loadStudents(1);

            },


            error: function (xhr) {

                console.error(
                    'Failed to update print status.'
                );

                console.error(
                    xhr.responseText
                );

            },


            complete: function () {

                hideLoading();

            }

        });

    });

});


// ============================================================
// STUDENT FILTERS
// ============================================================

/**
 * Get the current values of all student filters.
 */
function getStudentFilters() {

    return {

        search:
            $('#search').val(),

        gender:
            $('#genderFilter').val(),

        grade_level:
            $('#gradeFilter').val(),

        school:
            $('#schoolFilter').val(),

        section:
            $('#sectionFilter').val(),

        school_year:
            $('#schoolYearFilter').val(),

        status:
            $('#statusFilter').val()

    };

}


// ============================================================
// STUDENT DATA
// ============================================================

/**
 * Load student records using the selected filters.
 */
function loadStudents(page = 1) {

    // Get all currently selected filters.
    const filters =
        getStudentFilters();


    // Require the main filters before loading students.
    if (
        !filters.school ||
        !filters.grade_level ||
        !filters.section ||
        !filters.status
    ) {

        showEmptyStudentState();

        return;
    }


    // Reset checkbox selection.
    $('#checkAll').prop(
        'checked',
        false
    );

    $('#generateCount').text('');


    $.ajax({

        url: '/studentslist',

        method: 'GET',

        data: {

            page: page,

            ...filters

        },


        beforeSend: function () {

            showLoading(
                'Loading students records...'
            );

        },


        success: function (response) {

            // Render returned student records.
            renderStudentTable(response);


            // Render pagination.
            renderStudentPagination(response);

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


// ============================================================
// STUDENT TABLE
// ============================================================

/**
 * Render students into the table.
 */
function renderStudentTable(response) {

    const students =
        response.students.data;


    // Clear existing rows.
    $('#studentTable').empty();


    // Handle no matching records.
    if (students.length === 0) {

        showImportStudentsPrompt();

        return;
    }


    // Show student table.
    $('#studentTableContainer')
        .removeClass('d-none');


    // Hide empty message.
    $('#noStudentsMessage')
        .addClass('d-none');


    // Create each student row.
    students.forEach(function (student) {

        const studentRow =
            createStudentRow(student);

        $('#studentTable').append(
            studentRow
        );

    });

}


// ============================================================
// STUDENT ROW
// ============================================================

/**
 * Create one student table row.
 */
function createStudentRow(student) {

    // Build student's full name.
    const fullName =
        `${student.last_name ?? ''}, ` +
        `${student.first_name ?? ''}` +
        `${
            student.middle_initial
                ? ' ' + student.middle_initial + '.'
                : ''
        }`;


    // Choose badge based on print status.
    const statusBadge =
        student.status === 'Printed'
            ? 'bg-success'
            : 'bg-secondary';


    return `
        <tr>

            <td>
                <input
                    type="checkbox"
                    class="student-checkbox"
                    name="students[]"
                    value="${student.lrn}"
                >
            </td>

            <td>
                ${student.lrn ?? ''}
            </td>

            <td>
                ${fullName}
            </td>

            <td>
                ${student.grade_level ?? ''}
                -
                ${student.section ?? ''}
            </td>

            <td>
                ${student.gender ?? ''}
            </td>

            <td>
                <span class="badge rounded-pill ${statusBadge}">
                    ${student.status ?? ''}
                </span>
            </td>

        </tr>
    `;

}


// ============================================================
// PAGINATION
// ============================================================

/**
 * Handle pagination button clicks.
 */
$(document).on(
    'click',
    '.page-button',
    function () {

        const page =
            $(this).data('page');

        loadStudents(page);

    }
);


/**
 * Render student pagination buttons.
 */
function renderStudentPagination(response) {

    // Clear existing pagination.
    $('#pagination').empty();


    // Stop when there are no records.
    if (response.total === 0) {
        return;
    }


    // Add Previous button.
    if (response.current_page > 1) {

        $('#pagination').append(`
            <button
                class="btn btn-sm btn-outline-secondary page-button"
                data-page="${response.current_page - 1}">
                Previous
            </button>
        `);

    }


    // Add page buttons.
    for (
        let page = 1;
        page <= response.last_page;
        page++
    ) {

        $('#pagination').append(`
            <button
                class="btn btn-sm ${
                    page === response.current_page
                        ? 'btn-primary'
                        : 'btn-outline-secondary'
                } px-2 page-button"
                data-page="${page}">
                ${page}
            </button>
        `);

    }


    // Add Next button.
    if (
        response.current_page <
        response.last_page
    ) {

        $('#pagination').append(`
            <button
                class="btn btn-sm btn-outline-secondary page-button"
                data-page="${response.current_page + 1}">
                Next
            </button>
        `);

    }

}


// ============================================================
// CHECKBOX HELPERS
// ============================================================

/**
 * Update the number of selected students.
 */
function updateGenerateCount() {

    const checked =
        $('.student-checkbox:checked').length;


    $('#generateCount').text(
        checked > 0
            ? ` (${checked})`
            : ''
    );

}


/**
 * Update the Select All checkbox.
 */
function updateCheckAllState() {

    const total =
        $('.student-checkbox').length;

    const totalChecked =
        $('.student-checkbox:checked').length;


    $('#checkAll').prop(
        'checked',
        total > 0 &&
        total === totalChecked
    );

}


// ============================================================
// FILTER LOADING
// ============================================================

/**
 * Load available student filter values.
 */
function loadFilters() {

    $.ajax({

        url: '/student-filters',

        method: 'GET',


        success: function (filters) {

            console.log(
                JSON.stringify(filters)
            );


            // Reset dropdowns.
            resetFilterDropdowns();


            // Disable dependent filters.
            $('#gradeFilter').prop(
                'disabled',
                true
            );

            $('#sectionFilter').prop(
                'disabled',
                true
            );

            $('#statusFilter').prop(
                'disabled',
                true
            );


            // Get schools returned by backend.
            const schools =
                filters.schools || [];


            // Handle empty database.
            if (schools.length === 0) {

                $('#clearFilters')
                    .prop('disabled', true)
                    .addClass('disabled');


                $('#schoolFilter')
                    .prop('disabled', true);


                showImportStudentsPrompt();

                return;
            }


            // Enable Clear Filters.
            $('#clearFilters')
                .prop('disabled', false)
                .removeClass('disabled');


            // Show initial filter instruction.
            showNotificationFilterRequires(
                'Please Select Station',
                'warning'
            );


            // Populate schools.
            schools.forEach(function (school) {

                $('#schoolFilter')
                    .prop('disabled', false)
                    .append(
                        `<option value="${school}">
                            ${school}
                        </option>`
                    );

            });


            // Hide student table until filters are selected.
            showEmptyStudentState();

        },


        error: function (xhr) {

            console.error(
                'Failed to load filters:',
                xhr.responseText
            );

        }

    });

}


// ============================================================
// FILTER RESET HELPERS
// ============================================================

/**
 * Reset all student filters.
 */
function resetFilters() {

    $('#schoolFilter').val('');

    resetGradeFilter();

    resetSectionFilter();

    resetStatusFilter();

}


/**
 * Reset Grade Level.
 */
function resetGradeFilter() {

    $('#gradeFilter')
        .html(
            '<option value="" selected disabled>' +
            'Grade Level' +
            '</option>'
        )
        .val('')
        .prop(
            'disabled',
            true
        );

}


/**
 * Reset Section.
 */
function resetSectionFilter() {

    $('#sectionFilter')
        .html(
            '<option value="" selected disabled>' +
            'Section' +
            '</option>'
        )
        .val('')
        .prop(
            'disabled',
            true
        );

}


/**
 * Reset Status.
 */
function resetStatusFilter() {

    $('#statusFilter')
        .html(
            '<option value="" selected disabled>' +
            'Status' +
            '</option>'
        )
        .val('')
        .prop(
            'disabled',
            true
        );

}


/**
 * Reset all dropdown contents.
 */
function resetFilterDropdowns() {

    $('#schoolFilter').html(
        '<option value="" selected disabled>' +
        'Station' +
        '</option>'
    );

    resetGradeFilter();

    resetSectionFilter();

    resetStatusFilter();

}


// ============================================================
// IMPORT RESULT
// ============================================================

/**
 * Display student import results.
 */
function showImportResult(response) {

    // Determine the appropriate result message.
    if (response.imported > 0) {

        $('#importResultModalLabel')
            .text(
                'Records Added Successfully'
            );

        $('#importResultMessage')
            .text(
                'Student records were saved successfully.'
            );

    }

    else if (response.skipped > 0) {

        $('#importResultModalLabel')
            .text(
                'No New Records Added'
            );

        $('#importResultMessage')
            .text(
                'All student records are already added.'
            );

    }

    else {

        $('#importResultModalLabel')
            .text(
                'No Student Records Found'
            );

        $('#importResultMessage')
            .text(
                'No student records were found.'
            );

    }


    // Display imported count.
    $('#modalImported')
        .text(response.imported);


    // Display skipped count.
    $('#modalSkipped')
        .text(response.skipped);


    // Clear old skipped rows.
    $('#skippedRowsTable').empty();


    // Display skipped rows when available.
    if (
        response.skipped_rows &&
        response.skipped_rows.length > 0
    ) {

        $('#skippedRowsContainer')
            .removeClass('d-none');

        $('#skippedRowsCount')
            .text(
                response.skipped_rows.length
            );


        response.skipped_rows.forEach(
            function (row) {

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

            }
        );

    }

    else {

        // Hide skipped rows section.
        $('#skippedRowsContainer')
            .addClass('d-none');

    }


    // Show import result modal.
    const modalElement =
        document.getElementById(
            'importResultModal'
        );

    const modal =
        new bootstrap.Modal(
            modalElement
        );

    modal.show();

}


// ============================================================
// NOTIFICATIONS
// ============================================================

/**
 * Show a normal notification.
 */
function showNotification(message, type) {

    const notification =
        $('#notification');


    notification
        .removeClass(
            'd-none alert-success alert-danger alert-warning'
        )
        .addClass(
            'alert-' + type
        )
        .html(
            `<i class="bi bi-exclamation-lg text-danger fs-4"></i>${message}`
        );


    // Automatically hide notification.
    setTimeout(function () {

        notification.addClass(
            'd-none'
        );

    }, 10000);

}


/**
 * Show a filter instruction or database-state notification.
 */
function showNotificationFilterRequires(
    message = '',
    type = '',
    filter = ''
) {

    const notification =
        $('#notification');


    // Normal filter instruction.
    if (
        filter === '' ||
        filter === 'school' ||
        filter === 'grade'
    ) {

        notification
            .removeClass(
                'd-none alert-success alert-danger alert-warning'
            )
            .addClass(
                'alert-' + type
            )
            .html(
                `<i class="bi bi-caret-right fs-5 text-danger"></i> ${message}`
            );

    }


    // Section has completed the required filter chain.
    else if (
        filter === 'section'
    ) {

        notification
            .addClass('d-none')
            .removeClass(
                'alert-success alert-danger alert-warning'
            );

    }


    // No student records exist.
    else if (
        filter === 'noStudents'
    ) {

        notification
            .removeClass(
                'd-none alert-success alert-danger alert-warning'
            )
            .addClass(
                'alert-' + type
            )
            .html(
                `<i class="bi bi-exclamation-lg fs-4 text-danger"></i>${message}`
            );

    }

}


// ============================================================
// LOADING
// ============================================================

/**
 * Show loading overlay.
 */
function showLoading(
    message = 'Loading...'
) {

    $('.loading-text').text(
        message
    );

    $('#loadingOverlay').css(
        'display',
        'flex'
    );

}


/**
 * Hide loading overlay.
 */
function hideLoading() {

    $('#loadingOverlay').hide();

}


// ============================================================
// EMPTY STATE
// ============================================================

/**
 * Hide student table while filters are incomplete.
 */
function showEmptyStudentState() {

    // Hide table.
    $('#studentTableContainer')
        .addClass('d-none');


    // Show empty message.
    $('#noStudentsMessage')
        .removeClass('d-none')
        .text('No records found');


    // Clear pagination.
    $('#pagination').empty();


    // Reset counts.
    $('#recordCount').text('');

    $('#generateCount').text('');

}


// ============================================================
// STUDENT HEADING
// ============================================================

/**
 * Update the student records heading
 * based on selected filters.
 */
function updateStudentRecordsHeading() {

    const school =
        $('#schoolFilter').val();

    const grade =
        $('#gradeFilter').val();

    const section =
        $('#sectionFilter').val();

    const status =
        $('#statusFilter').val();


    let heading = '';


    // Add School.
    if (school) {

        heading +=
            '<i class="bi bi-chevron-right"></i> ' +
            school;

    }


    // Add Grade.
    if (grade) {

        heading +=
            '<i class="bi bi-chevron-right"></i> Grade ' +
            grade;

    }


    // Add Section.
    if (section) {

        heading +=
            '<i class="bi bi-chevron-right"></i> ' +
            section;

    }


    // Add Status.
    if (status) {

        heading +=
            '<i class="bi bi-chevron-right"></i> ' +
            status;

    }


    // Update heading in the page.
    $('#studentRecordsHeading')
        .html(heading);

}


// ============================================================
// NO STUDENT DATA PROMPT
// ============================================================

/**
 * Show message when no student records exist.
 */
function showImportStudentsPrompt() {

    // Hide student table.
    $('#studentTableContainer')
        .addClass('d-none');


    // Clear pagination.
    $('#pagination').empty();


    // Clear record count.
    $('#recordCount').text('');


    // Clear Generate QR count.
    $('#generateCount').text('');


    // Show import message.
    showNotificationFilterRequires(

        'No student records are available. Please import or upload student records.',

        'warning',

        'noStudents'

    );


    // Hide the normal "no records found" message.
    $('#noStudentsMessage')
        .addClass('d-none')
        .empty();

}
