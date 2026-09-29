// console.log('STUDENTS JS IS LOADED');

$(document).ready(function () {

   $('#schoolFilter, #gradeFilter, #sectionFilter, #statusFilter' ).change(function () {
        updateStudentRecordsHeading();
    });

    loadFilters();
    resetFilters();
    showEmptyStudentState();

    $('#clearFilters').click(function () {
        resetFilters();
        $('#studentRecordsHeading').text('');
        showEmptyStudentState();
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
                'X-CSRF-TOKEN':
                    $('meta[name="csrf-token"]').attr('content')
            },
            beforeSend: function () {
                showLoading('Importing Student Records');
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
                    showNotification(message, 'warning');
                } else if (xhr.status === 419) {
                    showNotification('Your session has expired. Please refresh the page and try again.','warning');
                } else {
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
        console.log(school);
        $('#gradeFilter').val('');
        $('#sectionFilter').val('');
         $('#statusFilter').val('');

        $('#sectionFilter').html('<option value="" selected disabled>Select Section</option>');
        $('#sectionFilter').prop('disabled', true);
    

        $('#statusFilter').html('<option value="" selected disabled>Select Status</option>');
        $('#statusFilter').prop('disabled', true);
        updateStudentRecordsHeading();
        if (!school) {
            $('#gradeFilter').prop('disabled', true);
            showEmptyStudentState();
            return;
        }
        $('#gradeFilter').html('<option value="" selected disabled>Select Grade Level</option>');
        $('#gradeFilter').prop('disabled', false);

      

        $.ajax({
            url: '/student-grades',
            method: 'GET',
            data: {school: school},
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
        $('#sectionFilter').val('');
        $('#statusFilter').val('');
        $('#sectionFilter').html('<option value="" selected disabled>Select Section</option>');
        $('#statusFilter').val('');
        $('#statusFilter').prop('disabled', true);
        updateStudentRecordsHeading();
        if (!school || !grade) {
            $('#sectionFilter').prop('disabled', true);
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
                    $('#sectionFilter').append(`<option value="${section}">${section}</option>`);
                });
            },
            error: function (xhr) {
                console.error('Failed to load sections:',xhr.responseText);
            }
        });
        showEmptyStudentState();
    });
    //start of seciton filter
    $('#sectionFilter').change(function () {
        const section = $(this).val();
        $('#statusFilter').val('');
        const school = $('#schoolFilter').val();
        const grade_level = $('#gradeFilter').val();
        if (section) {
            $('#statusFilter').prop('disabled', false);
        } else {
            $('#statusFilter').prop('disabled', true);
            $('#statusFilter').val('');
            showEmptyStudentState();
        }

        $.ajax({
            url: '/status',
            method: 'GET',
            data: {
                school: school,
                section: section,
                grade_level: grade_level,
            },
            success: function(statuses) {
                 $('#statusFilter').html('<option value="" selected disabled>Select Status</option>');
                statuses.forEach((status) => {
                    $('#statusFilter').append(`<option value="${status}">${status}</option>`)
                })
            },




        })
    });
    //end of section filter
    $('#statusFilter').change(function () {
        loadStudents(1);
    });

    $('#generateQrButton').click(function () {
        const filters = {
            search: $('#search').val(),
            gender: $('#genderFilter').val(),
            grade_level: $('#gradeFilter').val(),
            school: $('#schoolFilter').val(),
            section: $('#sectionFilter').val(),
            school_year: $('#schoolYearFilter').val()
        };

        const params = new URLSearchParams();
        Object.keys(filters).forEach(function (key) {
            if (filters[key]) {
                params.append(key, filters[key]);
            }
        });
        const printUrl ='/students/print?' + params.toString();
        const printFrame = document.getElementById('printFrame');
        showLoading('Generating QR Codes');
        $('#printFrame').off('load');

        $('#printFrame').one('load', function () {
            setTimeout(function () {
                hideLoading();
                printFrame.contentWindow.focus();
                printFrame.contentWindow.print();
            }, 300);
        });

        printFrame.src = printUrl;
    });

});
//end ng document.ready

//helper/functions
function resetFilters() {
    $('#search').val('');
    $('#schoolFilter').val('');
    $('#gradeFilter').val('');
    $('#sectionFilter').val('');
    $('#genderFilter').val('');
    $('#schoolYearFilter').val('');
     $('#statusFilter').val('');
    $('#statusFilter').prop('disabled', true);
    $('#gradeFilter').prop('disabled', true);
    $('#sectionFilter').prop('disabled', true);
}

function loadStudents(page = 1) {
    const school = $('#schoolFilter').val();
    const grade = $('#gradeFilter').val();
    const section = $('#sectionFilter').val();

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
            school_year: $('#schoolYearFilter').val(),
            status: $('#statusFilter').val(),
        },
        beforeSend: function () {
            showLoading('Loading students');
        },
        success: function (response) {
            $('#studentTable').empty();
            $('#recordCount').text(response.from + '-' + response.to + ' of ' + response.total + 'Records');
            $('#generateCount').text(response.total);

            if (response.data.length === 0) {
                $('#studentTableContainer').addClass('d-none');
                $('#noStudentsMessage').removeClass('d-none');
                $('#pagination').empty();
            } else {
                $('#studentTableContainer').removeClass('d-none');
                $('#noStudentsMessage').addClass('d-none');
                response.data.forEach(function (student) {
                    const row = `
                        <tr>
                            <td>${student.lrn ?? ''}</td>
                            <td>${student.last_name ?? ''},${student.first_name ?? ''}${student.middle_initial? ' ' + student.middle_initial + '.': ''} </td>   
                            <td>${student.grade_level ?? ''}-${student.section ?? ''}</td>
                            <td>${student.gender ?? ''}</td>
                            <td>
                                <span class="badge rounded-pill ${
                                    student.status === 'printed'
                                        ? 'text-success bg-success-subtle'
                                        : 'text-secondary bg-secondary-subtle'
                                    }">
                                    ${student.status === 'printed' ? 'Printed' : 'Not Printed'}
                                </span>
                            </td>
                        </tr>
                    `;
                    $('#studentTable').append(row);
                });
            }
            if (response.total === 0) {
                $('#pagination').empty();
            } else {
                renderPagination(response);
            }
        },
        error: function (xhr) {
            console.error('Failed to load students:',xhr.responseText);
        },
        complete: function () {
            hideLoading();
        }
    });
}

