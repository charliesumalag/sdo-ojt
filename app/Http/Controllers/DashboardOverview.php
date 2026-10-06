<?php

namespace App\Http\Controllers;
use App\Models\Employees;
use App\Models\Students;

use Illuminate\Http\Request;
use PhpParser\Builder\Function_;
use PhpParser\Node\Expr\FuncCall;

class DashboardOverview extends Controller
{
    public function index () {
        return view('overview.overview');
    }

    public function getEmpCount () {
        $employeeCount = Employees::count();

        return $employeeCount;
    }
    public function getStudentCount() {
        $studentCount = Students::count();
        return $studentCount;
    }
}
