<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Employees;

class EmployeesController extends Controller
{
    //
     public function index () {

        return view('employees.index');
    }

    //empoyee filters
    public function employeesFilters()
    {
        return response()->json([
            'station' => Employees::whereNotNull('station')
                ->where('station', '!=', '')
                ->distinct()
                ->orderBy('station')
                ->pluck('station'),
        ]);
    }

    //employeesPosition
    public function employeesPosition(Request $request)
    {
        dd($request->station);
        $positions = Employees::where('station', $request->station)
            ->select('position')
            ->distinct()
            ->orderBy('position')
            ->pluck('position');
        return response()->json($positions);
    }

}
