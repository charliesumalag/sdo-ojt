<?php

namespace App\Http\Controllers;

use App\Models\Students;
use App\Imports\StudentsImport;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class StudentController extends Controller
{

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
        if ($request->status) {
            $query->where('status', $request->status);
        }
        $students = $query
            ->orderBy('last_name')
            ->paginate(25);

        return response()->json($students);
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
            ->select(
                'code',
                'lrn',
                'first_name',
                'last_name',
                'middle_initial',
                'gender',
                'school',
                'grade_level',
                'section',
                'school_year'
            )
            ->orderBy('last_name')
            ->get();

        // Generate QR data
        $qrData = $students->map(function ($student) {

            $qrText =
                "STUDENT INFORMATION\n\n" .
                "LRN: {$student->lrn}\n" .
                "Name: {$student->first_name} " .
                ($student->middle_initial
                    ? "{$student->middle_initial}. "
                    : "") .
                "{$student->last_name}\n" .
                "School: {$student->school}\n" .
                "Grade Level: {$student->grade_level}\n" .
                "Section: {$student->section}\n";

            $qr = (string) QrCode::size(150)
                ->margin(1)
                ->generate($qrText);

            return [
                'code' => $student->code,
                'qrText' => $qrText,
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
        $sections = Students::where('school', $request->school)
            ->where('grade_level', $request->grade_level)
            ->select('section')
            ->distinct()
            ->orderBy('section')
            ->pluck('section');

        return response()->json($sections);
    }

    public function status(Request $request)
    {
        $status = Students::where('school', $request->school)
            ->where('grade_level', $request->grade_level)
            ->where('section', $request->section)
            ->select('status')
            ->distinct()
            ->orderBy('status')
            ->pluck('status');

        return response()->json($status);
    }
    public function printConfirmed(Request $request){

         $request->validate([
        'codes' => ['required', 'array'],
        'codes.*' => ['required', 'string'],
        ]);

        $updated = Students::whereIn('code', $request->codes)
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
