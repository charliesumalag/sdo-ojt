$(document).ready(function () {
    loadFilters();
    showEmptyStudentState();
    $('#stationFilter, #employementTypeFilter, #statusFilter').change(function () {
        updateEmployeeRecordsHeading();
    });

    $('#stationFilter').change(function () {
        const station = $(this).val();
        resetEmploymentTypeFilter();
        resetStatusFilter();
        if (!station) {
            showEmptyStudentState();
            return;
        }
        $('#employementTypeFilter').prop('disabled', false);
        loadEmploymentType(station);
    });
    //start of employmentfilter change
    $('#employementTypeFilter').change(function () {
        const station = $('#stationFilter').val();
        const employmentType = $(this).val();
        console.log(employmentType)
       // resetStatusFilter();

        if (!station || !employmentType) {
            showEmptyStudentState();
            return;
        }

        // Request available statuses from the backend.
        $.ajax({
            url: '/employees-status',
            method: 'GET',
            data: {
                station: station,
                employmentType: employmentType,
            },
            success: function (statuses) {
                // If no status exists, keep the status dropdown disabled.
                if (!statuses || statuses.length === 0) {
                    $('#statusFilter').append('<option value="" selected disabled>No Status</option>').prop('disabled', true);
                    showEmptyStudentState();
                    return;
                }
                statuses.forEach(function (status) {
                    $('#statusFilter').append(`<option value="${status}">${status}</option>`);
                });
                // Prefer "Not Printed" as the default status.
                if (statuses.includes('Not Printed')) {
                    $('#statusFilter').val('Not Printed');
                } else {
                    $('#statusFilter').val(statuses[0]);
                }
                $('#statusFilter').prop('disabled', false);
                updateEmployeeRecordsHeading();
                loadEmployee(1);
            },

            error: function (xhr) {
                console.error('Failed to load status:',xhr.responseText);
            }
        });
        // Hide the table while the status filter is being loaded.
        showEmptyStudentState();
    });

    $('#statusFilter').change(function () {
        loadEmployee(1);
    });

    $('#clearFilters').click(function () {
        resetFilters();
        $('#studentRecordsHeading').text('');
        showEmptyStudentState();
        $('#stationFilter').val('SDO');
        loadEmployee(1);
    });


    $('#importButtonEmp').click(function () {
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
            url: '/employees/import',
            method: 'POST',
            data: formData,
            // Required when sending FormData.
            processData: false,
            contentType: false,
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            beforeSend: function () {
                showLoading('Uploading Employee Records');
            },
            success: function (response) {
                showImportResult(response);
                resetFilters();
                loadFilters();
                showEmptyStudentState();
                $('#file').val('');
            },
            error: function (xhr) {
                let message ='The employee file could not be imported or uploaded.';

                if (xhr.responseJSON && xhr.responseJSON.message) {
                    message = xhr.responseJSON.message;
                }
                showNotification(message, 'danger');
                $('#file').val('');
            },
            complete: function () {
                hideLoading();
            }
        });
    });

    $('#generateQrButton').click(function () {
        const filters = getEmployeeFilters();
        const selectedEmployees = [];

        $('.employee-checkbox:checked').each(function () {
            selectedEmployees.push($(this).val());
        });

        if (selectedEmployees.length === 0) {
            showNotification('Please select at least one employee.','warning');
            return;
        }

        const params = new URLSearchParams();
        Object.keys(filters).forEach(function (key) {
            if (filters[key]) {
                params.append(key, filters[key]);
            }
        });

        selectedEmployees.forEach(function (employeeId) {
            params.append('employee_id[]', employeeId);
        });

        const printUrl = '/employee/print?' + params.toString();
        const printFrame = document.getElementById('printFrame');
        showLoading('Generating QR Codes');
        $('#printFrame').off('load');


        // Wait until the print page has finished loading.
        $('#printFrame').one('load', function () {

            // Get the exact employee codes from the print page.
            const employeeCodes = $(printFrame.contentDocument).find('.code').map(function () {
                return $(this).text().trim();
            }).get();

            // Store the codes temporarily on the iframe.
            printFrame.dataset.employeeCodes = JSON.stringify(employeeCodes);

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

    // Select/unselect all employees.
    $('#checkAll').on('change', function () {
        $('.employee-checkbox').prop('checked',this.checked);
        updateGenerateCount();
    });

    $(document).on('change','.employee-checkbox',function () {
        updateGenerateCount();
        updateCheckAllState();
    });

    //confirmatttion sa print -> changing status
    $('#confirmPrintButton').click(function () {
        const printFrame = document.getElementById('printFrame');
        const employeeCodes = JSON.parse(printFrame.dataset.employeeCodes || '[]');

        if (!employeeCodes || employeeCodes.length === 0) {
            console.error('No employee codes found.');
            return;
        }

        $.ajax({
            url: '/employees/print-confirmed',
            type: 'POST',
            data: {
                _token:$('meta[name="csrf-token"]').attr('content'),
                codes: employeeCodes
            },
            beforeSend: function () {
                showLoading('Confirming Print');
            },
            success: function (response) {
                console.log(response.message);
                console.log('Updated:',response.updated);
                const modalElement = document.getElementById('printConfirmationModal');
                const printModal = bootstrap.Modal.getInstance(modalElement);

                if (printModal) {
                    printModal.hide();
                }
                showNotification('Printed successfully','success');

                if ($('#statusFilter option[value="Printed"]').length === 0) {
                    $('#statusFilter').append('<option value="Printed">Printed</option>');
                }
                $('#statusFilter').val('Printed');
                loadEmployee(1);
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

function loadFilters() {
    $.ajax({
        url: '/employees-filters',
        method: 'GET',
        success: function (employees) {
            resetFilterDropdowns();
            $('#employementTypeFilter').prop('disabled',true);
            $('#statusFilter').prop('disabled',true);

            employees.station.forEach(function (station) {
                $('#stationFilter').append(`<option value="${station}">${station}</option>`);
            });

            if (employees.station.length === 0) {
                $('#stationFilter').prop('disabled',true);
                $('#employementTypeFilter').prop('disabled',true);
                $('#clearFilters').prop('disabled', true).addClass('disabled');
                showNotificationFilterRequires('No employee records are available. Please import or upload employee records.','warning','noEmployee');
                return;
            }
            $('#stationFilter').val('SDO');
            $('#stationFilter').prop('disabled',false);
            $('#employementTypeFilter').prop('disabled',false);
            $('#clearFilters').prop('disabled', false).removeClass('disabled');
            showNotificationFilterRequires('','','hasEmployees');
            loadEmployee(1);
            $('#stationFilter').trigger('change');
        }
    });
}

function loadEmployee(page = 1) {
    const filters = getEmployeeFilters();

    if (!filters.station) {
        showEmptyStudentState();
        return;
    }

    $('#checkAll').prop('checked', false);
    $('#generateCount').text('');

    $.ajax({
        url: '/employee-list',
        method: 'GET',
        data: {
            page: page,
            ...filters
        },
        beforeSend: function () {
            showLoading('Loading employee records...');
        },
        success: function (response) {
            renderEmployeeTable(response);
            renderPagination(response);
        },
        error: function (xhr) {
            console.error('Failed to load employees:',xhr.responseText);
        },
        complete: function () {
            hideLoading();
        }
    });
}

function getEmployeeFilters() {
    return {
        station: $('#stationFilter').val(),
        employmentType: $('#employementTypeFilter').val(),
        status: $('#statusFilter').val()
    };
}

function renderEmployeeTable(response) {
    const employees = response.data;
    $('#employeesTable').empty();
    if (employees.length === 0) {
        $('#employeesTableContainer').addClass('d-none');
        $('#noEmployeesMessage').removeClass('d-none');
        $('#pagination').empty();
        return;
    }
    $('#employeesTableContainer').removeClass('d-none');
    $('#noEmployeesMessage').addClass('d-none');

    employees.forEach(function (employee) {
        const employeeRow = createEmployeeRow(employee);
        $('#employeesTable').append(employeeRow);
    });
}

function createEmployeeRow(employee) {
    const fullName = `${employee.last_name ?? ''}, ` +`${employee.first_name ?? ''}` + `${employee.middle_initial ? ' ' + employee.middle_initial + '.' : ''}`;
    const statusBadge = employee.status === 'Printed' ? 'bg-success' : 'bg-secondary';
    return `
        <tr>
            <td> <input type="checkbox" class="employee-checkbox" name="employee[]" value="${employee.employee_id}"></td>
            <td>${employee.employee_id ?? ''}</td>
            <td>${fullName}</td>
            <td>${employee.station ?? ''}</td>
            <td>${employee.position ?? ''}</td>
            <td><span class="badge rounded-pill ${statusBadge}">${employee.status ?? ''}</span></td>
        </tr>
    `;
}


function renderPagination(response) {
    $('#pagination').empty();
    if (response.current_page > 1) {
        $('#pagination').append(`<button class="btn btn-sm btn-outline-secondary page-button" data-page="${response.current_page - 1}">Previous</button>`);
    }

    for (let page = 1;page <= response.last_page;page++) {
        $('#pagination').append(`<button class="btn btn-sm ${page === response.current_page ? 'btn-primary' : 'btn-outline-secondary'} px-2 page-button" data-page="${page}">${page}</button>`);
    }

    if (response.current_page < response.last_page) {
        $('#pagination').append(`<button class="btn btn-sm btn-outline-secondary page-button" data-page="${response.current_page + 1}">Next</button>`);
    }
}

function updateGenerateCount() {
    const checked = $('.employee-checkbox:checked').length;
    $('#generateCount').text(checked > 0 ? ` (${checked})`: '');
}

function updateCheckAllState() {
    const total = $('.employee-checkbox').length;
    const totalChecked = $('.employee-checkbox:checked').length;
    $('#checkAll').prop('checked',total > 0 && total === totalChecked);
}

function loadEmploymentType(station) {
    $.ajax({
        url: '/employees-employementType',
        method: 'GET',
        data: {
            station: station
        },
        success: function (employmentTypes) {
            populateEmploymentTypeFilter(
                employmentTypes
            );
            loadEmployee(1);
        },
        error: function (xhr) {
            console.error('Failed to load employment types:',xhr.responseText);
        }
    });
}

function populateEmploymentTypeFilter(employmentTypes) {
    $('#employementTypeFilter').html('<option value="" selected disabled>' +'Employment Type' +'</option>');

    employmentTypes.forEach(function (employmentType) {
        $('#employementTypeFilter').append(`<option value="${employmentType}">${employmentType}</option>`);
    });
}

function resetFilters() {
    $('#stationFilter').val('');
    resetEmploymentTypeFilter();
    resetStatusFilter();
}

function resetStatusFilter() {
    $('#statusFilter').html('<option value="" selected disabled>' +'Status' + '</option>').prop('disabled', true);
}

function resetEmploymentTypeFilter() {
    $('#employementTypeFilter').html('<option value="" selected disabled>' + 'Employment Type' + '</option>').prop('disabled', true);
}

function resetFilterDropdowns() {
    $('#stationFilter').html('<option value="" selected disabled>' + 'Station' + '</option>');
    resetEmploymentTypeFilter();
    resetStatusFilter();
}

function showEmptyStudentState() {
    $('#employeesTableContainer').addClass('d-none');
    $('#pagination').empty();
    $('#recordCount').text('');
    $('#generateCount').text('0');
}


function showLoading(message = 'Loading...') {
    $('.loading-text').text(message);
    $('#loadingOverlay').css('display','flex');
}

function hideLoading() {
    $('#loadingOverlay').hide();
}

function showNotification(message, type) {
    const notification = $('#notification');
    notification.removeClass('d-none alert-success alert-danger alert-warning').addClass('alert-' + type).html(`<i class="bi bi-exclamation-lg text-danger fs-4"></i>${message}`);

    setTimeout(function () {
        notification.addClass('d-none');
    }, 10000);
}

function showNotificationFilterRequires(message = '', type = '', filter = '') {
    const notification = $('#notification');
    if (filter === 'noEmployee') {
        notification.removeClass('d-none alert-success alert-danger alert-warning').addClass('alert-' + type).html(`<i class="bi bi-exclamation-lg text-danger fs-4"></i>${message}`);
    }
    else if (filter === 'hasEmployees') {
        notification.addClass('d-none').removeClass('alert-success alert-danger alert-warning');
    }
}

function showImportResult(response) {
    if (response.imported > 0) {
        $('#importResultModalLabel').text('Records Added Successfully');
        $('#importResultMessage').text('Employee records were saved successfully.');
    }
    else if (response.skipped > 0) {
        $('#importResultModalLabel').text('No New Records Added');
        $('#importResultMessage').text('All employee records are already added.');
    }
    else {
        $('#importResultModalLabel').text('No Employee Records Found');
        $('#importResultMessage').text('No employee records were found.');
    }

    $('#modalImported').text(response.imported);
    $('#modalSkipped').text(response.skipped);
    $('#skippedRowsTable').empty();

    if (response.skippedRows && response.skippedRows.length > 0) {
        $('#skippedRowsContainer').removeClass('d-none');
        $('#skippedRowsCount').text(response.skippedRows.length);

        response.skippedRows.forEach(function (row) {
            $('#skippedRowsTable').append(`
                <tr>
                    <td class="fw-semibold">${row.excel_row}</td>
                    <td><span class="text-danger">${row.reason}</span></td>
                </tr>
            `);
        });
    }
    else {
        $('#skippedRowsContainer').addClass('d-none');
    }

    const modalElement = document.getElementById('importResultModal');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
}

function updateEmployeeRecordsHeading() {
    const station = $('#stationFilter').val();
    const employmentType = $('#employementTypeFilter').val();
    const status = $('#statusFilter').val();
    let heading = '';

    if (station) {
        heading += '<i class="bi bi-chevron-right"></i> ' + station;
    }

    if (employmentType) {
        heading += '<i class="bi bi-chevron-right"></i> ' + employmentType;
    }

    if (status) {
        heading += '<i class="bi bi-chevron-right"></i> ' + status;
    }
    $('#studentRecordsHeading').html(heading);
}
