@extends('layouts.app')

@section('content')

<div class="p-4">
    <div class="d-flex flex-column  border-bottom pb-2">
        <h1 class="fs-3 fw-semibold text-dark">Student Records</h1>
        <p class="small text-secondary">View students and import new student records.</p>
    </div>
    <div id="notification" class="alert d-none" role="alert"></div>
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
                <form id="importForm" enctype="multipart/form-data">
                    <input type="file" name="file" id="file" hidden ">
                    <button type="button" class="btn btn-outline-secondary" id="importButton">Import</button>
                </form>
                <button class="btn btn-primary">Generate QR(<span id="generateCount"></span>)</button>
            </div>
        </div>

        <!-- Student Table -->
        <div class="table-responsive border rounded">
            <table class="table table-hover mb-0">
                <thead class="table-light">
                    <tr>
                        <th class="small">Learner Ref Number<br>(LRN)</th>
                        <th class="small">Student Name</th>
                        <th class="small">School</th>
                        <th class="small">Grade & Sec</th>
                        <th class="small">Status</th>
                        <th class="small">Actions</th>
                    </tr>
                </thead>
                <tbody id="studentTable">
                    <!-- AJAX inserts students na dito -->
                </tbody>
            </table>
        </div>
    </div>
</div>


{{-- partial import modal --}}
@include('partials.imported-modal')
<script src="{{asset('js/students.js') }}"></script>
@endsection
