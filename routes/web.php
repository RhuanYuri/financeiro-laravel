<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\RevenueController;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('receita', function () {
        return Inertia::render('receita');
    })->name('receita');

    Route::get('/revenue/getTotal/{type}', [RevenueController::class, 'getTotal'])
        ->name('revenue.getTotal');
    Route::resource('revenue', RevenueController::class);

});

require __DIR__.'/settings.php';
