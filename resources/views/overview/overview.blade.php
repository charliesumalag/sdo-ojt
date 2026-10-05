@extends('layouts.app')

@section('content')
<div class="p-4">
    <div class="d-flex justify-content-between align-items-center  border-bottom pb-2">
        <div>
            <div class="d-flex align-items-center gap-2 ">
                <h1 class="fs-3 fw-semibold text-dark mb-0 p-0 m-0">Dashboard Overview</h1>
                <span id="studentRecordsHeading" class="text-secondary"></span>
            </div>
            <p class="small text-secondary">Monitor employee and student records, QR issuance, and ID printing.</p>
        </div>
    </div>
    <div id="notification" class="alert d-flex align-items-center  w-100 d-none fs-6" role="alert"></div>
    <!-- Filters -->
    <div class="filter-container">
        <div class="filter-group">
            <div class="filter-item">
                <select id="station" class="filter-select">
                    <option value="">All Station</option>
                </select>
            </div>
        </div>


    </div>
    <div class="card-main-container">
        <div class="card-container">
            <div class="header-container">
                <h4 class="header-text">Employees</h4>
                <i class="bi bi-people"></i>
            </div>
            <h3 class="totalEmp">1,280</h3>
            <p class="card-footer">1,180 Employees</p>
        </div>
         <div class="card-container">
            <div class="header-container">
                <div>
                    <h4>Employees</h4>
                    <i class="bi bi-people"></i>
                </div>
            </div>
            <h3 class="totalEmp">1,280</h3>
            <p class="card-footer">1,180 Employees</p>
        </div>
         <div class="card-container">
            <div class="header-container">
                <div>
                    <h4>Employees</h4>
                    <i class="bi bi-people"></i>
                </div>
            </div>
            <h3 class="totalEmp">1,280</h3>
            <p class="card-footer">1,180 Employees</p>
        </div>
         <div class="card-container">
            <div class="header-container">
                <div>
                    <h4>Employees</h4>
                    <i class="bi bi-people"></i>
                </div>
            </div>
            <h3 class="totalEmp">1,280</h3>
            <p class="card-footer">1,180 Employees</p>
        </div>
    </div>


    <!-- Student Records -->
    <div class="border p-4 rounded mt-4" id="studentTableContainer">
        <div class="d-flex border-bottom justify-content-between align-items-center pb-3">
            <div class="d-flex align-items-center gap-2 ">
                <h2  class="fs-6 fw-semibold mb-0">Student List</h2>
                <span id="recordCount" class="badge rounded-pill text-primary bg-primary-subtle"></span>
            </div>
            <div class="d-flex gap-2">
                <button type="button" id="generateQrButton" class="btn btn-primary">Generate QR <span id="generateCount"></span></button>
            </div>
        </div>
        <!-- Student Table -->
        <div class="table-responsive rounded ">
            <table class="table-hover mb-0 table table-striped text-secondary">
                <thead class="table-light">
                    <tr>
                        <th>All<br><input class="checkbox-all" id="checkAll" type="checkbox" name="" value=""> </input></th>
                        <th class="">Learner Ref Number<br>(LRN)</th>
                        <th class="">Student Name</th>
                        <th class="">Grade & Sec</th>
                        <th class="">Gender</th>
                        <th class="">Status</th>
                    </tr>
                </thead>
                <tbody id="studentTable">
                    <!-- AJAX inserts students na dito -->
                </tbody>
            </table>
        </div>
        <div id="pagination" class="d-flex gap-1 justify-content-end mt-3"></div>
    </div>
    <div id="noStudentsMessage" class="text-center text-secondary py-4 d-none"></div>
</div>
@endsection
