<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Employees extends Model
{
    protected $table = 'employees';
    protected $fillable = [
        'employee_id',
        'first_name',
        'last_name',
        'middle_initial',
        'position',
        'station',
        'employement_type',
        'code',
    ];
}
