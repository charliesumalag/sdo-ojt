const selectedEmployeeIds = new Set();

$(document).ready(function () {
    loadFilters();
    showEmptyStudentState();
    $('#stationFilter, #employementTypeFilter, #statusFilter').change(function () {
        updateEmployeeRecordsHeading();
    });


    //station change drop down.
    $('#stationFilter').change(function () {
        const station = $(this).val();
        resetEmploymentTypeFilter();
        resetStatusFilter();
        selectedEmployeeIds.clear()
        updateEmployeeRecordsHeading();

        if (!station) {
            showEmptyStudentState();
            return;
        }

        $('#employementTypeFilter').prop('disabled', false);

        //display employyees depende sa stion na naselect
        loadEmployee(1);

        // load employment type.
        loadEmploymentType(station);
    });

    //change employment dropdoww.
    $('#employementTypeFilter').change(function () {
        const station = $('#stationFilter').val();
        const employmentType = $(this).val();

        // Employment type changed, so reset the old status
        resetStatusFilter();

        if (!station || !employmentType) {
            showEmptyStudentState();
            return;
        }

        // Hide old employee records while loading statuses.
        showEmptyStudentState();

        $.ajax({
            url: '/employees-status',
            method: 'GET',
            data: {
                station: station,
                employmentType: employmentType
            },
            success: function (statuses) {
                // Clear status dropdown again before adding new values.
                resetStatusFilter();

                if (!statuses || statuses.length === 0) {
                    $('#statusFilter').html('<option value="" selected disabled>No Status</option>').prop('disabled', true);
                    updateEmployeeRecordsHeading();
                    return;
                }
                statuses.forEach(function (status) {
                    $('#statusFilter').append($('<option>', {value: status,text: status}));
                });

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
                resetStatusFilter();
                showEmptyStudentState();
            }
        });
    });

    //status filter/dropdown change
    $('#statusFilter').change(function () {
        loadEmployee(1);
    });

    //clear filter button
    $('#clearFilters').click(function () {
        resetFilters();
        $('#studentRecordsHeading').text('');
        showEmptyStudentState();
        $('#stationFilter').val('SDO');
        loadEmployee(1);
    });

    //import file part.
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
            // Required for sending form data
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



    //pagination click button
    $(document).on('click', '.page-button', function () {
        const page = $(this).data('page');

        if (!page) {
            return;
        }
        loadEmployee(page);
    });

    //generate qr button
    $('#generateQrButton').click(function () {
        const filters = getEmployeeFilters();
        const selectedEmployees = Array.from(selectedEmployeeIds);

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

        $('#printFrame').one('load', function () {
            const employeeCodes = $(printFrame.contentDocument).find('.code').map(function () {
                return $(this).text().trim();
            }).get();
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

    // Select/unselect all employees. all list not per page but all list on all pages.
   $('#checkAll').on('change', function () {
        const checked = this.checked;

        if (!checked) {
            selectedEmployeeIds.clear();
            updateCheckboxes();
            updateGenerateCount();
            return;
        }

        const filters = getEmployeeFilters();

        $.ajax({
            url: '/employee-ids',
            method: 'GET',
            data: filters,
            success: function (response) {
                selectedEmployeeIds.clear();
                response.ids.forEach(function (id) {
                    selectedEmployeeIds.add(String(id));
                });
                updateCheckboxes();
                updateGenerateCount();
            },
            error: function (xhr) {
                console.error('Failed to select all employees:', xhr.responseText);
            }
        });
    });

    //eeach checkbox change
    $(document).on('change', '.employee-checkbox', function () {
        const employeeId = String($(this).val());

        if (this.checked) {
            selectedEmployeeIds.add(employeeId);
        } else {
            selectedEmployeeIds.delete(employeeId);
        }
        updateGenerateCount();
        updateCheckAllState();
    });

    //confirmation print button modal
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
                _token: $('meta[name="csrf-token"]').attr('content'),
                codes: employeeCodes
            },
            beforeSend: function () {
                showLoading('Confirming Print');
            },
            success: function (response) {
                const modalElement = document.getElementById('printConfirmationModal');
                const printModal = bootstrap.Modal.getInstance(modalElement);

                if (printModal) {
                    printModal.hide();
                }
                showNotification('Printed successfully','success');
                selectedEmployeeIds.clear();
                $('#checkAll').prop('checked', false);
                updateGenerateCount();

                if ($('#statusFilter option[value="Printed"]').length === 0) {
                    $('#statusFilter').append('<option value="Printed">Printed</option>');
                }
                $('#statusFilter').val('Printed');
                updateEmployeeRecordsHeading();
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
            if (employees.station.length === 0) {
                $('#stationFilter').prop('disabled', true);
                $('#employementTypeFilter').prop('disabled', true);
                $('#statusFilter').prop('disabled', true);
                $('#clearFilters').prop('disabled', true).addClass('disabled');
                showNotificationFilterRequires('No employee records are available. Please import or upload employee records.','warning','noEmployee');
                return;
            }
            employees.station.forEach(function (station) {
                $('#stationFilter').append($('<option>', {value: station,text: station}));
            });

            $('#stationFilter').prop('disabled', false).val('SDO');
            $('#employementTypeFilter').prop('disabled', false);
            $('#clearFilters').prop('disabled', false).removeClass('disabled');
            showNotificationFilterRequires('','','hasEmployees');
            $('#stationFilter').trigger('change');
        },
        error: function (xhr) {
            console.error('Failed to load employee filters:',xhr.responseText);
        }
    });
}

function loadEmployee(page = 1, showLoader = true) {
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
            if (showLoader) {
                showLoading('Loading employee records...');
            }
        },
        success: function (response) {
            renderEmployeeTable(response);
            renderPagination(response);
            updateCheckboxes();
            updateGenerateCount();
        },
        error: function (xhr) {
            console.error('Failed to load employees:',xhr.responseText
            );
        },
        complete: function () {
            if (showLoader) {
                hideLoading();
            }
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
    const count = selectedEmployeeIds.size;

    $('#generateCount').text(
        count > 0 ? ` (${count})` : ''
    );
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
            populateEmploymentTypeFilter(employmentTypes);
            $('#employementTypeFilter').prop('disabled', false);
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

    $('#importResultDoneButton').off('click').one('click', function () {
        modal.hide();
        resetFilters();
        showEmptyStudentState();
        loadFilters();
    });
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
function updateCheckboxes() {
    $('.employee-checkbox').each(function () {
        const employeeId = String($(this).val());
        $(this).prop('checked',selectedEmployeeIds.has(employeeId)
        );
    });
    updateCheckAllState();
}
