
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


Route::post('/students/import', [StudentController::class, 'import']);

// filter
Route::get('/student-filters', [StudentController::class, 'studentFilters']);


Route::get('/students/generate-qr', [StudentController::class, 'generateQr']);



Route::get('/students/{code}', [StudentController::class, 'show'])
    ->name('students.show');

Route::get('/students/print-qr', [StudentController::class, 'printQr'])
    ->name('students.printQr');
