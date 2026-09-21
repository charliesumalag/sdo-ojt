<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Students extends Model
{
    use HasFactory;

    protected $table = 'students';

    protected $fillable = [
        'lrn',
        'first_name',
        'last_name',
        'middle_initial',
        'gender',
        'parents_name',
        'grade_level',
        'section',
        'adviser',
        'status',
    ];
}
