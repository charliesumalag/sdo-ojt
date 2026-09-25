
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\StudentController;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/students', function () {
    return view('students.index');
})->name('students');


Route::get('/studentslist', [StudentController::class, 'index']);
Route::post('/students/import', [StudentController::class, 'import']);
Route::get('/student-filters', [StudentController::class, 'studentFilters']);
Route::post('/students/generate-qr', [StudentController::class, 'generateQr']);

Route::get('/students/print-qr', [StudentController::class, 'printQr'])
    ->name('students.printQr');
Route::get('/students/print', [StudentController::class, 'printQr'])
    ->name('students.print');
Route::get('/students/{code}', [StudentController::class, 'show'])
    ->name('students.show');
