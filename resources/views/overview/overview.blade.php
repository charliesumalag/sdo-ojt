
@extends('layouts.app')

@section('content')
<div class="container-fluid py-3">
    <div class="d-flex justify-content-between align-items-start border-bottom pb-3 mb-3">
        <div>
            <div class="d-flex align-items-center gap-2">
                <h2 class="fw-bold mb-0">Dashboard Overview</h2>
            </div>
            <p class="text-secondary mb-0 mt-1">Monitor employee and student records, QR issuance, and ID printing.</p>
        </div>
    </div>

    <div class="dashboard-filter-bar border rounded bg-white p-2 mb-3">
        <div class="d-flex justify-content-between align-items-center">
            <div class="d-flex gap-2">
                <button class="btn btn-light border dropdown-toggle">All stations</button>
                <button class="btn btn-light border dropdown-toggle">Employees &amp; Students</button>
            </div>
            <span class="small text-secondary"> 03 Oct 2026
            </span>
        </div>
    </div>
    <div class="row g-3 mb-3">
        <div class="col-12 col-md-6 col-xl-3">
            <div class="dashboard-card h-100">
                <div class="d-flex justify-content-between align-items-start">
                    <span class="fw-semibold">Employees</span>
                    <i class="bi bi-people text-primary fs-5"></i>
                </div>
                <div class="dashboard-number">1,280</div>
                <div class="text-secondary small">1,180 QR codes generated</div>
            </div>
        </div>

        <div class="col-12 col-md-6 col-xl-3">
            <div class="dashboard-card h-100">
                <div class="d-flex justify-content-between align-items-start">
                    <span class="fw-semibold">sStudents</span>
                    <i class="bi bi-mortarboard text-primary fs-5"></i>
                </div>
                <div class="dashboard-number">1,420</div>
                <div class="text-secondary small">16,940 QR codes generated</div>
            </div>
        </div>

        <div class="col-12 col-md-6 col-xl-3">
            <div class="dashboard-card h-100">
                <div class="d-flex justify-content-between align-items-start">
                    <span class="fw-semibold">Not Printed</span>
                    <i class="bi bi-qr-code text-primary fs-5"></i>
                </div>
                <div class="dashboard-number">18,120</div>
                <div class="text-secondary small">1,580 QR not printed</div>
            </div>
        </div>

        <div class="col-12 col-md-6 col-xl-3">
            <div class="dashboard-card h-100">
                <div class="d-flex justify-content-between align-items-start">
                    <span class="fw-semibold">IDs printed</span>
                    <i class="bi bi-printer text-primary fs-5"></i>
                </div>
                <div class="dashboard-number">16,460</div>
                <div class="text-secondary small">1,660 QR ready to print</div>
            </div>
        </div>
    </div>

    <div class="row g-3 mb-3">

        <!-- Employee Summary -->
        <div class="col-12 col-lg-6">

            <div class="dashboard-panel h-100">

                <!-- Header -->
                <div class="dashboard-panel-header">

                    <div class="d-flex align-items-center gap-2 fw-semibold">
                        <i class="bi bi-people"></i>
                        <span>Employees summary</span>
                    </div>

                    {{-- <a href="#" class="text-primary text-decoration-none small">
                        View records
                        <i class="bi bi-arrow-right"></i>
                    </a> --}}

                </div>


                <!-- Body -->
                <div class="p-3">

                    <div class="d-flex justify-content-between mb-3">

                        <span>
                            1,280 total records
                        </span>

                        <span class="small text-secondary">
                            Sample data
                        </span>

                    </div>


                    <div class="d-flex justify-content-between mb-1">

                        <span class="small text-secondary">
                            IDs printed
                        </span>

                        <strong class="small">
                            1,060 / 1,280 (82.8%)
                        </strong>

                    </div>


                    <div class="progress dashboard-progress">

                        <div
                            class="progress-bar dashboard-progress-bar"
                            role="progressbar"
                            style="width: 82.8%;"
                            aria-valuenow="82.8"
                            aria-valuemin="0"
                            aria-valuemax="100">
                        </div>

                    </div>

                </div>

            </div>

        </div>


        <!-- Student Summary -->
        <div class="col-12 col-lg-6">

            <div class="dashboard-panel h-100">

                <!-- Header -->
                <div class="dashboard-panel-header">

                    <div class="d-flex align-items-center gap-2 fw-semibold">
                        <i class="bi bi-mortarboard"></i>
                        <span>Students summary</span>
                    </div>

                    {{-- <a href="#" class="text-primary text-decoration-none small">
                        View records
                        <i class="bi bi-arrow-right"></i>
                    </a> --}}

                </div>


                <!-- Body -->
                <div class="p-3">

                    <div class="d-flex justify-content-between mb-3">

                        <span>
                            18,420 total records
                        </span>

                        <span class="small text-secondary">
                            Sample data
                        </span>

                    </div>


                    <div class="d-flex justify-content-between mb-1">

                        <span class="small text-secondary">
                            IDs printed
                        </span>

                        <strong class="small">
                            15,400 / 18,420 (83.6%)
                        </strong>

                    </div>


                    <div class="progress dashboard-progress">

                        <div
                            class="progress-bar dashboard-progress-bar"
                            role="progressbar"
                            style="width: 83.6%;"
                            aria-valuenow="83.6"
                            aria-valuemin="0"
                            aria-valuemax="100">
                        </div>

                    </div>

                </div>

            </div>

        </div>

    </div>


    <!-- =========================
         RECENT RECORD ACTIVITY
    ========================== -->
    <div class="dashboard-panel">

        <!-- Header -->
        <div class="dashboard-panel-header">

            <span class="fw-semibold">
                Recent record activity
            </span>

            <span class="small text-secondary">
                Sample activity • Today
            </span>

        </div>


        <!-- Table -->
        <div class="table-responsive">

            <table class="table dashboard-table mb-0">

                <thead>
                    <tr>
                        <th>Record / batch</th>
                        <th>Population</th>
                        <th>Activity</th>
                        <th>Status</th>
                        <th>Time</th>
                    </tr>
                </thead>

                <tbody>

                    <!-- Activity 1 -->
                    <tr>

                        <td>
                            <div>Employee batch import</div>

                            <small class="text-secondary">
                                SDO • 12 records
                            </small>
                        </td>

                        <td>
                            Employees
                        </td>

                        <td>
                            Excel imported
                        </td>

                        <td>
                            <span class="status-badge status-awaiting">
                                Awaiting QR
                            </span>
                        </td>

                        <td>
                            10:42 AM
                        </td>

                    </tr>


                    <!-- Activity 2 -->
                    <tr>

                        <td>
                            <div>Student QR batch</div>

                            <small class="text-secondary">
                                Marikina High School • 48 records
                            </small>
                        </td>

                        <td>
                            Students
                        </td>

                        <td>
                            QR generated
                        </td>

                        <td>
                            <span class="status-badge status-ready">
                                Ready to print
                            </span>
                        </td>

                        <td>
                            10:30 AM
                        </td>

                    </tr>


                    <!-- Activity 3 -->
                    <tr>

                        <td>
                            <div>Employee ID batch</div>

                            <small class="text-secondary">
                                SDO • 8 records
                            </small>
                        </td>

                        <td>
                            Employees
                        </td>

                        <td>
                            IDs printed
                        </td>

                        <td>
                            <span class="status-badge status-printed">
                                Printed
                            </span>
                        </td>

                        <td>
                            10:18 AM
                        </td>

                    </tr>


                    <!-- Activity 4 -->
                    <tr>

                        <td>
                            <div>Student record update</div>

                            <small class="text-secondary">
                                Marikina Elementary School • 1 record
                            </small>
                        </td>

                        <td>
                            Students
                        </td>

                        <td>
                            Record updated
                        </td>

                        <td>
                            <span class="status-badge status-not-printed">
                                Not printed
                            </span>
                        </td>

                        <td>
                            09:56 AM
                        </td>

                    </tr>


                    <!-- Activity 5 -->
                    <tr>

                        <td>
                            <div>Student ID batch</div>

                            <small class="text-secondary">
                                Marikina High School • 32 records
                            </small>
                        </td>

                        <td>
                            Students
                        </td>

                        <td>
                            IDs printed
                        </td>

                        <td>
                            <span class="status-badge status-printed">
                                Printed
                            </span>
                        </td>

                        <td>
                            09:40 AM
                        </td>

                    </tr>

                </tbody>

            </table>

        </div>


        <!-- Footer -->
        <div class="dashboard-table-footer">
            Showing 5 sample activities. No live records are displayed.
        </div>

    </div>

</div>
@endsection
