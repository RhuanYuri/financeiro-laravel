<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureHomeIsSelected
{
    public function handle(Request $request, Closure $next): Response
    {
        // 1. Se não estiver logado, o middleware 'auth' já deve ter barrado antes,
        // mas por segurança garantimos que há um usuário.
        if (! $request->user()) {
            return redirect()->route('login');
        }

        // 2. Verifica se existe um ID de casa salvo na sessão
        // (Você definirá essa sessão quando o usuário escolher a casa no front-end)
        if (! session()->has('home_id')) {
            // Se não tiver escolhido, redireciona para a tela de seleção
            // Importante: A rota de seleção não pode usar este middleware para evitar loop infinito
            return redirect()->route('selecione-a-casa');
        }

        // 3. (Opcional) Verificar se o usuário ainda pertence a essa casa
        $hasAccess = $request->user()->members()
            ->where('home_id', session('home_id'))
            ->exists();

        if (!$hasAccess) {
            session()->forget('home_id');
            return redirect()->route('selecione-a-casa')->withErrors(['error' => 'Acesso revogado.']);
        }

        return $next($request);
    }
}