$(document).on('click', '.page-button', function () {
    const page = $(this).data('page');
    loadStudents(page);
});

function renderPagination(response) {
    $('#pagination').empty();
    if (response.current_page > 1) {
        $('#pagination').append(`<button class="btn btn-sm btn-outline-secondary page-button" data-page="${response.current_page - 1}"> Previous </button>`);
    }

    for (let page = 1;page <= response.last_page;page++) {
        $('#pagination').append(`<button class="btn btn-sm ${page === response.current_page ? 'btn-primary' : 'btn-outline-secondary'} px-3 p-2 page-button" data-page="${page}"> ${page}</button>`);
    }

    if (response.current_page < response.last_page) {
        $('#pagination').append(`<button class="btn btn-sm btn-outline-secondary page-button" data-page="${response.current_page + 1}">Next</button>`);
    }
}

function loadFilters() {
    $.ajax({
        url: '/student-filters',
        method: 'GET',
        success: function (filters) {
            $('#schoolFilter').html('<option value="" selected disabled>Select School</option>');
            $('#gradeFilter').html('<option value="" selected disabled>Select Grade Level</option>');
            $('#sectionFilter').html('<option value="" selected disabled>Select Section</option>');
             $('#statusFilter').html('<option value="" selected disabled>Select Status</option>');
            $('#gradeFilter').prop('disabled', true);
            $('#sectionFilter').prop('disabled', true);
            filters.schools.forEach(function (school) {
                $('#schoolFilter').append(`<option value="${school}">${school}</option>`);
            });
        },
        error: function (xhr) {
            console.error('Failed to load filters:',xhr.responseText);
        }
    });
}

function showImportResult(response) {
    // Change heading and subheader depending on import result
    if (response.imported > 0) {

        $('#importResultModalLabel').text('Import Completed');

        $('#importResultMessage').text(
            'Your student records have been successfully imported.'
        );

    } else if (response.skipped > 0) {

        $('#importResultModalLabel').text('No Records Imported');

        $('#importResultMessage').text(
            'The import process has completed.'
        );

    } else {

        $('#importResultModalLabel').text('No Records Found');

        $('#importResultMessage').text(
            'No student records were available to import.'
        );
    }


    // Update imported count
    $('#modalImported').text(response.imported);

    // Update skipped count
    $('#modalSkipped').text(response.skipped);

    // Update skipped rows
    $('#skippedRowsTable').empty();

    if (response.skipped_rows && response.skipped_rows.length > 0) {

        $('#skippedRowsContainer').removeClass('d-none');

        $('#skippedRowsCount').text(response.skipped_rows.length);

        response.skipped_rows.forEach(function (row) {

            $('#skippedRowsTable').append(`
                <tr>
                    <td class="fw-semibold">${row.excel_row}</td>
                    <td>
                        <span class="text-danger">${row.reason}</span>
                    </td>
                </tr>
            `);
        });

    } else {

        $('#skippedRowsContainer').addClass('d-none');
    }


    // Show modal
    const modalElement = document.getElementById('importResultModal');
    const modal = new bootstrap.Modal(modalElement);

    modal.show();
}



function showNotification(message, type) {
    const notification = $('#notification');
    notification.removeClass('d-none alert-success alert-danger alert-warning').addClass('alert-' + type).text(message);

    setTimeout(function () {
        notification.addClass('d-none');
    }, 10000);
}


function showLoading(message = 'Loading...') {
    $('.loading-text').text(message);
    $('#loadingOverlay').css('display','flex');
}


function hideLoading() {
    $('#loadingOverlay').hide();
}

function showEmptyStudentState() {
    // Hide student table
    $('#studentTableContainer').addClass('d-none');

    // Show empty message

    $('#noStudentsMessage').removeClass('d-none').text('No records found');

    // Clear pagination
    $('#pagination').empty();

    // Reset counts
    $('#recordCount').text('');
    $('#generateCount').text('0');
}

function updateStudentRecordsHeading() {
    const school = $('#schoolFilter').val();
    const grade = $('#gradeFilter').val();
    const section = $('#sectionFilter').val();
    const status = $('#statusFilter').val();

    let heading = '';

    if (school) {
        heading += '<i class="bi bi-chevron-right"></i> ' + school;
    }

    if (grade) {
        heading += '<i class="bi bi-chevron-right"></i> Grade ' + grade;
    }

    if (section) {
        heading += '<i class="bi bi-chevron-right"></i> ' + section;
    }
    if (status) { 
        const statusText = status === 'printed' ? 'Printed' : 'Not Printed'; 
        heading += '<i class="bi bi-chevron-right"></i> ' + statusText; }

    if (!heading) {
        heading = '';
    }

    $('#studentRecordsHeading').html(heading);
}