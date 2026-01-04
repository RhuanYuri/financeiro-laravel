<?php

namespace App\Http\Controllers;


use App\Models\RevenueInstallments;
use App\Models\Revenue;
use Illuminate\Http\Request;

class RevenueInstallmentController extends Controller
{
    public function update(Request $request, $id)
    {
        $installment = RevenueInstallments::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:paid,open',
            'pay_day' => 'nullable|date|before_or_equal:today',
        ]);

        $installment->update([
            'status' => $validated['status'],
            'pay_day' => $validated['status'] === 'paid' ? ($validated['pay_day'] ?? now()) : null,
        ]);

        // Check if all installments for this revenue are paid
        // Check if all installments for this revenue are paid and update count
        $revenue = $installment->revenue;
        $paidCount = $revenue->installments()->where('status', 'paid')->count();
        
        $allPaid = $revenue->installments()->where('status', '!=', 'paid')->count() === 0;

        $revenue->update([
            'installments_paid' => $paidCount,
            'status' => $allPaid ? 'paid' : ($revenue->status === 'paid' ? 'open' : $revenue->status)
        ]);

        return response()->json($installment);
    }
}
