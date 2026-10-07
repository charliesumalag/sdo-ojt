<header class="sidebar-header d-flex gap-2 align-items-center">

    <div>
        <img
            src="/images/sdo-logo.png"
            alt="SDO Marikina"
            width="40"
            height="40"
            class="flex-shrink-0"
        >
    </div>

    <div class="sidebar-brand">

        <h1 class="fs-5 fw-bold text-dark">
            SDO Marikina
        </h1>

        <p class="text-secondary">
            QR Identification System
        </p>

    </div>

</header>


<nav class="sidebar-nav d-flex flex-column gap-2">

    <a
        href="{{ route('employees') }}"
        class="nav-link-custom
        {{ request()->routeIs('employees')
            ? 'primary-bg-color text-white'
            : 'bg-white text-dark' }}"
    >

        <i class="bi bi-people-fill"></i>

        <span>
            Employees
        </span>

    </a>


    <a
        href="{{ route('students') }}"
        class="nav-link-custom
        {{ request()->routeIs('students')
            ? 'primary-bg-color text-white'
            : 'bg-white text-dark' }}"
    >

        <i class="bi bi-mortarboard-fill"></i>

        <span>
            Students
        </span>

    </a>

</nav>
