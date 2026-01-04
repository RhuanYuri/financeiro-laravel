<?php

namespace App\Http\Controllers;

use App\Models\Home;
use App\Models\Member;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HomeController extends Controller
{
    /**
     * Exibe a tela de seleção de casas.
     */
    public function getHomes()
    {
        $userId = auth()->id();

        // Busca as casas onde o usuário está vinculado via tabela 'members'
        $homes = Home::whereHas('members', function ($query) use ($userId) {
            $query->where('user_id', $userId);
        })->get();

        return response()->json($homes);
    }

    /**
     * Exibe a tela de seleção de casas.
     */
    public function select()
    {
        // Método antigo, pode ser mantido ou alterado conforme necessidade, 
        // mas a renderização agora está sendo feita por rota direta e fetch no front
        return Inertia::render('Home/Select'); 
    }

    /**
     * Salva a casa selecionada na sessão via API.
     */
    public function selectHomeApi(Request $request)
    {
        $request->validate([
            'homeId' => 'required|integer',
        ]);

        $homeId = $request->homeId;
        $userId = auth()->id();

        // Verifica se o usuário realmente pertence a essa casa
        $isMember = Member::where('user_id', $userId)
            ->where('home_id', $homeId)
            ->exists();

        if (!$isMember) {
            return response()->json(['error' => 'Você não tem permissão para acessar esta casa.'], 403);
        }

        // Salva o ID da casa na sessão
        session(['home_id' => $homeId]);

        return response()->json(['message' => 'Casa selecionada com sucesso']);
    }

    /**
     * Salva a casa selecionada na sessão (Legacy/Web).
     */
    public function storeSelection(Request $request, $id)
    {
        // ... (manter ou remover se não for mais usado, mas vou deixar por compatibilidade se houver links antigos)
        $userId = auth()->id();
        $isMember = Member::where('user_id', $userId)->where('home_id', $id)->exists();
        if (!$isMember) return redirect()->back()->withErrors(['error' => 'Sem permissão.']);
        session(['home_id' => $id]);
        return redirect()->route('dashboard');
    }

    /**
     * Exibe o formulário de criação de uma nova casa.
     */
    public function create()
    {
        return Inertia::render('criar-casa');
    }

    /**
     * Cria uma nova casa e associa o usuário atual como membro.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
        ]);

        $home = Home::create([
            'name' => $request->name,
            'description' => $request->description,
        ]);

        // Associar o usuário como membro (Admin)
        // Assumindo que role_id 1 = Admin ou criando lógica para buscar
        // Vou usar um valor padrão ou null por enquanto se não tiver certeza, 
        // mas idealmente verificaria Roles.
        
        Member::create([
            'user_id' => auth()->id(),
            'home_id' => $home->id,
            'role_id' => 1, // Assumindo 1 como Admin padrão
            'type' => 'admin'
        ]);

        return redirect()->route('selecione-a-casa');
    }
}