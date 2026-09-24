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
            <h1 class="fs-3 fw-semibold text-dark">Student Records</h1>
            <p class="small text-secondary">View students and import new student records.</p>
        </div>
        <div class="d-flex gap-2">
            <div class="input-group" style="width: 280px;">
                <input type="text" id="search" class="form-control text-gray-300" placeholder="Search student records...">
            </div>
            <form id="importForm" enctype="multipart/form-data">
                <input type="file" name="file" id="file" hidden>
                <button type="button" class="btn btn-outline-secondary px-4 " id="importButton">Import Excel File</button>
            </form>
        </div>

    </div>
    <div id="notification" class="alert d-none" role="alert"></div>
    <!-- Filters -->
    <div class="bg-white border rounded mt-4 p-3">
        <div class="row">
            {{-- station dropdown --}}
            <div class="col-md-2">
                <label for="schoolFilter" class="form-label">School</label>
                <select id="schoolFilter" class="form-select">
                    <option value=""></option>
                </select>
            </div>
            {{-- year level --}}
            <div class="col-md-2">
                <label for="gradeFilter" class="form-label">Grade Level</label>
                <select id="gradeFilter" class="form-select">
                    <option value="">All</option>
                    <option value="7">Grade 7</option>
                    <option value="8">Grade 8</option>
                    <option value="9">Grade 9</option>
                    <option value="10">Grade 10</option>
                    <option value="11">Grade 11</option>
                    <option value="12">Grade 12</option>
                </select>
            </div>
            {{-- section --}}
            <div class="col-md-2">
                <label for="sectionFilter" class="form-label">Section</label>
                <select id="sectionFilter" class="form-select">
                    <option value="">All Section</option>
                </select>
            </div>
            {{-- gender --}}
            <div class="col-md-2">
                <label for="genderFilter" class="form-label">Gender</label>
                <select id="genderFilter" class="form-select">
                    <option value="">All</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                </select>
            </div>
            {{-- school year --}}
           <div class="col-md-2">
                <label for="schoolYearFilter" class="form-label">School Year</label>
                <select id="schoolYearFilter" class="form-select">
                    <option value="">All</option>
                </select>
            </div>
           <div class="col-md-2 d-flex align-items-end">
                <button type="button" id="clearFilters" class="btn btn-outline-secondary w-100">
                    <i class="bi bi-x-lg me-1"></i>Clear</button>
            </div>
        </div>
    </div>

    <!-- Student Records -->
    <div class="bg-white border rounded mt-4 p-4" id="studentTableContainer">
        <div class="d-flex justify-content-between align-items-center mb-3">
            <div class="d-flex align-items-center gap-2">
                <h2 class="fs-5 fw-semibold mb-0">Student List</h2>
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
        <div  class="table-responsive border rounded">
            <table class="table table-hover mb-0">
                <thead class="table-light">
                    <tr>
                        <th class="small">Learner Ref Number<br>(LRN)</th>
                        <th class="small">Student Name</th>
                        <th class="small">School</th>
                        <th class="small">Grade & Sec</th>
                        <th class="small">Gender</th>
                        <th class="small">School Year</th>
                    </tr>
                </thead>
                <tbody id="studentTable">
                    <!-- AJAX inserts students na dito -->
                </tbody>
            </table>
        </div>

        <div id="pagination" class="d-flex gap-1 justify-content-end mt-3"></div>
    </div>
    <div id="noStudentsMessage" class="text-center text-secondary py-5 d-none">No records found.</div>
</div>


{{-- partial import modal --}}
@include('partials.imported-modal')
<script src="{{asset('js/students.js') }}"></script>
@endsection
