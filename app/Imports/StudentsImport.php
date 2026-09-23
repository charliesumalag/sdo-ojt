<?php

namespace App\Imports;

use App\Models\Students;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\RemembersRowNumber;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\BeforeSheet;



class StudentsImport implements ToModel, WithHeadingRow, WithEvents
{
    use RemembersRowNumber;

    public $imported = 0;
    public $skipped = 0;
    public $skippedRows = [];

    // check all header fields/cell format if its correct
    public function registerEvents(): array
    {
        return [
            BeforeSheet::class => function (BeforeSheet $event) {
                $rows = $event->getSheet()
                    ->getDelegate()
                    ->toArray();

                $headers = $rows[0] ?? [];
                $expectedHeaders = ['lrn', 'first_name', 'last_name', 'middle_initial', 'gender', 'school', 'parents_name', 'grade_level', 'section', 'school_year',];

                $actualHeaders = array_map(function ($header) {
                    return strtolower(
                        str_replace(' ', '_', trim((string) $header))
                    );
                }, $headers);

                $missingHeaders = array_diff(
                    $expectedHeaders,
                    $actualHeaders
                );

                if (!empty($missingHeaders)) {
                    throw new \Exception(
                        'Invalid Excel format. Missing columns: '
                            . implode(', ', $missingHeaders)
                    );
                }
            },
        ];
    }


    // reading rows
    public function model(array $row)
    {

        $lrn = trim((string) ($row['lrn'] ?? ''));
        $firstName = trim((string) ($row['first_name'] ?? ''));
        $lastName = trim((string) ($row['last_name'] ?? ''));
        $middleInitial = trim((string) ($row['middle_initial'] ?? ''));
        $gender = trim((string) ($row['gender'] ?? ''));
        $school = trim((string) ($row['school'] ?? ''));
        $parentsName = trim((string) ($row['parents_name'] ?? ''));
        $gradeLevel = trim((string) ($row['grade_level'] ?? ''));
        $section = trim((string) ($row['section'] ?? ''));
        $schoolYear = trim((string) ($row['school_year'] ?? ''));

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
        if ($school === '') {
            $missingFields[] = 'school';
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

        if ($schoolYear === '') {
            $missingFields[] = 'school_year';
        }



        if (!empty($missingFields)) {
            $this->skipped++;
            $this->skippedRows[] = [
                'excel_row' => $this->getRowNumber(),
                'reason' => 'Missing: ' . implode(', ', $missingFields),
            ];
            return null;
        }
        $code = $school . '-' . $gradeLevel . '-' . $section . '-' . $lrn;

        if (Students::where('code', $code)->exists()) {
            $this->skipped++;
            $this->skippedRows[] = [
                'excel_row' => $this->getRowNumber(),
                'reason' => 'Duplicate Code: ' . $code,
            ];
            return null;
        }

        $this->imported++;

        return new Students([
            'lrn' => $lrn,
            'first_name' => $firstName,
            'last_name' => $lastName,
            'middle_initial' => $middleInitial,
            'gender' => $gender,
            'school' => $school,
            'parents_name' => $parentsName,
            'grade_level' => $gradeLevel,
            'section' => $section,
            'school_year' => $schoolYear,
            'code' => $code,
        ]);
    }
}
