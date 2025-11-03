<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Member extends Model
{
    use HasFactory, SoftDeletes;
    protected $fillable = [
        'user_id',
        'home_id',
        'role_id'
    ];

    public function user(){
        return $this->belongsTo(User::class);
    }

    public function home(){
        return $this->belongsTo(Home::class);
    }

    public function role(){
        return $this->belongsTo(Role::class);
    }
}
