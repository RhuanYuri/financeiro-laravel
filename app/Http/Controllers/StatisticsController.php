<?php

namespace App\Http\Controllers;

use App\Models\Revenue;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StatisticsController extends Controller
{
    public function index(Request $request) {
        $homeId = session('home_id');
        $year = $request->input('year', now()->year);
        $month = $request->input('month', now()->month);

        // Filter by Home and Date
        $baseQuery = Revenue::whereHas('member', function ($q) use ($homeId) {
            $q->where('home_id', $homeId);
        })
        ->whereYear('date', $year)
        ->whereMonth('date', $month);

        // 1. Biggest expenses of the month (Top 5)
        $topExpenses = (clone $baseQuery)
            ->where('revenues.type', 'expense')
            ->orderByDesc('value')
            ->limit(5)
            ->with(['member.user', 'category'])
            ->get();

        // 2. Who is spending the most (Expense by Member)
        $expensesByMember = (clone $baseQuery)
            ->where('revenues.type', 'expense')
            ->join('members', 'revenues.member_id', '=', 'members.id')
            ->join('users', 'members.user_id', '=', 'users.id')
            ->select('users.name', DB::raw('sum(revenues.value) as total'))
            ->groupBy('users.name')
            ->orderByDesc('total')
            ->get();

        // 3. What is being spent on (Expense by Category)
        $expensesByCategory = (clone $baseQuery)
            ->where('revenues.type', 'expense')
            ->leftJoin('categories', 'revenues.category_id', '=', 'categories.id')
            ->select(DB::raw('COALESCE(categories.name, "Sem Categoria") as name'), DB::raw('sum(revenues.value) as total'))
            ->groupBy('categories.name')
            ->orderByDesc('total')
            ->get();

        // 4. Where money is coming from (Revenue by Category)
        $revenuesByCategory = (clone $baseQuery)
            ->where('revenues.type', 'revenue')
            ->leftJoin('categories', 'revenues.category_id', '=', 'categories.id')
            ->select(DB::raw('COALESCE(categories.name, "Sem Categoria") as name'), DB::raw('sum(revenues.value) as total'))
            ->groupBy('categories.name')
            ->orderByDesc('total')
            ->get();
        
        // 5. General Totals
        $totalRevenue = (clone $baseQuery)->where('revenues.type', 'revenue')->sum('value');
        $totalExpense = (clone $baseQuery)->where('revenues.type', 'expense')->sum('value');
        $balance = $totalRevenue - $totalExpense;

        return response()->json([
            'topExpenses' => $topExpenses,
            'expensesByMember' => $expensesByMember,
            'expensesByCategory' => $expensesByCategory,
            'revenuesByCategory' => $revenuesByCategory,
            'summary' => [
                'totalRevenue' => $totalRevenue,
                'totalExpense' => $totalExpense,
                'balance' => $balance
            ],
            'filters' => ['year' => $year, 'month' => $month]
        ]);
    }
}
