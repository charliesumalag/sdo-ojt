@extends('layouts.app')

@section('content')

<div class="p-4">
    <div class="d-flex flex-column  border-bottom pb-2">
        <h1 class="fs-3 fw-semibold text-dark">Student Records</h1>
        <p class="small text-secondary">View students and import new student records.</p>
    </div>

    <!-- Filters -->
    <div class="bg-white border rounded mt-4 p-3">
        <div class="row">
            <div class="col-md-3">
                <label class="form-label fw-semibold small">School</label>
                <select class="form-select">
                    <option>Rizal High School</option>
                </select>
            </div>
            <div class="col-md-3">
                <label class="form-label fw-semibold small">Year Level</label>
                <select class="form-select">
                    <option>Grade 10</option>
                </select>
            </div>
            <div class="col-md-3">
                <label class="form-label fw-semibold small">Section</label>
                <select class="form-select">
                    <option>Section A</option>
                </select>
            </div>
            <div class="col-md-3">
                <label class="form-label fw-semibold small">Status</label>
                <select class="form-select">
                    <option>Not Printed</option>
                    <option>Printed</option>
                </select>
            </div>
        </div>
    </div>


    <!-- Student Records -->
    <div class="bg-white border rounded mt-4 p-4">
        <div class="d-flex justify-content-between align-items-center mb-3">
            <div class="d-flex align-items-center gap-2">
                <h2 class="fs-5 fw-semibold mb-0">Filtered Class Records</h2>
                <span
                    id="recordCount"
                    class="badge rounded-pill text-primary bg-primary-subtle">
                </span>
            </div>
            <div class="d-flex gap-2">
                <form
                    id="importForm"
                    enctype="multipart/form-data">
                    <input
                        type="file"
                        name="file"
                        id="file"
                        hidden
                        accept=".xlsx,.xls,.csv">

                    <button
                        type="button"
                        class="btn btn-outline-secondary"
                        id="importButton">
                        Import
                    </button>
                </form>


                <!-- Generate QR -->
                <button class="btn btn-primary">

                    Generate QR
                    (<span id="generateCount"></span>)

                </button>

            </div>

        </div>


        <!-- Student Table -->
        <div class="table-responsive border rounded">

            <table class="table table-hover mb-0">

                <thead class="table-light">

                    <tr>

                        <th class="small">
                            Learner Ref Number
                            <br>
                            (LRN)
                        </th>

                        <th class="small">
                            Student Name
                        </th>

                        <th class="small">
                            School
                        </th>

                        <th class="small">
                            Grade & Sec
                        </th>

                        <th class="small">
                            Status
                        </th>

                        <th class="small">
                            Actions
                        </th>

                    </tr>

                </thead>


                <tbody id="studentTable">
                    <!-- AJAX inserts students here -->
                </tbody>

            </table>

        </div>

    </div>

</div>


<!-- =============================== -->
<!-- IMPORT RESULT MODAL -->
<!-- =============================== -->

<div
    class="modal fade"
    id="importResultModal"
    tabindex="-1"
    aria-labelledby="importResultModalLabel"
    aria-hidden="true">

    <div class="modal-dialog modal-dialog-centered">

        <div class="modal-content border-0 shadow">

            <div class="modal-header">

                <div>

                    <h5
                        class="modal-title fw-semibold"
                        id="importResultModalLabel">

                        Import Completed

                    </h5>

                    <p
                        class="text-secondary small mb-0"
                        id="importResultMessage">

                        Your student records have been processed.

                    </p>

                </div>


                <button
                    type="button"
                    class="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close">
                </button>

            </div>


            <div class="modal-body">

                <!-- Summary -->

                <div class="row g-3 mb-4">

                    <!-- Imported -->

                    <div class="col-6">

                        <div class="border rounded p-3 bg-success-subtle">

                            <div class="small text-secondary">
                                Imported
                            </div>

                            <div
                                class="fs-3 fw-semibold text-success"
                                id="modalImported">

                                0

                            </div>

                            <div class="small text-secondary">
                                students
                            </div>

                        </div>

                    </div>


                    <!-- Skipped -->

                    <div class="col-6">

                        <div class="border rounded p-3 bg-warning-subtle">

                            <div class="small text-secondary">
                                Skipped
                            </div>

                            <div
                                class="fs-3 fw-semibold text-warning"
                                id="modalSkipped">

                                0

                            </div>

                            <div class="small text-secondary">
                                rows
                            </div>

                        </div>

                    </div>

                </div>


                <!-- Skipped Rows -->

                <div
                    id="skippedRowsContainer"
                    class="d-none">

                    <div class="d-flex justify-content-between align-items-center mb-2">

                        <h6 class="fw-semibold mb-0">
                            Skipped Rows
                        </h6>

                        <span
                            class="badge rounded-pill text-warning bg-warning-subtle"
                            id="skippedRowsCount">

                            0

                        </span>

                    </div>


                    <div
                        class="table-responsive border rounded"
                        style="max-height: 220px; overflow-y: auto;">

                        <table class="table table-sm table-hover mb-0">

                            <thead class="table-light">

                                <tr>

                                    <th>
                                        Excel Row
                                    </th>

                                    <th>
                                        Reason
                                    </th>

                                </tr>

                            </thead>


                            <tbody id="skippedRowsTable">
                            </tbody>

                        </table>

                    </div>

                </div>

            </div>


            <div class="modal-footer">

                <button
                    type="button"
                    class="btn btn-primary"
                    data-bs-dismiss="modal">

                    Done

                </button>

            </div>

        </div>

    </div>

