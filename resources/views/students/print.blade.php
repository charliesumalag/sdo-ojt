<!DOCTYPE html>
<html>
<head>
    <title>Student QR Codes</title>

    <style>
        @page {
            size: A4;
            margin: 10mm;
        }

        body {
            font-family: Arial, sans-serif;
        }

        .qr-container {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
        }

        .qr-card {
            border: 1px solid #000;
            padding: 10px;
            text-align: center;
            page-break-inside: avoid;
        }

        .qr-card svg {
            width: 150px;
            height: 150px;
        }

        .name {
            font-weight: bold;
            margin-top: 5px;
        }

        .code {
            font-size: 12px;
        }

        .print-button {
            margin-bottom: 20px;
        }

        @media print {
            .print-button {
                display: none;
            }
        }
    </style>
</head>

<body>

<button class="print-button" onclick="window.print()">
    Print QR Codes
</button>

<div class="qr-container">

    @foreach ($students as $student)

        <div class="qr-card">

            {!! QrCode::size(150)
                ->margin(1)
                ->generate(route('students.show', $student->code)) !!}

            <div class="name">
                {{ $student->last_name }},
                {{ $student->first_name }}
                {{ $student->middle_initial }}
            </div>

            <div class="code">
                Code: {{ $student->code }}
            </div>

        </div>

    @endforeach

</div>

</body>
</html>
