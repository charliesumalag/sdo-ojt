<?php

namespace App\Imports;

use App\Models\Students;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\RemembersRowNumber;

class StudentsImport implements ToModel, WithHeadingRow
{
    use RemembersRowNumber;

    public $imported = 0;
    public $skipped = 0;
    public $skippedRows = [];

    public function model(array $row)
    {
        /*
        |--------------------------------------------------------------------------
        | Get values from Excel
        |--------------------------------------------------------------------------
        */

        $studentId = trim((string) ($row['student_id'] ?? ''));
        $firstName = trim((string) ($row['first_name'] ?? ''));
        $lastName = trim((string) ($row['last_name'] ?? ''));
        $middleInitial = trim((string) ($row['middle_initial'] ?? ''));
        $lrn = trim((string) ($row['lrn'] ?? ''));
        $gender = trim((string) ($row['gender'] ?? ''));
        $parentsName = trim((string) ($row['parents_name'] ?? ''));
        $gradeLevel = trim((string) ($row['grade_level'] ?? ''));
        $section = trim((string) ($row['section'] ?? ''));
        $adviser = trim((string) ($row['adviser'] ?? ''));
        $status = trim((string) ($row['status'] ?? ''));

        /*
        |--------------------------------------------------------------------------
        | Check for empty required fields
        |--------------------------------------------------------------------------
        */

        $missingFields = [];

        if ($studentId === '') {
            $missingFields[] = 'student_id';
        }

        if ($firstName === '') {
            $missingFields[] = 'first_name';
        }

        if ($lastName === '') {
            $missingFields[] = 'last_name';
        }

        if ($middleInitial === '') {
            $missingFields[] = 'middle_initial';
        }

        if ($lrn === '') {
            $missingFields[] = 'lrn';
        }

        if ($gender === '') {
            $missingFields[] = 'gender';
        }

        if ($parentsName === '') {
            $missingFields[] = 'parents_name';
        }

        if ($gradeLevel === '') {
            $missingFields[] = 'grade_level';
        }

        if ($section === '') {
            $missingFields[] = 'section';
        }

        if ($adviser === '') {
            $missingFields[] = 'adviser';
        }

        if ($status === '') {
            $missingFields[] = 'status';
        }

        /*
        |--------------------------------------------------------------------------
        | Skip row if ANY required field is empty
        |--------------------------------------------------------------------------
        */

        if (!empty($missingFields)) {

            $this->skipped++;

            $this->skippedRows[] = [
                'excel_row' => $this->getRowNumber(),
                'reason' => 'Missing: ' . implode(', ', $missingFields),
            ];

            return null;
        }

        /*
        |--------------------------------------------------------------------------
        | Check duplicate Student ID
        |--------------------------------------------------------------------------
        */

        if (Students::where('student_id', $studentId)->exists()) {

            $this->skipped++;

            $this->skippedRows[] = [
                'excel_row' => $this->getRowNumber(),
                'reason' => 'Duplicate student_id: ' . $studentId,
            ];

            return null;
        }

        /*
        |--------------------------------------------------------------------------
        | Check duplicate LRN
        |--------------------------------------------------------------------------
        */

        if (Students::where('lrn', $lrn)->exists()) {

            $this->skipped++;

            $this->skippedRows[] = [
                'excel_row' => $this->getRowNumber(),
                'reason' => 'Duplicate LRN: ' . $lrn,
            ];

            return null;
        }

        /*
        |--------------------------------------------------------------------------
        | Create Student
        |--------------------------------------------------------------------------
        */

        $this->imported++;

        return new Students([
            'student_id' => $studentId,
            'first_name' => $firstName,
            'last_name' => $lastName,
            'middle_initial' => $middleInitial,
            'lrn' => $lrn,
            'gender' => $gender,
            'parents_name' => $parentsName,
            'grade_level' => $gradeLevel,
            'section' => $section,
            'adviser' => $adviser,
            'status' => $status,
        ]);
    }
}
