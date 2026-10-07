<!DOCTYPE html>
<html lang="en">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <meta
        name="csrf-token"
        content="{{ csrf_token() }}"
    >

    <!-- Bootstrap Icons -->
    <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
    >

    <!-- Bootstrap -->
    <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css"
    >

    <!-- Google Font -->
    <link
        rel="preconnect"
        href="https://fonts.googleapis.com"
    >

    <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossorigin
    >

    <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
    >

    <!-- Main CSS -->
    <link
        rel="stylesheet"
        href="{{ asset('css/styles.css') }}"
    >

    <!-- Overview CSS -->
    <link
        rel="stylesheet"
        href="{{ asset('css/overview.css') }}"
    >

    <!-- jQuery -->
    <script
        src="https://code.jquery.com/jquery-3.7.1.min.js">
    </script>

    <title>SDO Marikina QR Identification System</title>

</head>


<body>

    <div class="app-layout">

        <!-- SIDEBAR -->
        <aside
            class="app-sidebar border-end px-3 py-4 d-flex flex-column gap-4"
        >

            @include('partials.sidebar')

        </aside>


        <!-- MAIN CONTENT -->
        <main class="app-main flex-grow-1">

            @yield('content')

        </main>

    </div>


    <!-- Bootstrap JS -->
    <script
        src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js">
    </script>

</body>

</html>
