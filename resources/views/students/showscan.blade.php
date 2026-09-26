<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Student QR</title>
</head>

<body>

    <h1>QR Scanned...</h1>

    <div id="studentDetails">

        <p><strong>LRN:</strong> {{ $student->lrn }}</p>

        <p>
            <strong>Name:</strong>
            {{ $student->first_name }}
            {{ $student->middle_initial }}.
            {{ $student->last_name }}
        </p>

        <p><strong>Gender:</strong> {{ $student->gender }}</p>

        <p><strong>School:</strong> {{ $student->school }}</p>

        <p><strong>Parent:</strong> {{ $student->parents_name }}</p>

        <p><strong>Grade:</strong> {{ $student->grade_level }}</p>

        <p><strong>Section:</strong> {{ $student->section }}</p>

        <p><strong>School Year:</strong> {{ $student->school_year }}</p>

    </div>

</body>

</html>