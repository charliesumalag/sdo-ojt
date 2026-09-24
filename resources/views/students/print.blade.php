<!DOCTYPE html>
<html>
<head>
    <title>Student QR Codes</title>
    <link rel="stylesheet" href="{{ asset('css/styles.css') }}">
    @php use SimpleSoftwareIO\QrCode\Facades\QrCode; @endphp
    <style>
        @page {
            size: 8.5in 11in;
            margin: 0;
        }

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            width: 100%;
            align-items: center;
            justify-content: center;
        }

        .btn-container{
            width: 100%;
            text-align: center; 
            display: flex;
            align-items: center;
            justify-content: center;
        
        }
        .print-button {
            margin-top: 24px;
            padding: 10px 20px;
            background-color: #0d6efd;
            color: #fff;
            border: 1px solid #0d6efd;
            border-radius: 6px;
            cursor: pointer;
        }

    
        .print-page {
            margin: 0 auto;
            width: 8.5in;
            height: 11in;
            padding: 0.4in;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            grid-template-rows: repeat(4, 1fr);
            gap: 10px;
            page-break-after: always;
            break-after: page;
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
            background-image: url('/images/qr-background.png');
            background-size: 100% 100%;
            background-position: center;
            background-repeat: no-repeat;
            position: relative;
        }
        .qr-code-container{
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
            .print-button {
                display: none;
            }

            .print-page {
                page-break-after: always;
                break-after: page;
            }

            .print-page:last-child {
                page-break-after: auto;
                break-after: auto;
            }

            * {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
        }
        .loading-overlay {
    position: fixed;
    inset: 0;
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 99999;
}

.loading-box {
    text-align: center;
}

.spinner {
    width: 40px;
    height: 40px;

    border: 4px solid #dee2e6;
    border-top: 4px solid #0d6efd;

    border-radius: 50%;

    animation: spin 0.8s linear infinite;

    margin: 0 auto;
}

.loading-text {
    margin-top: 15px;
    font-size: 18px;
    font-weight: 600;
}

.loading-subtext {
    margin-top: 5px;
    font-size: 14px;
    color: #6c757d;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}
    </style>
</head>

<body>
    <div id="loadingOverlay" class="loading-overlay">
        <div class="loading-box">
            <div class="spinner"></div>
            <div class="loading-text">Generating QR codes...</div>
            <div class="loading-subtext">Please wait while the QR codes are being prepared.</div>
        </div>
    </div>
    <div>
        <div class="btn-container">
            <button class="print-button" onclick="window.print()">Print QR Codes</button>
        </div>
        @foreach($students->chunk(8) as $studentChunk)
            <div class="print-page">
                @foreach($studentChunk as $student)
                <div class="qr-card">
                    <div class="qr-code-container">
                        {!! QrCode::size(150)->margin(1)->generate(route('students.show', $student->code))!!}
                    </div>
                    <div class="code">{{ $student->code }}</div>
                </div>
                @endforeach
            </div>
        @endforeach
    </div>
    <script>
        document.querySelectorAll('.qr-code-container svg').forEach(function (svg) {
            svg.setAttribute('preserveAspectRatio', 'none');
        });
    </script>
    <script>

        document.querySelectorAll('.qr-code-container svg').forEach(function (svg) {
            svg.setAttribute('preserveAspectRatio', 'none');
        });

        // QR page has finished loading
        window.addEventListener('load', function () {

            document.getElementById('loadingOverlay').style.display = 'none';

        });

    </script>
</body>
</html>