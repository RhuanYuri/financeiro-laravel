<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Invite extends Model
{
    use HasFactory, SoftDeletes;
    protected $fillable = [
        'type',
        'user_id',
        'home_id',
    ];

    // Cada invite pertence a um usuário
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Cada invite pertence a uma home
    public function home()
    {
        return $this->belongsTo(Home::class);
    }
}
