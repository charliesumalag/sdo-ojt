const selectedStudentIds = new Set();

$(document).ready(function () {
    loadFilters();
    resetFilters();
    showEmptyStudentState();


    $('#schoolFilter, #gradeFilter, #sectionFilter, #statusFilter').change(function () {
        updateStudentRecordsHeading();
    });

    $('#clearFilters').click(function () {
        resetFilters();
        selectedStudentIds.clear();
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
                selectedStudentIds.clear();
                resetFilters();
                loadFilters();
                showEmptyStudentState();

                $('#file').val('');
                showNotificationFilterRequires('Please Select Station','warning');
            },
            error: function (xhr) {
                if (xhr.status === 422) {
                    const message = xhr.responseJSON?.message ||'The Excel file format is incorrect.';
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
        selectedStudentIds.clear();
        showNotificationFilterRequires('Please Select Grade Level','warning','school');
        resetGradeFilter();
        resetSectionFilter();
        resetStatusFilter();
        updateStudentRecordsHeading();

        if (!school) {
            showEmptyStudentState();
            return;
        }

        $('#gradeFilter').prop('disabled', false);

        $.ajax({
            url: '/student-grades',
            method: 'GET',
            data: {
                school: school
            },
            success: function (grades) {
                grades.forEach(function (grade) {
                    $('#gradeFilter').append($('<option>', {value: grade,text: 'Grade ' + grade}));
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
        selectedStudentIds.clear();
        showNotificationFilterRequires('Please Select Section','warning','grade');
        resetSectionFilter();
        resetStatusFilter();
        updateStudentRecordsHeading();

        if (!school || !grade) {
            showEmptyStudentState();
            return;
        }
        $('#sectionFilter').prop('disabled', false);

        $.ajax({
            url: '/student-section',
            method: 'GET',
            data: {
                school: school,
                grade_level: grade
            },
            success: function (sections) {
                sections.forEach(function (section) {
                    $('#sectionFilter').append($('<option>', {value: section,text: section}));
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
        selectedStudentIds.clear();
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
                    $('#statusFilter').append('<option value="" selected disabled>No Status</option>').prop('disabled', true);
                    showEmptyStudentState();
                    return;
                }
                statuses.forEach(function (status) {
                    $('#statusFilter').append($('<option>', {value: status,text: status}));
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
        selectedStudentIds.clear();
        updateStudentRecordsHeading();
        loadStudents(1);
    });

    $(document).on('click', '.page-button', function () {
        const page = parseInt($(this).data('page'),10);

        if (!page || page < 1) {
            return;
        }
        loadStudents(page);
    });

    $('#checkAll').on('change', function () {
        const checked = this.checked;

        if (!checked) {
            selectedStudentIds.clear();
            updateCheckboxes();
            updateGenerateCount();
            return;
        }

        const filters = getStudentFilters();

        $.ajax({
            url: '/student-ids',
            method: 'GET',
            data: filters,
            beforeSend: function () {
                showLoading('Selecting all students...');
            },
            success: function (response) {
                selectedStudentIds.clear();

                if (response.ids && Array.isArray(response.ids)) {
                    response.ids.forEach(function (id) {
                        selectedStudentIds.add(String(id));
                    });
                }
                updateCheckboxes();
                updateGenerateCount();
            },
            error: function (xhr) {
                console.error('Failed to select all students:',xhr.responseText);

                $('#checkAll').prop('checked',false);
            },
            complete: function () {
                hideLoading();
            }
        });
    });

    $(document).on('change','.student-checkbox', function () {
        const studentId = String($(this).val());
        if (this.checked) {
            selectedStudentIds.add(studentId);
        }
        else {
            selectedStudentIds.delete(studentId);
        }
        updateGenerateCount();
        updateCheckAllState();
    });


    $('#generateQrButton').click(function () {
        const filters = getStudentFilters();
        const selectedStudents = Array.from(selectedStudentIds);

        if (selectedStudents.length === 0) {
            showNotification('Please select at least one student.','warning');
            return;
        }

        const params = new URLSearchParams();
        Object.keys(filters).forEach(function (key) {
            if (filters[key]) {
                params.append(key,filters[key]);
            }
        });

        selectedStudents.forEach(function (lrn) {
            params.append('lrns[]',lrn);
        });

        const printUrl = '/students/print?' + params.toString();
        const printFrame = document.getElementById('printFrame');

        showLoading('Generating QR Codes');
        $('#printFrame').off('load');
        $('#printFrame').one('load',function () {
            const studentCodes = $(printFrame.contentDocument).find('.code').map(function () {
                return $(this).text().trim();
            }).get();

            printFrame.dataset.studentCodes = JSON.stringify(studentCodes);

            setTimeout(function () {
                hideLoading();
                printFrame.contentWindow.onafterprint = function () {
                    const modalElement = document.getElementById('printConfirmationModal');
                    const printModal = new bootstrap.Modal(modalElement);
                    printModal.show();
                };
                printFrame.contentWindow.focus();
                printFrame.contentWindow.print();
            }, 300);
        });
        printFrame.src = printUrl;
    });

    $('#confirmPrintButton').click(function () {
        const printFrame = document.getElementById('printFrame');
        const studentCodes = JSON.parse(printFrame.dataset.studentCodes || '[]');

        if (!studentCodes || studentCodes.length === 0) {
            console.error('No student codes found.');
            return;
        }

        $.ajax({
            url: '/students/print-confirmed',
            type: 'POST',
            data: {
                _token: $('meta[name="csrf-token"]').attr('content'),
                codes:studentCodes
            },
            beforeSend: function () {
                showLoading('Loading students');
            },

            success: function (response) {

                console.log(
                    response.message
                );

                console.log(
                    'Updated:',
                    response.updated
                );


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


                showNotification(
                    'Printed successfully',
                    'success'
                );


                if (
                    $('#statusFilter option[value="Printed"]')
                        .length === 0
                ) {

                    $('#statusFilter').append(
                        '<option value="Printed">Printed</option>'
                    );

                }


                $('#statusFilter').val(
                    'Printed'
                );


                updateStudentRecordsHeading();


                selectedStudentIds.clear();


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
// GET STUDENT FILTERS
// ============================================================

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
// LOAD STUDENTS
// ============================================================

function loadStudents(page = 1) {

    const filters =
        getStudentFilters();


    if (
        !filters.school ||
        !filters.grade_level ||
        !filters.section ||
        !filters.status
    ) {

        showEmptyStudentState();

        return;

    }


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

            console.log(
                'Student list response:',
                response
            );


            /*
             * Support both:
             *
             * response.data
             *
             * and
             *
             * response.students.data
             */

            const paginator =
                response.students ||
                response;


            renderStudentTable(
                paginator
            );


            renderStudentPagination(
                paginator
            );


            updateCheckboxes();

            updateGenerateCount();

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
// RENDER STUDENT TABLE
// ============================================================

function renderStudentTable(response) {

    const students =
        response.data || [];


    $('#studentTable').empty();


    if (students.length === 0) {

        $('#studentTableContainer')
            .addClass('d-none');


        $('#noStudentsMessage')
            .removeClass('d-none')
            .text('No records found.');


        $('#pagination').empty();


        return;

    }


    $('#studentTableContainer')
        .removeClass('d-none');


    $('#noStudentsMessage')
        .addClass('d-none');


    students.forEach(function (student) {

        const studentRow =
            createStudentRow(
                student
            );


        $('#studentTable').append(
            studentRow
        );

    });


    // Restore selections for this page.
    updateCheckboxes();

}


// ============================================================
// CREATE STUDENT ROW
// ============================================================

function createStudentRow(student) {

    const fullName =
        `${student.last_name ?? ''}, ` +
        `${student.first_name ?? ''}` +
        `${student.middle_initial
            ? ' ' + student.middle_initial + '.'
            : ''
        }`;


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
                    value="${student.lrn ?? ''}"
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
// RENDER PAGINATION
// ============================================================

function renderStudentPagination(response) {

    $('#pagination').empty();


    if (!response) {
        return;
    }


    const currentPage =
        Number(
            response.current_page ||
            response.currentPage ||
            1
        );


    const lastPage =
        Number(
            response.last_page ||
            response.lastPage ||
            1
        );


    const total =
        Number(
            response.total ||
            0
        );


    console.log(
        'Pagination:',
        {
            currentPage,
            lastPage,
            total
        }
    );


    // No records or only one page.
    if (
        total === 0 ||
        lastPage <= 1
    ) {

        return;

    }


    // --------------------------------------------------------
    // PREVIOUS
    // --------------------------------------------------------

    if (currentPage > 1) {

        $('#pagination').append(`

            <button
                type="button"
                class="btn btn-sm btn-outline-secondary page-button"
                data-page="${currentPage - 1}"
            >
                Previous
            </button>

        `);

    }


    // --------------------------------------------------------
    // PAGE NUMBERS
    // --------------------------------------------------------

    for (
        let page = 1;
        page <= lastPage;
        page++
    ) {

        $('#pagination').append(`

            <button
                type="button"
                class="btn btn-sm ${
                    page === currentPage
                        ? 'btn-primary'
                        : 'btn-outline-secondary'
                } px-2 page-button"
                data-page="${page}"
            >
                ${page}
            </button>

        `);

    }


    // --------------------------------------------------------
    // NEXT
    // --------------------------------------------------------

    if (currentPage < lastPage) {

        $('#pagination').append(`

            <button
                type="button"
                class="btn btn-sm btn-outline-secondary page-button"
                data-page="${currentPage + 1}"
            >
                Next
            </button>

        `);

    }

}


// ============================================================
// UPDATE GENERATE COUNT
// ============================================================

function updateGenerateCount() {

    const count =
        selectedStudentIds.size;


    $('#generateCount').text(
        count > 0
            ? ` (${count})`
            : ''
    );

}


// ============================================================
// UPDATE CHECK ALL STATE
// ============================================================

function updateCheckAllState() {

    const total =
        $('.student-checkbox').length;


    const totalChecked =
        $('.student-checkbox:checked').length;


    /*
     * The checkbox is checked when:
     *
     * 1. There are rows on the current page
     * 2. Every row on the current page is selected
     *
     * OR all IDs returned by the current filter are selected.
     */

    $('#checkAll').prop(
        'checked',
        total > 0 &&
        total === totalChecked
    );

}


// ============================================================
// UPDATE CHECKBOXES
// ============================================================

function updateCheckboxes() {

    $('.student-checkbox').each(
        function () {

            const studentId =
                String(
                    $(this).val()
                );


            $(this).prop(
                'checked',
                selectedStudentIds.has(
                    studentId
                )
            );

        }
    );


    updateCheckAllState();

}


// ============================================================
// LOAD FILTERS
// ============================================================

function loadFilters() {

    $.ajax({

        url: '/student-filters',

        method: 'GET',

        success: function (filters) {

            console.log(
                JSON.stringify(filters)
            );


            resetFilterDropdowns();


            $('#gradeFilter')
                .prop('disabled', true);


            $('#sectionFilter')
                .prop('disabled', true);


            $('#statusFilter')
                .prop('disabled', true);


            const schools =
                filters.schools || [];


            if (schools.length === 0) {

                $('#clearFilters')
                    .prop('disabled', true)
                    .addClass('disabled');


                $('#schoolFilter')
                    .prop('disabled', true);


                showImportStudentsPrompt();


                return;

            }


            $('#clearFilters')
                .prop('disabled', false)
                .removeClass('disabled');


            showNotificationFilterRequires(
                'Please Select Station',
                'warning'
            );


            schools.forEach(function (school) {

                $('#schoolFilter')
                    .prop('disabled', false)
                    .append(

                        $('<option>', {

                            value: school,

                            text: school

                        })

                    );

            });


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
// RESET ALL FILTERS
// ============================================================

function resetFilters() {

    selectedStudentIds.clear();


    $('#schoolFilter')
        .val('');


    resetGradeFilter();

    resetSectionFilter();

    resetStatusFilter();

}


// ============================================================
// RESET GRADE
// ============================================================

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


// ============================================================
// RESET SECTION
// ============================================================

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


// ============================================================
// RESET STATUS
// ============================================================

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


// ============================================================
// RESET FILTER DROPDOWNS
// ============================================================

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

function showImportResult(response) {

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
                'No employee records were found.'
            );

    }


    $('#modalImported')
        .text(
            response.imported
        );


    $('#modalSkipped')
        .text(
            response.skipped
        );


    $('#skippedRowsTable')
        .empty();


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

                $('#skippedRowsTable')
                    .append(`

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

        $('#skippedRowsContainer')
            .addClass('d-none');

    }


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
// NOTIFICATION
// ============================================================

function showNotification(
    message,
    type
) {

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


    setTimeout(function () {

        notification.addClass(
            'd-none'
        );

    }, 10000);

}


// ============================================================
// FILTER NOTIFICATION
// ============================================================

function showNotificationFilterRequires(
    message = '',
    type = '',
    filter = ''
) {

    const notification =
        $('#notification');


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

    else if (
        filter === 'section'
    ) {

        notification
            .addClass('d-none')
            .removeClass(
                'alert-success alert-danger alert-warning'
            );

    }

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

function showLoading(
    message = 'Loading...'
) {

    $('.loading-text')
        .text(message);


    $('#loadingOverlay')
        .css(
            'display',
            'flex'
        );

}


function hideLoading() {

    $('#loadingOverlay').hide();

}


// ============================================================
// EMPTY STATE
// ============================================================

function showEmptyStudentState() {

    $('#studentTableContainer')
        .addClass('d-none');


    $('#noStudentsMessage')
        .removeClass('d-none')
        .text(
            'No records found'
        );


    $('#pagination')
        .empty();


    $('#recordCount')
        .text('');


    $('#generateCount')
        .text('');

}


// ============================================================
// STUDENT HEADING
// ============================================================

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


    if (school) {

        heading +=
            '<i class="bi bi-chevron-right"></i> ' +
            school;

    }


    if (grade) {

        heading +=
            '<i class="bi bi-chevron-right"></i> Grade ' +
            grade;

    }


    if (section) {

        heading +=
            '<i class="bi bi-chevron-right"></i> ' +
            section;

    }


    if (status) {

        heading +=
            '<i class="bi bi-chevron-right"></i> ' +
            status;

    }


    $('#studentRecordsHeading')
        .html(heading);

}


// ============================================================
// NO STUDENT DATA PROMPT
// ============================================================

function showImportStudentsPrompt() {

    $('#studentTableContainer')
        .addClass('d-none');


    $('#pagination')
        .empty();


    $('#recordCount')
        .text('');


    $('#generateCount')
        .text('');


    showNotificationFilterRequires(

        'No student records are available. Please import or upload student records.',

        'warning',

        'noStudents'

    );


    $('#noStudentsMessage')
        .addClass('d-none')
        .empty();

}
