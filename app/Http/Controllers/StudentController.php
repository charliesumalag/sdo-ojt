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
    public function index(Request $request)
    {
        $query = Students::query();

        if ($request->search) {

            $search = $request->search;

            $query->where(function ($q) use ($search) {

                $q->where('lrn', 'like', '%' . $search . '%')
                    ->orWhere('first_name', 'like', '%' . $search . '%')
                    ->orWhere('last_name', 'like', '%' . $search . '%')
                    ->orWhere('middle_initial', 'like', '%' . $search . '%')
                    ->orWhere('gender', $search)
                    ->orWhere('school', 'like', '%' . $search . '%')
                    ->orWhere('parents_name', 'like', '%' . $search . '%')
                    ->orWhere('grade_level', 'like', '%' . $search . '%')
                    ->orWhere('section', 'like', '%' . $search . '%')
                    ->orWhere('school_year', 'like', '%' . $search . '%');
            });
        }

        if ($request->gender) {
            $query->where('gender', $request->gender);
        }

        if ($request->grade_level) {
            $query->where('grade_level', $request->grade_level);
        }

        if ($request->school) {
            $query->where('school', $request->school);
        }

        if ($request->section) {
            $query->where('section', $request->section);
        }

        if ($request->school_year) {
            $query->where('school_year', $request->school_year);
        }

        $students = $query
            ->orderBy('last_name')
            ->paginate(40);

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

        try {

            Excel::import(
                $import,
                $request->file('file')
            );
        } catch (\Exception $e) {

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Import completed.',
            'imported' => $import->imported,
            'skipped' => $import->skipped,
            'skipped_rows' => $import->skippedRows,
        ]);
    }


    public function studentFilters()
    {
        return response()->json([

            'schools' => Students::whereNotNull('school')
                ->where('school', '!=', '')
                ->distinct()
                ->orderBy('school')
                ->pluck('school'),

            'sections' => Students::whereNotNull('section')
                ->where('section', '!=', '')
                ->distinct()
                ->orderBy('section')
                ->pluck('section'),

            'school_years' => Students::whereNotNull('school_year')
                ->where('school_year', '!=', '')
                ->distinct()
                ->orderBy('school_year', 'desc')
                ->pluck('school_year'),

        ]);
    }




    public function generateQr(Request $request)
    {
        $query = Students::query();

        if ($request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('lrn', 'like', '%' . $search . '%')
                    ->orWhere('first_name', 'like', '%' . $search . '%')
                    ->orWhere('last_name', 'like', '%' . $search . '%')
                    ->orWhere('middle_initial', 'like', '%' . $search . '%')
                    ->orWhere('gender', $search)
                    ->orWhere('school', 'like', '%' . $search . '%')
                    ->orWhere('parents_name', 'like', '%' . $search . '%')
                    ->orWhere('grade_level', 'like', '%' . $search . '%')
                    ->orWhere('section', 'like', '%' . $search . '%')
                    ->orWhere('school_year', 'like', '%' . $search . '%');
            });
        }

        if ($request->gender) {
            $query->where('gender', $request->gender);
        }

        if ($request->grade_level) {
            $query->where('grade_level', $request->grade_level);
        }

        if ($request->school) {
            $query->where('school', $request->school);
        }

        if ($request->section) {
            $query->where('section', $request->section);
        }

        if ($request->school_year) {
            $query->where('school_year', $request->school_year);
        }

        $lrns = $query
            ->pluck('lrn');

        return response()->json([
            'success' => true,
            'lrns' => $lrns
        ]);
    }
}
