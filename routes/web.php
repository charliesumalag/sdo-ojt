<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});
Route::get('/students', function () {
    return view('students.index');
})->name('students');


Route::get('/connection', function () {
    return view('databasecon');
})->name('');
