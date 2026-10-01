<?php

namespace App\Imports;

use App\Models\Employees;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\RemembersRowNumber;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\BeforeSheet;

class EmployeesImport implements ToModel, WithHeadingRow, WithEvents
{
    use RemembersRowNumber;

    public $imported = 0;
    public $skipped = 0;
    public $skippedRows = [];

    public function registerEvents(): array
    {
        return [
            BeforeSheet::class => function (BeforeSheet $event) {
                // Get all rows from the Excel sheet
                $rows = $event->getSheet()
                    ->getDelegate()
                    ->toArray();

                // Get the first row (Excel headers)
                $headers = $rows[0] ?? [];

                // Headers that the Excel file is expected to have
                $expectedHeaders = [
                    'Employee ID',
                    'First Name',
                    'Last Name',
                    'Middle Initial',
                    'Position',
                    'Station'
                ];

                // Function to convert headers into backend format
                $normalizeHeader = function ($header) {
                    return strtolower(
                        str_replace(' ', '_', trim((string) $header))
                    );
                };

                // Normalize expected headers
                $expectedHeaders = array_map(
                    $normalizeHeader,
                    $expectedHeaders
                );

                // Normalize actual Excel headers
                $actualHeaders = array_map(
                    $normalizeHeader,
                    $headers
                );

                // Find required headers that are missing
                $missingHeaders = array_diff(
                    $expectedHeaders,
                    $actualHeaders
                );

                // Stop the import if required headers are missing
                if (!empty($missingHeaders)) {

                    throw new \Exception(
                        'Invalid Excel format. Missing columns: '
                            . implode(', ', $missingHeaders)
                    );
                }
            }

        ];
    }

    // $row['employee_id']
    //$row['first_name']
    //$row['last_name']
    //$row['middle_initial']
    //$row['position']
    //$row['station']}}

    public function model(array $row)
    {
        $employeeId = trim((string) ($row['employee_id'] ?? ''));
        $firstName = trim((string) ($row['first_name'] ?? ''));
        $lastName = trim((string) ($row['last_name'] ?? ''));
        $middleInitial = trim((string) ($row['middle_initial'] ?? ''));
        $position = trim((string) ($row['position'] ?? ''));
        $station = trim((string) ($row['station'] ?? ''));

        $missingFields = [];

        if ($employeeId === '') {
            $missingFields[] = 'employee_id';
        }

        if ($firstName === '') {
            $missingFields[] = 'first_name';
        }

        if ($lastName === '') {
            $missingFields[] = 'last_name';
        }

        if ($position === '') {
            $missingFields[] = 'position';
        }
        if ($station === '') {
            $missingFields[] = 'station';
        }


        if (!empty($missingFields)) {
            $this->skipped++;
            $this->skippedRows[] = [
                'excel_row' => $this->getRowNumber(),
                'reason' => 'Missing: ' . implode(', ', $missingFields),
            ];
            return null;
        }
        //kuhain ang first letter ng middle inital

        $code = $station . '-' . $employeeId;


        $code = $station . '-' . $employeeId;

        if (Employees::where('employee_id', $employeeId)->exists()) {

            $this->skipped++;

            $this->skippedRows[] = [
                'excel_row' => $this->getRowNumber(),
                'reason' => 'Duplicate Employee Record: ' . $employeeId,
            ];

            return null;
        }

        $this->imported++;

        return new Employees([
            'employee_id' => $employeeId,
            'first_name' => $firstName,
            'last_name' => $lastName,
            'middle_initial' => $middleInitial,
            'position' => $position,
            'station' => $station,
            'code' => $code,
        ]);
    }
}
