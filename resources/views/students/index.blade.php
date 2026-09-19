@extends('layouts.app')

@section('content')

<div class="p-4">
    <div class="d-flex justify-content-between align-items-center border-bottom pb-3">
        <div>
            <h1 class="fs-3 fw-semibold text-dark">Student Records</h1>
            <p class="small text-secondary">Search and audit the division master list with active school board filters.</p>
        </div>
        <div class="input-group" style="width: 240px;">
            <i class="bi bi-search"></i>
            <input type="text" class="form-control" placeholder="Search ...">
        </div>
    </div>

    <div class="bg-white border rounded mt-4 p-3">
        <div class="row g-3">
            <div class="col-md-3">
                <label class="form-label fw-semibold small">School Unit</label>
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
                <label class="form-label fw-semibold small">
                    Section
                </label>

                <select class="form-select">
                    <option>Section A</option>
                </select>
            </div>

            <div class="col-md-3">
                <label class="form-label fw-semibold small">Record Status</label>
                <select class="form-select">
                    <option>Active</option>
                </select>
            </div>
        </div>

        <div class="d-flex align-items-center flex-wrap gap-2 mt-3">
            <span class="small fw-semibold text-secondary">ACTIVE FILTERS:</span>
            <span class="badge rounded-pill text-primary border border-primary bg-white">School: Rizal High ×</span>
            <span class="badge rounded-pill text-primary border border-primary bg-white">Year: Grade 10 ×</span>
            <span class="badge rounded-pill text-primary border border-primary bg-white">Section</span>
            <span class="badge rounded-pill text-primary border border-primary bg-white">Status: Active ×</span>
            <button class="btn btn-link text-danger text-decoration-none p-0 small">Clear All</button>
        </div>
    </div>

    <div class="bg-white border rounded mt-4 p-4">
        <div class="d-flex justify-content-between align-items-center mb-3">
            <div class="d-flex align-items-center gap-2">
                <h2 class="fs-5 fw-semibold mb-0">Filtered Class Records</h2>
                <span class="badge rounded-pill text-primary bg-primary-subtle">5 Records Match</span>
            </div>
            <div class="d-flex gap-2">
                <button class="btn btn-outline-secondary">Import File</button>
                <button class="btn btn-primary">Generate QR Labels (5)</button>
            </div>
        </div>

        <div class="table-responsive border rounded">
            <table class="table table-hover mb-0">
                <thead class="table-light">
                    <tr>
                        <th class="small">Learner Ref Number<br>(LRN)</th>
                        <th class="small">Full Student Name</th>
                        <th class="small">School / Campus</th>
                        <th class="small">Grade & Sec</th>
                        <th class="small">Status</th>
                        <th class="small">Actions</th>
                    </tr>
                </thead>

                <tbody>
                    <tr>
                        <td>LRN-102948</td>
                        <td class="fw-semibold">Santos, Maria Clara L.</td>
                        <td>Rizal High School</td>
                        <td>Grade 10 -<br>Section A</td>
                        <td><span class="badge text-success bg-success-subtle px-4">Active</span></td>
                        <td>
                            <a href="#" class="text-primary text-decoration-none">Edit</a>
                            <span class="text-secondary mx-2">|</span>
                            <a href="#" class="text-primary text-decoration-none">QR Label</a>
                        </td>
                    </tr>

                    <tr>
                        <td>LRN-104829</td>
                        <td class="fw-semibold">Cruz, Juan Dela A.</td>
                        <td>Rizal High School</td>
                        <td>Grade 10 -<br>Section A</td>
                        <td><span class="badge text-success bg-success-subtle px-4">Active</span></td>
                        <td>
                            <a href="#" class="text-primary text-decoration-none">Edit</a>
                            <span class="text-secondary mx-2">|</span>
                            <a href="#" class="text-primary text-decoration-none">QR Label</a>
                        </td>
                    </tr>  
                </tbody>
            </table>
        </div>
    </div>
</div>

@endsection