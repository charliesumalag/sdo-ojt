<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Students extends Model
{
    use HasFactory;
    //
    protected $fillable = [
        'student_id',
        'first_name',
        'last_name',
        'middle_initial',
        'grade_level',
        'section',
        'adviser',
    ];
}