</div>


<script>

$(document).ready(function () {

    // Load students when page opens
    loadStudents();


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


        console.log('Selected file:', file.name);


        const formData = new FormData();

        formData.append('file', file);


        // Send file to Laravel
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

                console.log(
                    'Import successful:',
                    response
                );


                // Show result
                showImportResult(response);


                // Reload students
                loadStudents();


                // Reset input
                $('#file').val('');

            },


            error: function (xhr) {

                console.error(
                    'Import error:',
                    xhr
                );

                console.error(
                    'Response:',
                    xhr.responseText
                );


                if (xhr.status === 422) {

                    alert(
                        'Please select a valid Excel or CSV file.'
                    );

                } else if (xhr.status === 419) {

                    alert(
                        'Session expired. Please refresh the page and try again.'
                    );

                } else {

                    alert(
                        'Import failed. Check storage/logs/laravel.log'
                    );

                }

            }

        });

    });

});


/**
 * Load students from Laravel
 */
function loadStudents() {

    $.ajax({

        url: '/studentslist',

        method: 'GET',


        success: function (students) {

            console.log(
                'Students from database:',
                students
            );


            $('#studentTable').empty();


            $('#recordCount').text(
                students.length + ' Records Match'
            );


            $('#generateCount').text(
                students.length
            );


            students.forEach(function (student) {

                $('#studentTable').append(`

                    <tr>

                        <td>
                            ${student.lrn ?? ''}
                        </td>


                        <td class="fw-semibold">

                            ${student.last_name ?? ''},
                            ${student.first_name ?? ''}

                            ${
                                student.middle_initial
                                    ? ' ' + student.middle_initial + '.'
                                    : ''
                            }

                        </td>


                        <td>
                            Rizal High School
                        </td>


                        <td>

                            ${student.grade_level ?? ''}
                            -
                            ${student.section ?? ''}

                        </td>


                        <td>

                            <span
                                class="badge text-success bg-success-subtle px-4">

                                ${student.status ?? 'Active'}

                            </span>

                        </td>


                        <td>

                            <a
                                href="/students/${student.student_id}"
                                class="text-primary text-decoration-none">

                                Edit

                            </a>

                        </td>

                    </tr>

                `);

            });

        },


        error: function (xhr) {

            console.error(
                'Failed to load students:',
                xhr.responseText
            );

        }

    });

}


/**
 * Show import result modal
 */
function showImportResult(response) {

    // Update summary
    $('#modalImported').text(response.imported);
    $('#modalSkipped').text(response.skipped);
    $('#importResultMessage').text(response.message);

    // Clear previous skipped rows
    $('#skippedRowsTable').empty();

    // Check if there are skipped rows
    if (response.skipped_rows && response.skipped_rows.length > 0) {

        $('#skippedRowsContainer').removeClass('d-none');

        $('#skippedRowsCount').text(response.skipped_rows.length);

        response.skipped_rows.forEach(function(row) {

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
    const modalElement = document.getElementById('importResultModal');

    const modal = new bootstrap.Modal(modalElement);

    modal.show();
}


</script>

@endsection
