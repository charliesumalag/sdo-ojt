<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class DashboardOverview extends Controller
{
    public function index () {
        return view('overview.overview');
    }
}
