<?php

namespace App\Http\Controllers;

use App\Models\Students;
use App\Imports\StudentsImport;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class StudentController extends Controller
{
    /**
     * Get all students.
     */
    public function index()
    {
        $students = Students::all();

        return response()->json($students);
    }

    /**
     * Get a single student.
     */
    public function show($lrn)
    {
        $student = Students::where('lrn', $lrn)->first();

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Student not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'student' => $student,
        ]);
    }

    /**
     * Import students from Excel/CSV.
     */
    public function import(Request $request)
    {
        $request->validate([
            'file' => [
                'required',
                'file',
                'max:10240',
                'extensions:csv,xlsx,xls',
            ],
        ]);

        $import = new StudentsImport();

        Excel::import(
            $import,
            $request->file('file')
        );

        return response()->json([
            'success' => true,
            'message' => 'Import completed.',
            'imported' => $import->imported,
            'skipped' => $import->skipped,
            'skipped_rows' => $import->skippedRows,
        ]);
    }
}
