
<?php

use App\Http\Controllers\Employees;
use App\Http\Controllers\EmployeesController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\StudentController;

Route::get('/', [StudentController::class, 'studentList'])->name('students');
Route::get('/studentslist', [StudentController::class, 'studentList'])->name('students');
Route::get('/studentslist', [StudentController::class, 'index']);
Route::post('/students/import', [StudentController::class, 'import']);
Route::get('/student-filters', [StudentController::class, 'studentFilters']);
Route::get('/students/print', [StudentController::class, 'printQr'])->name('students.print');
Route::get('/student-grades', [StudentController::class, 'studentGrades']);
Route::get('/student-section', [StudentController::class, 'studentSection']);
Route::get('/status', [StudentController::class, 'status']);
Route::post('/students/print-confirmed', [StudentController::class, 'printConfirmed'])
    ->name('students.print-confirmed');


Route::get('/employees', [EmployeesController::class, 'index'])->name('employees');
