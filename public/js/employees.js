$(document).ready(function() {

    $('#stationFilter, #employementTypeFilter, #statusFilter').change(function () {
        updateEmployeeRecordsHeading();
    });


    loadFilters();
    showEmptyStudentState();
   

    $('#clearFilters').click(function () {
        resetFilters();
        $('#studentRecordsHeading').text('');
        showEmptyStudentState();
        $('#stationFilter').val('SDO');
        loadEmployee(1);
    });

    $('#importButtonEmp').click(function() {
        console.log('import clicked')
        $('#file').click();
    })

    $('#file').change(function(){
        const file = this.files[0];
        console.log(file);


        if(!file)return;
        //pur the file into the container which is a formdata.
        const formData = new FormData();
        formData.append('file', file);


        //send the file inot backend
        $.ajax({
            url:'/employees/import',
            method: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            beforeSend: function () {
                showLoading('Uploading Employee Records');
            },
            success: function(response){
                showImportResult(response);
                resetFilters();
                loadFilters();
                showEmptyStudentState();
                $('#file').val('');
            },error: function(xhr){
                let message = 'The employee file could not be imported.';

                if (xhr.responseJSON && xhr.responseJSON.message) {
                    message = xhr.responseJSON.message;
                }

                showNotification(message, 'danger');

                $('#file').val('');
            },
            complete: function (){
                hideLoading();
            }
        })
    })


    $('#stationFilter').change(function () {
        const station = $(this).val();
        // Reset status dropdown
        $('#statusFilter').html('<option value="" selected disabled>Status</option>').prop('disabled', true);
         $('#employementTypeFilter').html('<option value="" selected disabled>EmploymentType</option>').prop('disabled', true);

        //this is for table display conditional continue later
        if(!station){
            showEmptyStudentState();
            return;
        }

        //endable next dropdown which is the position
        $('#employementTypeFilter').prop('disabled', false);

        //request dropdown data for position
        $.ajax({
            url: '/employees-employementType',
            method: 'GET',
            data: {
                station: station,
            },
            success: function (employmentType){
                console.log(employmentType);

                employmentType.forEach(function (empType) {
                    $('#employementTypeFilter').append(`<option value="${empType}">${empType}</option>`)
                })
                loadEmployee(1);
           },
            error: function (xhr) {
                console.error('Failed to load position:',xhr.responseText);
            }
        });
        showEmptyStudentState();
    })

    $('#employementTypeFilter').change(function () {
        const station = $('#stationFilter').val();
        const employmentType = $(this).val();

        $('#statusFilter').html('<option value="" selected disabled>Status</option>').prop('disabled', true);

        if(!station || !employmentType){
            showEmptyStudentState();
            return;
        }

        $.ajax({
            url: '/employees-status',
            method: 'GET',
            data: {
                station: station,
                employmentType: employmentType
            },
            success: function(statuses){
                if (!statuses || statuses.length === 0) {
                    $('#statusFilter').append('<option value="" selected disabled>No Status</option>').prop('disabled', true);
                    showEmptyStudentState();
                    return;
                }

                statuses.forEach(function (status) {
                    $('#statusFilter').append(`<option value="${status}">${status}</option>`);
                });
                if (statuses.includes('Not Printed')) {
                    $('#statusFilter').val('Not Printed');
                } else {
                    // Otherwise select the first status
                    $('#statusFilter').val(statuses[0]);
                }
                // Enable status filter
                $('#statusFilter').prop('disabled', false);
                updateEmployeeRecordsHeading();
                loadEmployee(1);
            },
            error: function (xhr) {
                console.log('Failed to load status', xhr.responseText);
            }
        });
        showEmptyStudentState();
    })

    $('#statusFilter').change(function () {
        //updateStudentRecordsHeading();
        loadEmployee(1);
    });

    $('#generateQrButton').click(function () {
        const filters = {
            station: $('#stationFilter').val(),
            position: $('#positionFilter').val(),
            status: $('#statusFilter').val()
        };

        let selectedEmployee = [];
        $('.employee-checkbox:checked').each(function() {
            selectedEmployee.push($(this).val());
        })

        if (selectedEmployee.length === 0) {
            showNotification('Please select at least one employee.', 'warning');
            return;
        }

        const params = new URLSearchParams();

        Object.keys(filters).forEach(function (key) {
            if (filters[key]) {
                params.append(key, filters[key]);
            }
        });
        selectedEmployee.forEach(function (employee_id) {
            params.append('employee_id[]', employee_id);
        });

        const printUrl = '/employee/print?' + params.toString();
        const printFrame = document.getElementById('printFrame');
        showLoading('Generating QR Codes');
        $('#printFrame').off('load');

        $('#printFrame').one('load', function () {
            // Get the exact student codes from the loaded print page
            const employeeCodes = $(printFrame.contentDocument).find('.code').map(function () {
                return $(this).text().trim();
            }).get();
            // Store the codes on the iframe element
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

    $('#checkAll').on('change', function () {
        $('.employee-checkbox').prop('checked', this.checked);
        const checked = $('.employee-checkbox:checked').length;

        $('#generateCount').text(
            checked > 0 ? ` (${checked})` : ''
        );
    });

    $(document).on('change', '.employee-checkbox', function () {
        const total = $('.employee-checkbox').length;
        const totalChecked = $('.employee-checkbox:checked').length;

        $('#generateCount').text(
            totalChecked > 0 ? ` (${totalChecked})` : ''
        );

        $('#checkAll').prop(
            'checked',
            total > 0 && total === totalChecked
        );

    });



    $('#confirmPrintButton').click(function () {
        const printFrame = document.getElementById('printFrame');
        // Get the exact student codes from the QR print page
        const employeeCodes =JSON.parse(printFrame.dataset.employeeCodes || '[]');
        console.log('Students being marked as Printed:', employeeCodes);
        if (!employeeCodes || employeeCodes.length === 0) {
            console.error('No student codes found.');
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
                console.log(response.message);
                console.log('Updated:', response.updated);
                const modalElement = document.getElementById('printConfirmationModal');
                const printModal = bootstrap.Modal.getInstance(modalElement);
                if (printModal) {
                    printModal.hide();
                }
                showNotification('Printed successfully', 'success');
                if ($('#statusFilter option[value="Printed"]').length === 0) {
                    $('#statusFilter').append('<option value="Printed">Printed</option>');
                }
                // Select Printed
                $('#statusFilter').val('Printed');
                // Reload student list
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
})
//end of document . ready

function loadFilters() {
    $.ajax({
        url: '/employees-filters',
        method: 'GET',
        success: function(employees){
            
            //dropdown Select disable option
            $('#stationFilter').html('<option value="" selected disabled>Station</option>');
            $('#employementTypeFilter').html('<option value="" selected disabled>Employment Type</option>');
            $('#statusFilter').html('<option value="" selected disabled>Status</option>');


            //disabled other dropdown when station is not selected.
            $('#positionFilter').prop('disabled', true);
            $('#statusFilter').prop('disabled', true);

            
            //get now the available school on database

            employees.station.forEach(function (station){
                $('#stationFilter').append(`<option value="${station}">${station}</option>`)
            })

            if(employees.station.length === 0){
                $('#stationFilter').prop('disabled', true);
                $('#employementTypeFilter').prop('disabled', true);
                console.log('no import data yet');
                showNotificationFilterRequires('No employee records are available. Please import or upload employee records.','warning','noEmployee');
            }else{
                $('#stationFilter').val('SDO');
                $('#stationFilter').prop('disabled', false);
                $('#employementTypeFilter').prop('disabled', false);
                showNotificationFilterRequires('','','hasEmployees');
                loadEmployee(1);
                $('#stationFilter').trigger('change');
            }


           

           
        },
    })



}

function loadEmployee(page = 1){
    
     const station = $('#stationFilter').val();
    const position = $('#positionFilter').val();
    const status = $('#statusFilter').val();

    if(!station){
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
            station: station,
            position: position,
            status: status,
        },
        beforeSend: function () {
            showLoading('Loading employee records...');
        },
        success: function(response){

            console.log(response.data);
            $('#employeesTable').empty();
            if(response.data.length === 0){
                $('#employeesTableContainer').addClass('d-none');
                //$('#noEmployeesMessage').addClass('d-none').text('No records found.');
                $('#pagination').empty();
            }else{
                $('#employeesTableContainer').removeClass('d-none');
                $('#noEmployeesMessage').addClass('d-none');

                response.data.forEach(function (employee){
                    const fullName = `${employee.last_name ?? ''},${employee.first_name ?? ''} ${employee.middle_initial ? ' ' + employee.middle_initial + '.' : ''}`;
                    const statusBadge = employee.status === 'Printed' ? 'bg-success' : 'bg-secondary';
                    const row = `
                        <tr>
                            <td><input type="checkbox" class="employee-checkbox" name="employee[]" value="${employee.employee_id}"></td>
                            <td>${employee.employee_id ?? ''}</td>
                            <td>${fullName}</td>
                            <td>${employee.station ?? ''}</td>
                            <td>${employee.position ?? ''}</td>
                            <td><span class="badge rounded-pill ${statusBadge}">${employee.status}</span></td>
                        </tr>
                    `;
                    $('#employeesTable').append(row);
                })
            }
            if(response.total === 0){
                $('#pagination').empty();
            }else{
                renderPagination(response);
            }
        },
        error: function(xhr){
                console.error('failed to load employees', xhr.responseText);
        },
        complete: function () {
            hideLoading();
        }
    })

}
function resetFilters(){
    $('#stationFilter').val('');
    $('#positionFilter').val('').prop('disabled', true);
    $('#statusFilter').val('').prop('disabled', true);
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
    $('#employeesTableContainer').addClass('d-none');

    // Show empty message
    //$('#noEmployeesMessage').removeClass('d-none').text('No records found');

    // Clear pagination
    $('#pagination').empty();

    // Reset counts
    $('#recordCount').text('');

    $('#generateCount').text('0');
}

function renderPagination(response) {
    $('#pagination').empty();
    if (response.current_page > 1) {
        $('#pagination').append(`
            <button
                class="btn btn-sm btn-outline-secondary page-button"
                data-page="${response.current_page - 1}">
                Previous
            </button>
        `);
    }

    for (let page = 1;page <= response.last_page;page++) {
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

    if (response.current_page < response.last_page) {
        $('#pagination').append(`
            <button
                class="btn btn-sm btn-outline-secondary page-button"
                data-page="${response.current_page + 1}">
                Next
            </button>
        `);
    }
}

function showNotification(message, type) {
    const notification = $('#notification');
    notification.removeClass('d-none alert-success alert-danger alert-warning').addClass('alert-' + type).html(`<i class="bi bi-exclamation-lg text-danger fs-4"></i>${message}`);

    setTimeout(function () {
        notification.addClass('d-none');
    }, 10000);
}



function showImportResult(response) {
    if (response.imported > 0) {
        $('#importResultModalLabel').text('Records Added Successfully');
        $('#importResultMessage').text('Employee records were saved successfully.');
    } else if (response.skipped > 0) {
        $('#importResultModalLabel').text('No New Records Added');
        $('#importResultMessage').text('All employee records are already added.');
    } else {
        $('#importResultModalLabel').text('No Employee Records Found');
        $('#importResultMessage').text('No employee records were found.');
    }
    // Imported count
    $('#modalImported').text(response.imported);
    // Skipped count
    $('#modalSkipped').text(response.skipped);

    // Clear skipped rows
    $('#skippedRowsTable').empty();
    if (response.skippedRows && response.skippedRows.length > 0)  {
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
    } else {
        $('#skippedRowsContainer').addClass('d-none');
    }

    // Show modal
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
        heading += '<i class="bi bi-chevron-right"></i> ' + station;}
    if (employmentType) {
        heading += '<i class="bi bi-chevron-right"></i> ' + employmentType;}
    if (status) {
        heading += '<i class="bi bi-chevron-right"></i> ' + status;
    }

    $('#studentRecordsHeading').html(heading);
}
function showNotificationFilterRequires(message= '', type = '', filter = '') {
    const notification = $('#notification');
    if(filter === 'noEmployee'){
        notification.removeClass('d-none alert-success alert-danger alert-warning').addClass('alert-' + type).html(`<i class="bi bi-exclamation-lg text-danger fs-4"></i>${message}`);
    }else if (filter === 'hasEmployees'){
        notification.addClass('d-none alert-success alert-danger alert-warning').addClass('alert-' + type).text(message);
    }
}

