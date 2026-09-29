<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <link rel="stylesheet" href="{{ asset('css/print.css') }}">
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <title>Student QR Codes</title>
    <style>

    </style>
</head>

<body>
    @foreach($qrData->chunk(8) as $studentChunk)
    <div class="print-page">
        @foreach($studentChunk as $student)
            <div class="qr-card">
                <div class="qr-code-container">
                    {!! $student['qr'] !!}
                </div>
                <div class="codes-container">
                    <div class="code">
                        {{ $student['code'] }}
                    </div>
                </div>
            </div>
        @endforeach
    </div>
@endforeach


</body>
</html>
