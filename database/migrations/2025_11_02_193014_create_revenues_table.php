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
        Schema::create('revenues', function (Blueprint $table) {
            $table->id();
            $table->string('description')->nullable();
            $table->decimal('value', 10, 2);
            $table->integer('total_installments');
            $table->integer('installments_paid');
            $table->enum('status', ['paid', 'open'])->default('open');
            $table->boolean('isPublic')->default(false);
            $table->foreignId('member_id')
                ->constrained('members')
                ->onDelete('cascade');
            $table->date('date');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('revenues');
    }
};
