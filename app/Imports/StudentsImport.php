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
        $lrn = trim((string) ($row['lrn'] ?? ''));
        $firstName = trim((string) ($row['first_name'] ?? ''));
        $lastName = trim((string) ($row['last_name'] ?? ''));
        $middleInitial = trim((string) ($row['middle_initial'] ?? ''));
        $gender = trim((string) ($row['gender'] ?? ''));
        $parentsName = trim((string) ($row['parents_name'] ?? ''));
        $gradeLevel = trim((string) ($row['grade_level'] ?? ''));
        $section = trim((string) ($row['section'] ?? ''));
        $adviser = trim((string) ($row['adviser'] ?? ''));
        $status = trim((string) ($row['status'] ?? ''));

        $missingFields = [];

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
            'lrn' => $lrn,
            'first_name' => $firstName,
            'last_name' => $lastName,
            'middle_initial' => $middleInitial,
            'gender' => $gender,
            'parents_name' => $parentsName,
            'grade_level' => $gradeLevel,
            'section' => $section,
            'adviser' => $adviser,
            'status' => $status,
        ]);
    }
}
