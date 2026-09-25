<?php

namespace App\Http\Controllers;

use App\Models\Students;
use App\Imports\StudentsImport;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
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
            ->paginate(17);

        return response()->json($students);
    }

    /**
     * Get a single student.
     */
    public function show($code)
    {
        $student = Students::where('code', $code)->first();

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

    public function import(Request $request)
    {
        $request->validate(['file' => ['required', 'file', 'max:10240', 'extensions:csv,xlsx,xls',],]);
        $import = new StudentsImport();

        try {
            Excel::import($import, $request->file('file'));
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
            'grade_level' => Students::whereNotNull('grade_level')
                ->where('grade_level', '!=', '')
                ->distinct()
                ->orderBy('grade_level', 'desc')
                ->pluck('grade_level'),
        ]);
    }

    public function printQr(Request $request)
    {
        $query = Students::query();
        // Filters
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

        // Get all matching students
        $students = $query
            ->select('code', 'last_name')
            ->orderBy('last_name')
            ->get();

        // Generate QR data
        $qrData = $students->map(function ($student) {
            $url = route('students.show', $student->code);
            $qr = (string) QrCode::size(150)->margin(1)->generate($url);

            return [
                'code' => $student->code,
                'url' => $url,
                'qr' => $qr,
            ];
        });

        // Send QR data to print view
        return view('students.print', compact('qrData'));
    }

    public function home()
    {
        return view('students.index');
    }

    public function studentList()
    { {
            return view('students.index');
        }
    }


    public function studentGrades(Request $request)
    {
        $grades = Students::where('school', $request->school)
            ->select('grade_level')
            ->distinct()
            ->orderBy('grade_level')
            ->pluck('grade_level');
        return response()->json($grades);
    }


    public function studentSection(Request $request)
    {
        $grades = Students::where('grade_level', $request->grade_level)
            ->select('section')
            ->distinct()
            ->orderBy('section')
            ->pluck('section');
        return response()->json($grades);
    }
}
