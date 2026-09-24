// console.log('STUDENTS JS IS LOADED');

$(document).ready(function () {

    // Reset filters when page opens
    resetFilters();

    // Load filter options
    loadFilters();

    // Load all students
    loadStudents();

    //serach students
    $('#search').on('input', function () {
        loadStudents(1);
    });
    //end of search student

    $('#clearFilters').click(function () {
        resetFilters();
        loadStudents();
    });
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

        // console.log('Selected file:', file.name);
        const formData = new FormData();
        formData.append('file', file);

        // Send file to Laravel - end of ejax request /students/import
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
                    showNotification('Please select a valid Excel or CSV file.','warning');
                } else if (xhr.status === 419) {
                    showNotification('Your session has expired. Please refresh the page and try again.','warning');
                } else {
                    showNotification('Unable to import the file. Please check the file and try again.','danger');
                }
            }
        });
        //end of ejax request /students/import
    //end of file selection
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





    // start of generate qr
    $('#generateQrButton').click(function () {

    const filters = {
        search: $('#search').val(),
        gender: $('#genderFilter').val(),
        grade_level: $('#gradeFilter').val(),
        school: $('#schoolFilter').val(),
        section: $('#sectionFilter').val(),
        school_year: $('#schoolYearFilter').val()
    };

    console.log('Print filters:', filters);

    // Open the new tab immediately
    const printWindow = window.open('', 'qrPrintWindow');

    // Check if browser blocked the popup
    if (!printWindow) {
        alert('Please allow pop-ups for this website.');
        return;
    }

    // Show loading screen immediately in the new tab
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Generating QR Codes...</title>

            <style>
                * {
                    box-sizing: border-box;
                }

                body {
                    margin: 0;
                    font-family: Arial, sans-serif;
                    background: #f8f9fa;
                }

                .loading-overlay {
                    position: fixed;
                    inset: 0;
                    background: white;

                    display: flex;
                    align-items: center;
                    justify-content: center;

                    z-index: 99999;
                }

                .loading-box {
                    text-align: center;
                }

                .spinner {
                    width: 45px;
                    height: 45px;

                    border: 4px solid #dee2e6;
                    border-top: 4px solid #0d6efd;

                    border-radius: 50%;

                    animation: spin 0.8s linear infinite;

                    margin: 0 auto;
                }

                .loading-text {
                    margin-top: 18px;
                    font-size: 18px;
                    font-weight: 600;
                    color: #212529;
                }

                .loading-subtext {
                    margin-top: 6px;
                    font-size: 14px;
                    color: #6c757d;
                }

                @keyframes spin {
                    from {
                        transform: rotate(0deg);
                    }

                    to {
                        transform: rotate(360deg);
                    }
                }
            </style>
        </head>

        <body>

            <div class="loading-overlay">

                <div class="loading-box">

                    <div class="spinner"></div>

                    <div class="loading-text">
                        Generating QR Codes...
                    </div>

                    <div class="loading-subtext">
                        Please wait. This may take a while.
                    </div>

                </div>

            </div>

        </body>
        </html>
    `);

    printWindow.document.close();


    // Create POST form
    const form = $('<form>', {
        method: 'POST',
        action: '/students/print',
        target: 'qrPrintWindow'
    });

    // CSRF token
    form.append($('<input>', {
        type: 'hidden',
        name: '_token',
        value: $('meta[name="csrf-token"]').attr('content')
    }));

    // Add filters
    $.each(filters, function (key, value) {

        form.append($('<input>', {
            type: 'hidden',
            name: key,
            value: value
        }));

    });

    $('body').append(form);


    // Give browser a moment to render the spinner
    setTimeout(function () {

        form.submit();

        form.remove();

    }, 100);

});
    //end of generate qr
//end of .ready
});

// reset filters
function resetFilters() {
    $('#search').val('');
    $('#schoolFilter').val('');
    $('#gradeFilter').val('');
    $('#sectionFilter').val('');
    $('#genderFilter').val('');
    $('#schoolYearFilter').val('');

}

//start of the function load stduents
function loadStudents(page = 1) {
    // console.log('loadStudents() is running');
    // console.log('Search:', $('#search').val());
    // console.log('Gender:', $('#genderFilter').val());
    // console.log('Grade:', $('#gradeFilter').val());
    // console.log('School:', $('#schoolFilter').val());
    // console.log('Section:', $('#sectionFilter').val());
    // console.log('School Year:', $('#schoolYearFilter').val());

    showLoading('Fetching students...');
    $.ajax({
        url: '/studentslist',
        method: 'GET',
        data: {
            page: page,
            search: $('#search').val(),
            gender: $('#genderFilter').val(),
            grade_level: $('#gradeFilter').val(),
            school: $('#schoolFilter').val(),
            section: $('#sectionFilter').val(),
            school_year: $('#schoolYearFilter').val()
        },

        success: function (response) {
            // console.log('Full response from database:', response);
            // console.log('Students:', response.data);
            // console.log('Current page:', response.current_page);
            // console.log('Last page:', response.last_page);
            // console.log('Total students:', response.total);
            // Clear current table
            $('#studentTable').empty();

            // Update record count
            $('#recordCount').text(
                response.from + '-' + response.to + ' of ' + response.total + 'Records'
            );

            // Update Generate QR count
            $('#generateCount').text(
                response.total
            );

            // Add students to table
            if(response.data.length === 0){
                // Hide table
                $('#studentTableContainer').addClass('d-none');

                // Show empty message
                $('#noStudentsMessage').removeClass('d-none');

                // Hide pagination
                $('#pagination').empty();
            }else{
                 $('#studentTableContainer').removeClass('d-none');

                // Hide empty message
                $('#noStudentsMessage').addClass('d-none');

                response.data.forEach(function (student) {
                // console.log('Rendering:',student.first_name,student.last_name);

                    const row = `
                        <tr class="">
                            <td class="fw-semibold">${student.lrn ?? ''}</td>
                            <td >${student.last_name ?? ''},${student.first_name ?? ''}${student.middle_initial ? ' ' + student.middle_initial + '.' : ''}
                            </td>
                            <td>${student.school ?? ''}</td>
                            <td>${student.grade_level ?? ''}-${student.section ?? ''}</td>
                            <td>${student.gender ?? ''}</td>
                            <td>${student.school_year ?? ''}</td>
                        </tr>
                    `;
                    $('#studentTable').append(row);
                });
            }

            // Render pagination
            if (response.total === 0) {
                $('#pagination').empty();
            } else {
                renderPagination(response);
            }

            // console.log('Final table:',$('#studentTable').html());
        },

        error: function (xhr) {
            console.error('Failed to load students:',xhr.responseText);
        },
        complete: function() {
            hideLoading();
        }
    });
}
//end of the function load stduents

//pagination onclick start
$(document).on('click', '.page-button', function () {
    const page = $(this).data('page');
    // console.log('Loading page:', page);
    loadStudents(page);
});

// rener pagination function start
function renderPagination(response) {
    $('#pagination').empty();

    // Previous button
    if (response.current_page > 1) {
        $('#pagination').append(`<button class="btn btn-sm btn-outline-secondary page-button" data-page="${response.current_page - 1}">Previous</button>`);
    }
    // Page numbers
    for (let page = 1;page <= response.last_page;page++) {
        $('#pagination').append(`<button class="btn btn-sm  ${page === response.current_page ? 'btn-primary' : 'btn-outline-secondary' } px-3 p-2 page-button" data-page="${page}">${page}</button>`);
    }

    // Next button
    if (response.current_page < response.last_page) {
        $('#pagination').append(`<button class="btn btn-sm btn-outline-secondary page-button" data-page="${response.current_page + 1}">Next</button>`);
    }

}
//end of pagination


//start of load filter function
function loadFilters() {
    //start of ajax request - /students-filters
    $.ajax({
        url: '/student-filters',
        method: 'GET',
        success: function (filters) {
            // console.log('Filters:', filters);

            // Reset dynamic dropdowns
            $('#schoolFilter').html('<option value="">All</option>');
            $('#sectionFilter').html('<option value="">All</option>');
            $('#schoolYearFilter').html('<option value="">All</option>');

            // filter sschools for dynamic dropdown
            filters.schools.forEach(function (school) {
                $('#schoolFilter').append(`<option value="${school}">${school}</option>`);
            });
            //end of filter school for dynamic dropdown

            // filter dropdown for dynmic dropdown
            filters.sections.forEach(function (section) {
                $('#sectionFilter').append(`<option value="${section}">${section}</option>`);
            });
            //end of filter secition for dynamic drop down

            // filter school years for dynamic dropdown
            filters.school_years.forEach(function (schoolYear) {
                $('#schoolYearFilter').append(`<option value="${schoolYear}">${schoolYear}</option>`);
            });
        },
        error: function (xhr) {
            console.error('Failed to load filters:',xhr.responseText);
        }
    });
    //end of ajax request - /students-filters
}
//end of load filter function


//start of showImportResult function
function showImportResult(response) {
    // Update summary
    $('#modalImported').text(response.imported);
    $('#modalSkipped').text(response.skipped);
    $('#importResultMessage').text(response.message);

    // Clear previous skipped rows
    $('#skippedRowsTable').empty();

    // Check skipped rows
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
    //end of booostra modal
}
//end of showimportresultfunction

//start of show notifaction function
function showNotification(message, type) {
    const notification = $('#notification');
    notification.removeClass('d-none alert-success alert-danger alert-warning').addClass('alert-' + type).text(message);
    //timeout for showing the notifaction and then remove it after 4 seconds on dom
    setTimeout(function () {
        notification.addClass('d-none');
    }, 4000);
    //end of timeout
}
//end of show notifaction function


function showLoading(message = 'Loading...') {
    $('.loading-text').text(message);
    $('#loadingOverlay').css('display', 'flex');
}

function hideLoading() {
    $('#loadingOverlay').hide();
}