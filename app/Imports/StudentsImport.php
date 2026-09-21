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
        // Get values from Excel
        $studentId = trim((string) ($row['student_id'] ?? ''));
        $lrn = trim((string) ($row['lrn'] ?? ''));

        // Skip if student_id is missing
        if ($studentId === '') {
            $this->skipped++;

            $this->skippedRows[] = [
                'excel_row' => $this->getRowNumber(),
                'reason' => 'Missing student_id',
            ];

            return null;
        }

        // Skip if LRN is missing
        if ($lrn === '') {
            $this->skipped++;

            $this->skippedRows[] = [
                'excel_row' => $this->getRowNumber(),
                'reason' => 'Missing LRN',
            ];

            return null;
        }

        // Check duplicate student_id
        if (Students::where('student_id', $studentId)->exists()) {
            $this->skipped++;

            $this->skippedRows[] = [
                'excel_row' => $this->getRowNumber(),
                'reason' => 'Duplicate student_id: ' . $studentId,
            ];

            return null;
        }

        // Check duplicate LRN
        if (Students::where('lrn', $lrn)->exists()) {
            $this->skipped++;

            $this->skippedRows[] = [
                'excel_row' => $this->getRowNumber(),
                'reason' => 'Duplicate LRN: ' . $lrn,
            ];

            return null;
        }

        // Import student
        $this->imported++;

        return new Students([
            'student_id' => $studentId,
            'first_name' => $row['first_name'] ?? null,
            'last_name' => $row['last_name'] ?? null,
            'middle_initial' => $row['middle_initial'] ?? null,
            'lrn' => $lrn,
            'gender' => $row['gender'] ?? null,
            'parents_name' => $row['parents_name'] ?? null,
            'grade_level' => $row['grade_level'] ?? null,
            'section' => $row['section'] ?? null,
            'adviser' => $row['adviser'] ?? null,
            'status' => $row['status'] ?? 'Active',
        ]);
    }
}
