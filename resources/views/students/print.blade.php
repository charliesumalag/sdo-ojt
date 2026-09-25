<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">

    <title>Student QR Codes</title>

    <style>
        @page {
            size: 8.5in 11in;
            margin: 0;
        }

        * {
            box-sizing: border-box;
        }

        html,
        body {
            margin: 0;
            padding: 0;
            width: 8.5in;
        }

        body {
            font-family: Arial, sans-serif;
        }

        .print-page {
            width: 8.5in;
            height: 11in;

            padding: 0.4in;

            margin: 0 auto;

            display: grid;

            grid-template-columns: repeat(2, 1fr);
            grid-template-rows: repeat(4, 1fr);

            gap: 10px;

            page-break-after: always;
            break-after: page;
        }

        .print-page:last-child {
            page-break-after: auto;
            break-after: auto;
        }

        .qr-card {
            border: 1px solid #000;

            padding: 10px;

            display: flex;
            flex-direction: column;

            align-items: center;
            justify-content: center;

            text-align: center;

            page-break-inside: avoid;
            break-inside: avoid;

            background-image: url('/images/qr-background.png');

            background-size: 100% 100%;
            background-position: center;
            background-repeat: no-repeat;

            position: relative;
        }

        .qr-code-container {
            width: 50px;
            height: 43px;

            border-radius: 4px;

            padding: 2px;

            background: white;

            position: absolute;

            bottom: 17px;
            left: 10px;
        }

        .qr-card svg {
            width: 100%;
            height: 100%;

            display: block;
        }

        .code {
            font-size: 10px;

            font-weight: bold;

            margin-top: 5px;

            position: absolute;

            bottom: 25px;
            left: 65px;
        }

        @media print {

            * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }

            html,
            body {
                margin: 0;
                padding: 0;
            }

            .print-page {
                page-break-after: always;
                break-after: page;
            }

            .print-page:last-child {
                page-break-after: auto;
                break-after: auto;
            }
        }
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

                    <div class="code">
                        {{ $student['code'] }}
                    </div>

                </div>

            @endforeach

        </div>

    @endforeach

</body>
</html>