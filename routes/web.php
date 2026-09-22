
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\StudentController;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/students', function () {
    return view('students.index');
})->name('students');

Route::get('/connection', function () {
    return view('databasecon');
});

Route::get('/studentslist', [StudentController::class, 'index']);

// Route::get('/students/{student_id}', [StudentController::class, 'show'])
// ->name('student.show');

Route::post('/students/import', [StudentController::class, 'import']);

// filter
Route::get('/student-filters', [StudentController::class, 'studentFilters']);
