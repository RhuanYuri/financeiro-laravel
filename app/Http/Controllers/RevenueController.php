<?php

namespace App\Http\Controllers;

use App\Models\Revenue;
use Illuminate\Http\Request;

class RevenueController extends Controller
{
    /**
     * Lista todas as receitas (revenues)
     */
    public function index()
    {
        // Retorna todas as receitas com o membro associado
        $revenues = Revenue::with('member')->get();
        return response()->json($revenues);
    }

    /**
     * Exibe uma receita específica
     */
    public function show($id)
    {
        $revenue = Revenue::with('member')->find($id);

        if (!$revenue) {
            return response()->json(['message' => 'Receita não encontrada'], 404);
        }

        return response()->json($revenue);
    }

    /**
     * Cria uma nova receita
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'description' => 'required|string|max:255',
            'value' => 'required|numeric',
            'total_installments' => 'nullable|integer|min:1',
            'installments_paid' => 'nullable|integer|min:0',
            'status' => 'required|string',
            'isPublic' => 'boolean',
            'member_id' => 'nullable|exists:members,id',
            'date' => 'required|date',
        ]);

        $revenue = Revenue::create($validated);

        return response()->json($revenue, 201);
    }

    /**
     * Atualiza uma receita existente
     */
    public function update(Request $request, $id)
    {
        $revenue = Revenue::find($id);

        if (!$revenue) {
            return response()->json(['message' => 'Receita não encontrada'], 404);
        }

        $validated = $request->validate([
            'description' => 'sometimes|string|max:255',
            'value' => 'sometimes|numeric',
            'total_installments' => 'nullable|integer|min:1',
            'installments_paid' => 'nullable|integer|min:0',
            'status' => 'sometimes|string',
            'isPublic' => 'boolean',
            'member_id' => 'nullable|exists:members,id',
            'date' => 'sometimes|date',
        ]);

        $revenue->update($validated);

        return response()->json($revenue);
    }

    /**
     * Exclui (soft delete) uma receita
     */
    public function destroy($id)
    {
        $revenue = Revenue::find($id);

        if (!$revenue) {
            return response()->json(['message' => 'Receita não encontrada'], 404);
        }

        $revenue->delete();

        return response()->json(['message' => 'Receita removida com sucesso']);
    }

    public function getTotal(Request $request, string $type)
    {
        // Filtra as receitas de acordo com o tipo informado
        $total = Revenue::where('type', $type)->sum('value');

        return response()->json([
            'total' => $total,
        ]);
    }
}
