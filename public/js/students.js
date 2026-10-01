// console.log('STUDENTS JS IS LOADED');

$(document).ready(function () {
   $('#schoolFilter, #gradeFilter, #sectionFilter, #statusFilter').change(function () {
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
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
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
        console.log('Selected school:', school);
        $('#gradeFilter').html('<option value="" selected disabled>Grade Level</option>').prop('disabled', true);
        // Reset section
        $('#sectionFilter').html('<option value="" selected disabled>Section</option>').prop('disabled', true);
        // Reset status
        $('#statusFilter').html('<option value="" selected disabled>Status</option>').prop('disabled', true);

        updateStudentRecordsHeading();
        if (!school) {
            showEmptyStudentState();
            return;
        }

        $('#gradeFilter').prop('disabled', false);
        // Get grades
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

        // Reset section
        $('#sectionFilter').html('<option value="" selected disabled>Section</option>').prop('disabled', true);

        // Reset status
        $('#statusFilter').html('<option value="" selected disabled>Status</option>').prop('disabled', true);
        updateStudentRecordsHeading();

        if (!school || !grade) {
            showEmptyStudentState();
            return;
        }

        // Enable section filter
        $('#sectionFilter').prop('disabled', false);

        // Get sections
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
        const grade_level = $('#gradeFilter').val();

        // Reset status
        $('#statusFilter').html('<option value="" selected disabled>Not Printed</option>').prop('disabled', true);
        updateStudentRecordsHeading();

        if (!section) {
            $('#statusFilter').html('<option value="" selected disabled>Status</option>').prop('disabled', true);
            showEmptyStudentState();
            return;
        }

        // Load dynamic statuses
        $.ajax({
            url: '/status',
            method: 'GET',
            data: {
                school: school,
                section: section,
                grade_level: grade_level
            },
            success: function (statuses) {
             // Clear current status options
                $('#statusFilter').empty();

                if (!statuses || statuses.length === 0) {
                    $('#statusFilter').append('<option value="" selected disabled>No Status</option>').prop('disabled', true);
                    showEmptyStudentState();
                    return;
                }

                // Add statuses returned from backend
                statuses.forEach(function (status) {
                    $('#statusFilter').append(`<option value="${status}">${status}</option>`);
                });

                // Default to Not Printed if available
                if (statuses.includes('Not Printed')) {
                    $('#statusFilter').val('Not Printed');
                } else {
                    // Otherwise select the first status
                    $('#statusFilter').val(statuses[0]);
                }

                // Enable status filter
                $('#statusFilter').prop('disabled', false);
                updateStudentRecordsHeading();
                // Automatically load students
                loadStudents(1);
            },
            error: function (xhr) {
                console.error('Failed to load statuses:',xhr.responseText);
                $('#statusFilter').html('<option value="" selected disabled>Status</option>').prop('disabled', true);
            }
        });
    });

    $('#statusFilter').change(function () {
        updateStudentRecordsHeading();
        loadStudents(1);
    });


    $('#generateQrButton').click(function () {
        const filters = {
            search: $('#search').val(),
            gender: $('#genderFilter').val(),
            grade_level: $('#gradeFilter').val(),
            school: $('#schoolFilter').val(),
            section: $('#sectionFilter').val(),
            school_year: $('#schoolYearFilter').val(),
            status: $('#statusFilter').val()
        };

        let selectedStudent = [];
        console.log(selectedStudent);
        $('.student-checkbox:checked').each(function() {
            selectedStudent.push($(this).val());
        })

        if (selectedStudent.length === 0) {
            showNotification('Please select at least one student.', 'warning');
            return;
        }

        const params = new URLSearchParams();

        Object.keys(filters).forEach(function (key) {
            if (filters[key]) {
                params.append(key, filters[key]);
            }
        });
        selectedStudent.forEach(function (lrn) {
            params.append('lrns[]', lrn);
        });

        const printUrl = '/students/print?' + params.toString();
        const printFrame = document.getElementById('printFrame');
        showLoading('Generating QR Codes');
        $('#printFrame').off('load');

        $('#printFrame').one('load', function () {
            // Get the exact student codes from the loaded print page
            const studentCodes = $(printFrame.contentDocument).find('.code').map(function () {
                return $(this).text().trim();
            }).get();
            // Store the codes on the iframe element
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

    $('#checkAll').on('change', function () {
        $('.student-checkbox').prop('checked', this.checked);
        const checked = $('.student-checkbox:checked').length;
        $('#generateCount').text(checked > 0 ? ` (${checked})` : '');
    });

     $(document).on('change', '.student-checkbox', function () {
        const total = $('.student-checkbox').length;
        const totalChecked = $('.student-checkbox:checked').length;
        $('#generateCount').text(totalChecked > 0 ? ` (${totalChecked})` : '');
        $('#checkAll').prop('checked', total > 0 && total === totalChecked);
    });


    $('#confirmPrintButton').click(function () {
        const printFrame = document.getElementById('printFrame');
        // Get the exact student codes from the QR print page
        const studentCodes =JSON.parse(printFrame.dataset.studentCodes || '[]');
        console.log('Students being marked as Printed:', studentCodes);
        if (!studentCodes || studentCodes.length === 0) {
            console.error('No student codes found.');
            return;
        }
        $.ajax({
            url: '/students/print-confirmed',
            type: 'POST',
            data: {
                _token: $('meta[name="csrf-token"]').attr('content'),
                codes: studentCodes
            },
            beforeSend: function () {
                showLoading('Loading students');
            },
            success: function (response) {
                console.log(response.message);
                console.log('Updated:', response.updated);
                const modalElement = document.getElementById('printConfirmationModal');
                const printModal = bootstrap.Modal.getInstance(modalElement);
                if (printModal) {
                    printModal.hide();
                }
                showNotification('Printed successfully','success');
                if ($('#statusFilter option[value="Printed"]').length === 0) {
                    $('#statusFilter').append('<option value="Printed">Printed</option>');
                }
                // Select Printed
                $('#statusFilter').val('Printed');
                // Update heading
                updateStudentRecordsHeading();
                // Reload student list
                loadStudents(1);
            },
            error: function (xhr) {
                console.error('Failed to update print status.');
                console.error(xhr.responseText);
            },
            complete: function () {
                hideLoading();
            }
        });

    });


});

function resetFilters() {
    $('#search').val('');
    $('#schoolFilter').val('');
    $('#gradeFilter').val('').prop('disabled', true);
    $('#sectionFilter').html('<option value="" selected disabled>Section</option>').val('').prop('disabled', true);
    $('#genderFilter').val('');
    $('#schoolYearFilter').val('');
    $('#statusFilter').html('<option value="" selected disabled>Status</option>').val('').prop('disabled', true);
}


function loadStudents(page = 1) {
    const school = $('#schoolFilter').val();
    const grade = $('#gradeFilter').val();
    const section = $('#sectionFilter').val();
    const status = $('#statusFilter').val();
    const selectedStudent = [];

    // Require the main filters
    if (!school || !grade || !section || !status) {
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
            status: status
        },
        beforeSend: function () {
            showLoading('Loading students');
        },
        success: function (response) {
            $('#studentTable').empty();
            if (response.data.length === 0) {
                $('#studentTableContainer').addClass('d-none');
                $('#noStudentsMessage').removeClass('d-none').text('No records found.');
                $('#pagination').empty();
            } else {
                $('#studentTableContainer').removeClass('d-none');
                $('#noStudentsMessage').addClass('d-none');

                response.data.forEach(function (student) {
                    console.log('this is load students' +    student.lrn)
                    const fullName = `${student.last_name ?? ''}, ${student.first_name ?? ''}${student.middle_initial ? ' ' + student.middle_initial + '.' : ''}`;
                    const statusBadge = student.status === 'Printed' ? 'bg-success' : 'bg-secondary';
                    const row = `
                        <tr>
                            <td><input type="checkbox" class="student-checkbox" name="students[]" value="${student.lrn}"></td>
                            <td>${student.lrn ?? ''}</td>
                            <td>${fullName}</td>
                            <td>${student.grade_level ?? ''}-${student.section ?? ''}</td>
                            <td>${student.gender ?? ''}</td>
                            <td><span class="badge rounded-pill ${statusBadge}">${student.status}</span></td>
                        </tr>
                    `;
                    $('#studentTable').append(row);
                });
            }

            // Pagination
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
        $('#pagination').append(`
            <button class="btn btn-sm btn-outline-secondary page-button" data-page="${response.current_page - 1}">Previous</button>
        `);
    }

    for (let page = 1;page <= response.last_page;page++) {
        $('#pagination').append(`
            <button class="btn btn-sm ${page === response.current_page ? 'btn-primary' : 'btn-outline-secondary'} px-2 page-button" data-page="${page}">${page}</button>
        `);
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
            // School
            $('#schoolFilter').html('<option value="" selected disabled>Station</option>');
            // Grade
            $('#gradeFilter').html('<option value="" selected disabled>Grade Level</option>');

            // Section
            $('#sectionFilter').html('<option value="" selected disabled>Section</option>');

            // Status
            $('#statusFilter').html('<option value="" selected disabled>Status</option>');

            // Disable dependent filters
            $('#gradeFilter').prop('disabled', true);
            $('#sectionFilter').prop('disabled', true);
            $('#statusFilter').prop('disabled', true);

            // Populate schools
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
   if (response.imported > 0) {
        $('#importResultModalLabel').text('Records Added Successfully');
        $('#importResultMessage').text('Student records were saved successfully.');
    } else if (response.skipped > 0) {
        $('#importResultModalLabel').text('No New Records Added');
        $('#importResultMessage').text('All student records are already added.');
    } else {
        $('#importResultModalLabel').text('No Student Records Found');
        $('#importResultMessage').text('No student records were found.');
    }
    // Imported count
    $('#modalImported').text(response.imported);

    // Skipped count
    $('#modalSkipped').text(response.skipped);

    // Clear skipped rows
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
    // Hide table
    $('#studentTableContainer').addClass('d-none');

    // Show empty message
    $('#noStudentsMessage').removeClass('d-none').text('No records found');

    // Clear pagination
    $('#pagination').empty();
    // Reset counts
    $('#recordCount').text('');
    $('#generateCount').text('');
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
        heading += '<i class="bi bi-chevron-right"></i> ' + status;
    }

    $('#studentRecordsHeading').html(heading);
}
