@extends('layouts.app')

@section('content')

<!-- Loading Overlay -->
<div id="loadingOverlay" class="loading-overlay">
    <div class="loading-box">
        <div class="spinner"></div>
        <div class="loading-text">Loading...</div>
        <div class="loading-subtext">Please wait...</div>
    </div>
</div>


<div class="container-fluid px-3 px-md-4 py-3 py-md-4">

    <!-- PAGE HEADER -->
    <div class="page-header border-bottom pb-3">

        <div class="page-header-content">

            <div class="d-flex align-items-center gap-2 flex-wrap">

                <h1 class="fs-3 fw-semibold text-dark mb-0">
                    Student Records
                </h1>

                <span
                    id="studentRecordsHeading"
                    class="text-secondary">
                </span>

            </div>

            <p class="small text-secondary mb-0 mt-1">
                View students and import new student records.
            </p>

        </div>


        <!-- IMPORT BUTTON -->
        <div class="page-header-action">

            <form id="importForm" enctype="multipart/form-data">

                <input
                    type="file"
                    name="file"
                    id="file"
                    accept=".xlsx,.xls,.csv"
                    hidden
                >

                <button
                    type="button"
                    class="btn btn-primary px-4"
                    id="importButton">

                    Import Excel File

                </button>

            </form>

        </div>

    </div>


    <!-- NOTIFICATION -->
    <div
        id="notification"
        class="alert d-flex align-items-center w-100 d-none fs-6 mt-3"
        role="alert">
    </div>


    <!-- FILTERS -->
    <div class="filter-container">

        <div class="filter-group">

            <!-- SCHOOL -->
            <div class="filter-item">

                <select
                    id="schoolFilter"
                    class="filter-select">

                </select>

            </div>


            <!-- GRADE -->
            <div class="filter-item">

                <select
                    id="gradeFilter"
                    class="filter-select">

                </select>

            </div>


            <!-- SECTION -->
            <div class="filter-item">

                <select
                    id="sectionFilter"
                    class="filter-select">

                </select>

            </div>


            <!-- STATUS -->
            <div class="filter-item">

                <select
                    id="statusFilter"
                    class="filter-select"
                    disabled>

                    <option value="Not Printed">
                        Not Printed
                    </option>

                    <option value="Printed">
                        Printed
                    </option>

                </select>

            </div>

        </div>


        <!-- CLEAR -->
        <button
            type="button"
            id="clearFilters"
            class="clear-filter-btn">

            <i class="bi bi-x-lg clear-icon"></i>

            <span>
                Clear
            </span>

        </button>

    </div>


    <!-- STUDENT RECORDS -->
    <div
        class="student-table-container border rounded mt-3 mt-md-4 bg-white"
        id="studentTableContainer">


        <!-- TABLE HEADER -->
        <div class="student-table-header border-bottom">

            <div class="d-flex align-items-center gap-2">

                <h2 class="fs-6 fw-semibold mb-0">
                    Student List
                </h2>

                <span
                    id="recordCount"
                    class="badge rounded-pill text-primary bg-primary-subtle">
                </span>

            </div>


            <button
                type="button"
                id="generateQrButton"
                class="btn btn-primary">

                Generate QR

                <span id="generateCount"></span>

            </button>

        </div>


        <!-- STUDENT TABLE -->
        <div class="table-responsive">

            <table class="table table-hover table-striped text-secondary mb-0">

                <thead class="table-light">

                    <tr>

                        <th class="checkbox-column">

                            <div class="d-flex flex-column align-items-center">

                                <span>
                                    All
                                </span>

                                <input
                                    class="checkbox-all"
                                    id="checkAll"
                                    type="checkbox">

                            </div>

                        </th>


                        <th>
                            Learner Ref Number
                            <br>
                            (LRN)
                        </th>


                        <th>
                            Student Name
                        </th>


                        <th>
                            Grade & Sec
                        </th>


                        <th>
                            Gender
                        </th>


                        <th>
                            Status
                        </th>

                    </tr>

                </thead>


                <tbody id="studentTable">

                    <!-- AJAX inserts students here -->

                </tbody>

            </table>

        </div>


        <!-- PAGINATION -->
        <div
            id="pagination"
            class="d-flex flex-wrap gap-1 justify-content-center justify-content-md-end p-3">
        </div>

    </div>


    <!-- EMPTY STATE -->
    <div
        id="noStudentsMessage"
        class="text-center text-secondary py-4 d-none">
    </div>

</div>


<!-- MODALS -->
@include('partials.imported-modal')
@include('partials.print-confirmation')


<!-- PRINT -->
<div id="printArea"></div>

<iframe id="printFrame"></iframe>


<script src="{{ asset('js/students.js') }}"></script>

@endsection
