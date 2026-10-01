<header class="d-flex gap-2 align-items-center">
    <div class=" ">
        <img src="/images/sdo-logo.png" alt="" width="40" height="40" class="flex-shrink-0">
    </div>
    <div class="">
        <h1 class="fs-5 fw-bold text-dark">SDO Marikina</h1>
        <p class="small-12 text-secondary">QR Identification System</p>
    </div>
</header>

<nav class="d-flex flex-column gap-2">

    <a
        href="{{ route('employees') }}"
        class="w-100 nav-link-custom d-flex align-items-center gap-2 text-decoration-none
        {{ request()->routeIs('employees') ? 'primary-bg-color text-white' : 'bg-white text-dark' }}"
    >
        <i class="bi bi-people-fill"></i>
        <span>Employees</span>
    </a>

    <a
        href="{{ route('students') }}"
        class="w-100 nav-link-custom d-flex align-items-center gap-2 text-decoration-none
        {{ request()->routeIs('students') ? 'primary-bg-color text-white' : 'bg-white text-dark' }}"
    >
        <i class="bi bi-mortarboard-fill"></i>
        <span>Students</span>
    </a>



</nav>




