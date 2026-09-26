// console.log('STUDENTS JS IS LOADED');

$(document).ready(function () {

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

    resetFilters();
    loadFilters();
    showEmptyStudentState();

    $('#clearFilters').click(function () {
        resetFilters();
        $('#studentRecordsHeading').text('Student Records');
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
            success: function (response) {
                showImportResult(response);
                loadFilters();
                $('#file').val('');
            },
            error: function (xhr) {
                if (xhr.status === 422) {
                    showNotification('Please select a valid Excel file (.xlsx or .xls).','warning');
                } else if (xhr.status === 419) {
                    showNotification('Your session has expired. Please refresh the page and try again.','warning');
                } else {
                    showNotification('Unable to import the file. Please check the file and try again.','danger');
                }
            }
        });
    });

    $('#schoolFilter').change(function () {
        const school = $(this).val();
        $('#gradeFilter').val('');
        $('#sectionFilter').val('');
        $('#sectionFilter').html('<option value="" selected disabled>Select Section</option>');
        $('#sectionFilter').prop('disabled', true);
        if (!school) {
            $('#gradeFilter').prop('disabled', true);
            showEmptyStudentState();
            return;
        }

        $('#gradeFilter').prop('disabled', false);
        $('#gradeFilter').html('<option value="" selected disabled>Select Grade Level</option>');

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
        $('#sectionFilter').html('<option value="" selected disabled>Select Section</option>');

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

    $('#sectionFilter').change(function () {
        const section = $(this).val();
        if (section) {
            loadStudents(1);
        } else {
            showEmptyStudentState();
        }
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
        showLoading('Generating QR Codes...');
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
            school_year: $('#schoolYearFilter').val()
        },
        beforeSend: function () {
            showLoading('Loading students...');
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
                            <td>${student.school ?? ''}</td>
                            <td>${student.grade_level ?? ''}-${student.section ?? ''}</td>
                            <td>${student.gender ?? ''}</td>
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
            $('#schoolFilter').html('<option value="" selected disabled>' + 'Select School' + '</option>');
            $('#gradeFilter').html('<option value="" selected disabled>' + 'Select Grade Level' + '</option>');
            $('#sectionFilter').html('<option value="" selected disabled>' + 'Select Section' + '</option>');

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
    $('#modalImported').text(response.imported);
    $('#modalSkipped').text(response.skipped);
    $('#importResultMessage').text(response.message);
    $('#skippedRowsTable').empty();


    if (response.skipped_rows && response.skipped_rows.length > 0) {
        $('#skippedRowsContainer').removeClass('d-none');
        $('#skippedRowsCount').text(response.skipped_rows.length);

        response.skipped_rows.forEach(function (row) {
            $('#skippedRowsTable').append(`
                <tr>
                    <td class="fw-semibold">${row.excel_row}</td>
                    <td><span class="text-danger">${row.reason}</span></td>
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
    notification.removeClass('d-none alert-success alert-danger alert-warning').addClass('alert-' + type).text(message);

    setTimeout(function () {
        notification.addClass('d-none');
    }, 4000);
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

    $('#noStudentsMessage').removeClass('d-none').text('Select a school, grade level, and section to view student records and generate QR codes.');

    // Clear pagination
    $('#pagination').empty();

    // Reset counts
    $('#recordCount').text('');
    $('#generateCount').text('0');
}