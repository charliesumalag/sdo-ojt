
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\StudentController;

Route::get('/', [StudentController::class, 'studentList'])->name('home');
Route::get('/studentslist', [StudentController::class, 'studentList'])->name('students');
Route::get('/studentslist', [StudentController::class, 'index']);
Route::post('/students/import', [StudentController::class, 'import']);
Route::get('/student-filters', [StudentController::class, 'studentFilters']);
Route::get('/students/print', [StudentController::class, 'printQr'])->name('students.print');
Route::get('/students/{code}', [StudentController::class, 'show'])->name('students.show');
Route::get('/student-grades', [StudentController::class, 'studentGrades']);
Route::get('/student-section', [StudentController::class, 'studentSection']);
