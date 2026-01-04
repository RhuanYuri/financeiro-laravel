<?php

namespace App\Http\Controllers;

use App\Models\Revenue;
use Illuminate\Http\Request;

class RevenueController extends Controller
{
    /**
     * Lista todas as receitas (revenues) da casa selecionada
     */
    public function index()
    {
        $homeId = session('home_id');

        // Retorna todas as receitas com o membro associado, filtrando pela casa da sessão
        $revenues = Revenue::whereHas('member', function ($query) use ($homeId) {
            $query->where('home_id', $homeId);
        })->with('member.user')->get();

        return response()->json($revenues);
    }

    /**
     * Exibe uma receita específica
     */
    public function show($id)
    {
        $revenue = Revenue::with(['member', 'installments'])->find($id);

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
            'category_id' => 'nullable|exists:categories,id', // Validate category_id
            'date' => 'required|date',
            'type' => 'required|in:revenue,expense', // Validate type
        ]);

        if (!isset($validated['installments_paid'])) {
            $validated['installments_paid'] = 0;
        }

        $revenue = Revenue::create($validated);

        // Calculate installment value
        $totalInstallments = $validated['total_installments'] ?? 1;
        $installmentValue = $validated['value'] / $totalInstallments;
        $status = $validated['status'];
        
        // If status is paid, we assume the payment date is the date provided
        // If status is open, we assume the due date is the date provided
        // For multiple installments, we advance months. 
        // Logic: Create installments
        
        $startDate = \Carbon\Carbon::parse($validated['date']);

        for ($i = 0; $i < $totalInstallments; $i++) {
            $dueDate = $startDate->copy()->addMonths($i);
            
            // If the main revenue is paid, are all installments paid? 
            // Usually "Paid" revenue with 1 installment means it is paid.
            // If "Paid" with > 1, maybe all paid? 
            // User requirement: "independente se foi pago uma vez precisa ter salvar o dados lá"
            
            $payDay = null;
            $installmentStatus = 'open';

            if ($status === 'paid') {
                 // If status is paid, assume all are paid effectively immediately? 
                 // Or typically you create a paid revenue for a single transaction.
                 // If the user selects "Paid" for a 12x installment, it's ambiguous. 
                 // Whatever, let's assume 'paid' means paid now.
                 $installmentStatus = 'paid';
                 $payDay = $validated['date']; // Payment date is the revenue date
            }

            \App\Models\RevenueInstallments::create([
                'revenue_id' => $revenue->id,
                'value' => $installmentValue,
                'installments_number' => $i + 1,
                'type' => $validated['type'], // Use validated type
                'status' => $installmentStatus,
                'dueDate' => $dueDate->format('Y-m-d'),
                'pay_day' => $payDay,
                'category_id' => $validated['category_id'] ?? null,
            ]);
        }

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
            'category_id' => 'nullable|exists:categories,id',
            'date' => 'sometimes|date',
            'type' => 'sometimes|in:revenue,expense',
        ]);

        $revenue->update($validated);

        // If status changed to paid, update installments? 
        // User request: "Ajuste a tabela para poder quando clicar em editar abrir o modal novamente para poder atualizar o status da receita colocando o dia do pagamento"
        // If updating to paid, we should probably mark installments as paid.
        // However, complex for partial payments. Assuming simple case:
        
        if (isset($validated['status']) && $validated['status'] === 'paid') {
             // Mark all open installments as paid with the provided date?
             // Or typically just mark them paid.
             // If $validated['date'] is provided, use it as pay_day
             
             $payDay = $validated['date'] ?? now();
             
             $revenue->installments()->where('status', 'open')->update([
                 'status' => 'paid',
                 'pay_day' => $payDay,
             ]);
        }

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

        // Delete associated installments (Soft Delete)
        $revenue->installments()->delete();
        $revenue->delete();

        return response()->json(['message' => 'Receita e parcelas removidas com sucesso']);
    }

    public function getTotal(Request $request, string $type)
    {
        $homeId = session('home_id');

        // Filtra as receitas de acordo com o tipo informado e a casa da sessão
        $total = Revenue::where('type', $type)
            ->whereHas('member', function ($query) use ($homeId) {
                $query->where('home_id', $homeId);
            })
            ->sum('value');

        return response()->json([
            'total' => $total,
        ]);
    }

    /**
     * Retorna estatísticas gerais das receitas da casa.
     */
    public function getStats(Request $request)
    {
        $homeId = session('home_id');
        $year = $request->input('year', now()->year);

        // Helper to get stats for a specific month
        $getStatsForMonth = function ($year, $month) use ($homeId) {
            $base = Revenue::whereHas('member', function ($q) use ($homeId) {
                $q->where('home_id', $homeId);
            })
            ->whereYear('date', $year)
            ->whereMonth('date', $month);

            return [
                'revenue' => (clone $base)->where('type', 'revenue')->sum('value'),
                'expense' => (clone $base)->where('type', 'expense')->sum('value'),
                'active_clients' => (clone $base)->distinct('member_id')->count('member_id')
            ];
        };

        $now = now();
        $currentMonthStats = $getStatsForMonth($now->year, $now->month);
        $lastMonth = $now->copy()->subMonth();
        $lastMonthStats = $getStatsForMonth($lastMonth->year, $lastMonth->month);

        // Calculate Percentages
        $calcGrowth = function ($current, $previous) {
            if ($previous == 0) return $current > 0 ? 100 : 0;
            return round((($current - $previous) / $previous) * 100, 1);
        };

        $revenueGrowth = $calcGrowth($currentMonthStats['revenue'], $lastMonthStats['revenue']);
        $expenseGrowth = $calcGrowth($currentMonthStats['expense'], $lastMonthStats['expense']);
        $clientsGrowth = $calcGrowth($currentMonthStats['active_clients'], $lastMonthStats['active_clients']);

        // Descriptions
        $revenueDesc = ($revenueGrowth >= 0 ? '+' : '') . $revenueGrowth . '% desde o mês passado';
        $expenseDesc = ($expenseGrowth >= 0 ? '+' : '') . $expenseGrowth . '% desde o mês passado';
        $clientsDesc = ($clientsGrowth >= 0 ? '+' : '') . $clientsGrowth . '% desde o mês passado';

        // Chart Data for the requested Year
        $chartData = [];
        for ($month = 1; $month <= 12; $month++) {
            $stats = $getStatsForMonth($year, $month);
            // Create a date object just for formatting the month name
            $dateObj = \Carbon\Carbon::createFromDate($year, $month, 1);
            $chartData[] = [
                'month' => $dateObj->isoFormat('MMM'), // Jan, Feb, etc.
                'revenue' => $stats['revenue'],
                'expense' => $stats['expense'],
                'fullDate' => $dateObj->format('Y-m'),
            ];
        }
        
        // Pending Stats (Overall)
        $query = Revenue::whereHas('member', function ($q) use ($homeId) {
            $q->where('home_id', $homeId);
        });
        
        $pendingRevenue = (clone $query)->where('type', 'revenue')->where('status', 'open')->sum('value');
        $pendingExpense = (clone $query)->where('type', 'expense')->where('status', 'open')->sum('value');

        return response()->json([
            'monthRevenue' => $currentMonthStats['revenue'],
            'monthExpense' => $currentMonthStats['expense'],
            'pendingRevenue' => $pendingRevenue, // All time pending
            'pendingExpense' => $pendingExpense, // All time pending
            'activeClients' => $currentMonthStats['active_clients'],
            'revenueDesc' => $revenueDesc,
            'expenseDesc' => $expenseDesc,
            'clientsDesc' => $clientsDesc,
            'chartData' => $chartData,
            'year' => $year
        ]);
    }

    /**
     * Retorna a lista de membros da casa selecionada para o select.
     */
     public function getMembers(Request $request)
    {
        $homeId = session('home_id');
        $currentUserId = auth()->id();

        $members = \App\Models\Member::where('home_id', $homeId)
            ->with('user')
            ->get()
            ->map(function ($member) use ($currentUserId) {
                return [
                    'id' => $member->id,
                    'name' => $member->user->name,
                    'is_current_user' => $member->user_id === $currentUserId,
                ];
            });

        return response()->json($members);
    }
}
