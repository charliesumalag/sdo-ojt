
<?php

use App\Http\Controllers\EmployeesController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\StudentController;

Route::get('/', function () {
    return redirect()->route('employees');
});

  
//stiudyante

Route::get('/students', [StudentController::class, 'studentList'])->name('students');
Route::get('/studentslist', [StudentController::class, 'studentList'])->name('students');
Route::get('/studentslist', [StudentController::class, 'index']);
Route::post('/students/import', [StudentController::class, 'import']);
Route::get('/student-filters', [StudentController::class, 'studentFilters']);
Route::get('/students/print', [StudentController::class, 'printQr'])->name('students.print');
Route::get('/student-grades', [StudentController::class, 'studentGrades']);
Route::get('/student-section', [StudentController::class, 'studentSection']);
Route::get('/status', [StudentController::class, 'status']);
Route::post('/students/print-confirmed', [StudentController::class, 'printConfirmed'])->name('students.print-confirmed');



// Employeado


Route::get('/employees', [EmployeesController::class, 'index'])->name('employees');
Route::get('/employees-filters', [EmployeesController::class, 'employeesFilters']);
Route::get('/employees-employementType', [EmployeesController::class, 'employeesEmployementType']);
Route::post('/employees/import', [EmployeesController::class, 'empImport']);
Route::get('/employees-status', [EmployeesController::class, 'empStatus']);
Route::get('/employee-list', [EmployeesController::class, 'employeeList']);
Route::get('/employee/print', [EmployeesController::class, 'printQr'])->name('employee.print');
Route::post('/employees/print-confirmed', [EmployeesController::class, 'printConfirmed'])->name('employees.print-confirmed');
