<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class RevenueInstallments extends Model
{
    use SoftDeletes;
    
    protected $table = 'revenue_installments';

    protected $fillable = [
        'revenue_id',
        'value',
        'installments_number',
        'type',
        'status',
        'dueDate',
        'pay_day',
        'category_id',
    ];

    public function revenue()
    {
        return $this->belongsTo(Revenue::class);
    }
}
