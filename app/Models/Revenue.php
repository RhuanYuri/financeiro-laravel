<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Revenue extends Model
{
    // Adiciona o HasFactory para factories e o SoftDeletes para a coluna 'deleted_at'
    use HasFactory, SoftDeletes;

    /**
     * Os atributos que podem ser atribuídos em massa.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'description',
        'value',
        'total_installments',
        'installments_paid',
        'status',
        'isPublic',
        'type',
        'member_id',
        'date',
    ];

    /**
     * Os atributos que devem ser convertidos para tipos nativos.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'value' => 'decimal:2', // Garante que o valor seja tratado como decimal com 2 casas
        'isPublic' => 'boolean', // Converte 'isPublic' para booleano (true/false)
        'date' => 'date',       // Converte a 'date' para um objeto Carbon (data)
    ];

    /**
     * Define o relacionamento: uma receita (Revenue) pertence a um membro (Member).
     */
    public function member()
    {
        return $this->belongsTo(Member::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
