<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/*
 * Class Home
 *
 * @property string $name
 * @property string $description
 *
 * @package App\Models
 */
class Home extends Model
{
    use HasFactory, SoftDeletes;

    protected $casts = [
        'name' => 'string',
        'description' => 'string',
    ];

    protected $fillable = [
        'name',
        'description',
    ];

    public function members() {
        return $this->hasMany(Member::class);
}

}
