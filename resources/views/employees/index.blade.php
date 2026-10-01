@extends('layouts.app')

@section('content')
<div id="loadingOverlay" class="loading-overlay">
    <div class="loading-box">
        <div class="spinner"></div>
        <div class="loading-text">Loading...</div>
        <div class="loading-subtext">Please wait...</div>
    </div>
</div>
<div class="p-4">
    <div class="d-flex justify-content-between align-items-center  border-bottom pb-2">
        <div>
            <div class="d-flex align-items-center gap-2 ">
                <h1 class="fs-3 fw-semibold text-dark mb-0 p-0 m-0">Employees Records</h1>
                <span id="studentRecordsHeading"></span>
            </div>
            <p class="small text-secondary">View and import new employee records.</p>
        </div>
        <div class="d-flex gap-2">
            <form id="importForm" enctype="multipart/form-data">
                <input type="file" name="file" id="file" accept=".xlsx,.xls,.csv" hidden>
                <button type="button" class="btn btn-primary   px-4 " id="importButtonEmp">Import Excel File</button>
            </form>
        </div>
    </div>
    <div id="notification" class="alert d-none fs-6" role="alert"></div>
    <!-- Filters-->


    <div class="filter-container">
        <div class="filter-group">
            <div class="filter-item">
                <select id="stationFilter" class="filter-select"></select>
            </div>
            <div class="filter-item">
                <select id="positionFilter" class="filter-select"></select>
            </div>
            <div class="filter-item">
                <select id="statusFilter" class="filter-select" disabled>
                    <option value="Not Printed">Not Printed</option>
                    <option value="Printed">Printed</option>
                </select>
            </div>
        </div>
        <button type="button" id="clearFilters" class="clear-filter-btn">
            <i class="bi bi-x-lg clear-icon"></i>
            <span>Clear</span>
        </button>

    </div>


 
    <div class="border p-4 rounded mt-4" id="employeesTableContainer">
        <div class="d-flex border-bottom justify-content-between align-items-center pb-3">
            <div class="d-flex align-items-center gap-2 ">
                <h2  class="fs-6 fw-semibold mb-0">Employees List</h2>
                <span id="recordCount" class="badge rounded-pill text-primary bg-primary-subtle"></span>
            </div>
            <div class="d-flex gap-2">
                <button type="button" id="generateQrButton" class="btn btn-primary">Generate QR<span id="generateCount"></span></button>
            </div>
        </div>

        <div class="table-responsive rounded ">
            <table class="table-hover mb-0 table table-striped text-secondary">
                <thead class="table-light">
                    <tr>
                        <th>All<br><input class="checkbox-all" id="checkAll" type="checkbox" name="" value=""> </input></th>
                        <th class="">Employee ID</th>
                        <th class="">Student Name</th>
                        <th class="">Station</th>
                        <th class="">Position</th>
                        <th class="">Status</th>
                    </tr>
                </thead>
                <tbody id="employeesTable">
                    
                </tbody>
            </table>
        </div>
        <div id="pagination" class="d-flex gap-1 justify-content-end mt-3"></div>
    </div>
    <div id="noEmployeesMessage" class="text-center text-secondary py-4 d-none">No records found.</div>
</div>

{{-- partial import modal --}}
@include('partials.imported-modal')
@include('partials.print-confirmation')
<div id="printArea"></div>
<iframe id="printFrame"></iframe>
@include('partials.print-confirmation')
<script src="{{ asset('js/employees.js') }}"></script>
@endsection
