<?php

namespace App\Imports;

use App\Models\Students;
use Maatwebsite\Excel\Concerns\ToModel;

class StudentsImport implements ToModel
{
    /**
     * @param array $row
     *
     * @return \Illuminate\Database\Eloquent\Model|null
     */
    public function model(array $row)
    {
        return new Students([
            'student_id'     => $row['student_id'],
            'first_name'     => $row['first_name'],
            'last_name'      => $row['last_name'],
            'middle_initial' => $row['middle_initial'],
            'grade_level'    => $row['grade_level'],
            'section'        => $row['section'],
            'adviser'        => $row['adviser'],
        ]);
    }
}
