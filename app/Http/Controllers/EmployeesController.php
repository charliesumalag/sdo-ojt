<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Employees;
use App\Imports\EmployeesImport;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Maatwebsite\Excel\Facades\Excel;

class EmployeesController extends Controller
{
    //
    public function index()
    {
        return view('employees.index');
    }

    public function employeeList(Request $request)
    {
        $query = Employees::query();
        if ($request->station) {
            $query->where('station', $request->station);
        }
        if ($request->position) {
            $query->where('position', $request->position);
        }
        if ($request->status) {
            $query->where('status', $request->status);
        }

        $employees = $query->orderBy('last_name')->paginate(25);

        return response()->json($employees);
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
    public function employeesEmployementType(Request $request)
    {
        $employementType = Employees::where('station', $request->station)
            ->select('employement_type')
            ->distinct()
            ->orderBy('employement_type')
            ->pluck('employement_type');
        return response()->json($employementType);
    }


    //import
    public function empImport(Request $request)
    {
        // validate file
        $request->validate([
            'file' => [
                'required',
                'file',
                'max:10240',
                'extensions:csv,xlsx,xls'
            ],
        ]);

        $empImport = new EmployeesImport();

        try {

            Excel::import($empImport, $request->file('file'));

            return response()->json([
                'success' => true,
                'message' => 'Employees imported successfully.',
                'imported' => $empImport->imported,
                'skipped' => $empImport->skipped,
                'skippedRows' => $empImport->skippedRows,
            ]);
        } catch (\Exception $e) {

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    public function empStatus(Request $request)
    {
        $status = Employees::where('station', $request->station)
            ->where('employement_type', $request->employementType)
            ->select('status')
            ->distinct()
            ->orderBy('status')
            ->pluck('status');

        return response()->json($status);
    }


    public function printQr(Request $request)
    {
        $query = Employees::query();
        if ($request->station) {
            $query->where('station', $request->station);
        }
        if ($request->position) {
            $query->where('position', $request->position);
        }
        if ($request->status) {
            $query->where('status', $request->status);
        }


        $employeeCodes = $request->input('employee_id', []);

        // Get all matching students
        $employees = $query
            ->whereIn('employee_id', $employeeCodes)
            ->select(
                'code',
                'employee_id',
                'first_name',
                'last_name',
                'middle_initial',
                'position',
                'station',
            )
            ->orderBy('last_name')
            ->get();



        // Generate QR data
        $qrData = $employees->map(function ($employee) {

            $qrText =
                "EMPLOYEE INFORMATION\n\n" .
                "Employee ID: {$employee->employee_id}\n" .
                "Name: {$employee->first_name} " .
                ($employee->middle_initial
                    ? "{$employee->middle_initial}. "
                    : "") .
                "{$employee->last_name}\n" .
                "Station: {$employee->station}\n" .
                "Position: {$employee->position}\n";

            $qr = (string) QrCode::size(150)
                ->margin(1)
                ->generate($qrText);

            return [
                'code' => $employee->code,
                'qrText' => $qrText,
                'qr' => $qr,
            ];
        });

        // Send QR data to print view
        return view('students.print', compact('qrData'));
    }
    public function printConfirmed(Request $request)
    {

        $request->validate([
            'codes' => ['required', 'array'],
            'codes.*' => ['required', 'string'],
        ]);

        $updated = Employees::whereIn('code', $request->codes)
            ->where('status', 'Not Printed')
            ->update([
                'status' => 'Printed'
            ]);

        return response()->json([
            'success' => true,
            'message' => 'Print status updated successfully.',
            'updated' => $updated
        ]);
    }
}
