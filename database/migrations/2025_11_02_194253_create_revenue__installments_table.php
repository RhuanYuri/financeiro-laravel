<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('revenue_installments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('revenue_id')
                ->constrained('revenues')
                ->onDelete('cascade');
            $table->decimal('value', 10, 2);
            $table->integer('installments_number');
            $table->enum('type', ['revenue', 'expense'])->default('expense');
            $table->enum('status', ['paid', 'open'])->default('open');
            $table->date('dueDate');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('revenue__installments');
    }
};
