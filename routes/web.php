<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\RevenueController;
use App\Http\Controllers\HomeController;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // --- Routes NOT requiring a Home selected ---
    
    Route::get('selecione-a-casa', function () {
        return Inertia::render('selecione-a-casa');
    })->name('selecione-a-casa');

    Route::get('/api/user-homes', [HomeController::class, 'getHomes'])->name('homes.list');
    Route::post('/api/select-home', [HomeController::class, 'selectHomeApi'])->name('homes.selectApi');
    
    Route::get('/create-home', [HomeController::class, 'create'])->name('homes.create');
    Route::post('/create-home', [HomeController::class, 'store'])->name('homes.store');
    
    // Invites should be accessible to accept/deny
    Route::get('/api/invites', [App\Http\Controllers\MemberController::class, 'invites']);
    Route::post('/api/invites/{id}/accept', [App\Http\Controllers\MemberController::class, 'acceptInvite']);
    Route::post('/api/invites/{id}/deny', [App\Http\Controllers\MemberController::class, 'denyInvite']);

    // --- Routes REQUIRING a Home selected ---
    Route::middleware([App\Http\Middleware\EnsureHomeIsSelected::class])->group(function () {
        Route::get('dashboard', function () {
            return Inertia::render('dashboard');
        })->name('dashboard');

        Route::get('receita', function () {
            return Inertia::render('receita');
        })->name('receita');
        
        Route::get('/revenue/getTotal/{type}', [RevenueController::class, 'getTotal'])
            ->name('revenue.getTotal');
        Route::get('/revenue/stats', [RevenueController::class, 'getStats'])
            ->name('revenue.stats');
        
        // Categories
        Route::get('/categories', [App\Http\Controllers\CategoryController::class, 'index']);
        Route::post('/categories', [App\Http\Controllers\CategoryController::class, 'store']);

        // Installments
        Route::put('/installments/{id}', [App\Http\Controllers\RevenueInstallmentController::class, 'update']); 
        
        Route::get('/revenue/members', [RevenueController::class, 'getMembers'])
            ->name('revenue.members');
        Route::resource('revenue', RevenueController::class);

        // Members Area (Inside Home)
        Route::get('/membros', function () {
            return Inertia::render('membros');
        })->name('membros');
        
        Route::get('/api/members', [App\Http\Controllers\MemberController::class, 'index']);
        Route::post('/api/members/invite', [App\Http\Controllers\MemberController::class, 'invite']);
        Route::delete('/api/members/{id}', [App\Http\Controllers\MemberController::class, 'destroy']);
    });

    // Old routes kept for reference but now superseded or unused in this flow?
    // Route::get('/select-home', [HomeController::class, 'select'])->name('homes.select'); // Using Inertia route above
    // Route::post('/select-home/{id}', [HomeController::class, 'storeSelection'])->name('homes.storeSelection'); // Using API route above
});

require __DIR__.'/settings.php';
