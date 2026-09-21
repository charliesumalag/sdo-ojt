<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\StudentImportController;
use App\Http\Controllers\StudentController;

Route::get('/', function () {
    return view('welcome');
});
Route::get('/students', function () {
    return view('students.index');
})->name('students');


Route::get('/connection', function () {
    return view('databasecon');
})->name('');


Route::post('/students/import', [StudentImportController::class, 'import']);
Route::get('/studentslist', [StudentController::class, 'index']);
