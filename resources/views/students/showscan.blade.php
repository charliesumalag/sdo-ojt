<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Student Information</title>

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
</head>

<body class="bg-light">

    <div class="container-fluid px-3 px-sm-4 py-4 py-sm-5">

        <div class="row justify-content-center">

            <div class="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">

                <div class="card shadow-sm border-0">

                    <!-- Header -->
                    <div class="card-header text-white text-center py-4"
                        style="background-color: #2980B9;">

                        <h4 class="mb-1">Student Information</h4>

                    </div>

                    <!-- Student Information -->
                    <div class="card-body p-3 p-sm-4">

                        <!-- LRN -->
                        <div class="mb-3">
                            <div class="small text-secondary">
                                Learner Reference Number
                            </div>

                            <div class="fw-semibold text-break">
                                {{ $student->lrn }}
                            </div>
                        </div>

                        <!-- Student Name -->
                        <div class="mb-3">
                            <div class="small text-secondary">
                                Student Name
                            </div>

                            <div class="fw-semibold">
                                {{ $student->first_name }}
                                {{ $student->middle_initial }}.
                                {{ $student->last_name }}
                            </div>
                        </div>

                        <hr>

                        <!-- Student Details -->
                        <div class="row">

                            <!-- School -->
                            <div class="col-12 col-sm-6 mb-3">
                                <div class="small text-secondary">
                                    School
                                </div>

                                <div class="fw-semibold text-break">
                                    {{ $student->school }}
                                </div>
                            </div>

                            <!-- Grade Level -->
                            <div class="col-12 col-sm-6 mb-3">
                                <div class="small text-secondary">
                                    Grade Level
                                </div>

                                <div class="fw-semibold">
                                    {{ $student->grade_level }}
                                </div>
                            </div>

                            <!-- Section -->
                            <div class="col-12 col-sm-6 mb-3">
                                <div class="small text-secondary">
                                    Section
                                </div>

                                <div class="fw-semibold text-break">
                                    {{ $student->section }}
                                </div>
                            </div>

                            <!-- Gender -->
                            <div class="col-12 col-sm-6 mb-3">
                                <div class="small text-secondary">
                                    Gender
                                </div>

                                <div class="fw-semibold">
                                    {{ $student->gender }}
                                </div>
                            </div>

                            <!-- Parent / Guardian -->
                            <div class="col-12 mb-0">
                                <div class="small text-secondary">
                                    Parent / Guardian
                                </div>

                                <div class="fw-semibold text-break">
                                    {{ $student->parents_name }}
                                </div>
                            </div>

                        </div>

                    </div>

                    <!-- Footer -->
                    <div class="card-footer bg-white text-center text-secondary py-3">
                        <small>Student QR Information</small>
                    </div>

                </div>

            </div>

        </div>

    </div>

</body>

</html>
