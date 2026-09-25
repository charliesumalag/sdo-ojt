@extends('layouts.app')

@section('content')

<div id="loadingOverlay" class="loading-overlay">
    <div class="loading-box">
        <div class="spinner"></div>
        <div class="loading-text">Loading...</div>
        <div class="loading-subtext">Please wait</div>
    </div>
</div>
<div class="p-4">
    <div class="d-flex justify-content-between align-items-center  border-bottom pb-2">
        <div>
            <div class="d-flex align-items-center gap-2 ">
                <h1 class="fs-3 fw-semibold text-dark mb-0 p-0 m-0">Student Records</h1>
                <span id="studentRecordsHeading"></span>
            </div>
            <p class="small text-secondary">View students and import new student records.</p>
        </div>
        <div class="d-flex gap-2">
            <form id="importForm" enctype="multipart/form-data">
                <input type="file" name="file" id="file" accept=".xlsx,.xls" hidden>
                <button type="button" class="btn btn-outline-secondary px-4 " id="importButton">Import Excel File</button>
            </form>
        </div>

    </div>
    <div id="notification" class="alert d-none" role="alert"></div>
    <!-- Filters -->
    <div class="bg-white border rounded mt-4 p-3">
        <div class="row">
            {{-- station dropdown --}}
            <div class="col-md-2 position-relative">
                <select id="schoolFilter" class="form-select">    
                </select>
            </div>
            {{-- year level --}}
            <div class="col-md-2">  
                <select id="gradeFilter" class="form-select">
                </select>
            </div>
            {{-- section --}}
            <div class="col-md-2">
                <select id="sectionFilter" class="form-select">
                </select>
            </div>
           <div class="col-md-2 d-flex align-items-end">
                <button type="button" id="clearFilters" class="btn btn-outline-secondary w-100">
                    <i class="bi bi-x-lg me-1"></i>Clear</button>
            </div>
        </div>
    </div>

    <!-- Student Records -->
    <div class="border p-4 rounded mt-4" id="studentTableContainer">
        <div class="d-flex border-bottom justify-content-between align-items-center pb-3">
            <div class="d-flex align-items-center gap-2 ">
                <h2  class="fs-5 fw-semibold mb-0">Student List</h2>
                <span
                    id="recordCount"
                    class="badge rounded-pill text-primary bg-primary-subtle">
                </span>
            </div>
            <div class="d-flex gap-2">

                <button type="button" id="generateQrButton" class="btn btn-primary">Generate QR(<span id="generateCount"></span>)</button>
            </div>
        </div>

        <!-- Student Table -->
        <div class="table-responsive rounded">
            <table class="table-hover mb-0 table table-striped">
                <thead class="table-light">
                    <tr>
                        <th class="small">Learner Ref Number<br>(LRN)</th>
                        <th class="small">Student Name</th>
                        <th class="small">School</th>
                        <th class="small">Grade & Sec</th>
                        <th class="small">Gender</th>
                    </tr>
                </thead>
                <tbody id="studentTable">
                    <!-- AJAX inserts students na dito -->
                </tbody>
            </table>
        </div>

        <div id="pagination" class="d-flex gap-1 justify-content-end mt-3"></div>
    </div>
    <div id="noStudentsMessage" class="text-center text-secondary py-4 d-none">No records found.</div>
</div>


{{-- partial import modal --}}
@include('partials.imported-modal')
<div id="printArea"></div>
<iframe id="printFrame"></iframe>
<script src="{{asset('js/students.js') }}"></script>
@endsection
