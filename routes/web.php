<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
// 1. Importe o seu RevenueController
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

    // --- ADICIONE ESTAS LINHAS AQUI ---

    // 2. Adicione a rota customizada 'getTotal'
    // Ela deve vir *antes* do 'resource' para ter prioridade
    Route::get('/revenue/getTotal/{type}', [RevenueController::class, 'getTotal'])
        ->name('revenue.getTotal');

    // 3. Adicione todas as rotas de "Recurso" (CRUD) para 'revenue'
    // Isso cria automaticamente:
    // GET /revenue          -> (método 'index' no controller)
    // POST /revenue         -> (método 'store')
    // PUT /revenue/{id}     -> (método 'update')
    // DELETE /revenue/{id}  -> (método 'destroy')
    // E também: show, create, edit
    Route::resource('revenue', RevenueController::class);

    // --- FIM DAS ADIÇÕES ---
});

require __DIR__.'/settings.php';
