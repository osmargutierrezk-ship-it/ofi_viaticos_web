<?php
// database/migrations/2024_01_01_000002_create_requests_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('requests', function (Blueprint $table) {
            $table->id();

            // Unique folio e.g. VIA-2024-089
            $table->string('folio')->unique();

            // Relations
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('assigned_approver_id')->nullable()->constrained('users')->nullOnDelete();

            // Type
            $table->enum('type', ['viaticos', 'pago', 'anticipo'])->index();

            // Status workflow: draft → pending → in_review → approved / rejected
            $table->enum('status', ['draft', 'pending', 'in_review', 'approved', 'rejected'])
                  ->default('draft')
                  ->index();

            // Travel info (viaticos)
            $table->string('destination')->nullable();
            $table->date('travel_start')->nullable();
            $table->date('travel_end')->nullable();
            $table->string('purpose')->nullable();         // e.g. "Visita a cliente"
            $table->string('cost_center')->nullable();     // e.g. "CC-2100"
            $table->text('reason')->nullable();            // Motivo o razón del viaje

            // Advance (anticipo)
            $table->boolean('received_advance')->default(false);
            $table->decimal('advance_amount', 12, 2)->nullable();
            $table->date('advance_date')->nullable();
            $table->string('advance_folio')->nullable();

            // Payment (pago)
            $table->decimal('payment_amount', 12, 2)->nullable();
            $table->string('payment_concept')->nullable();
            $table->string('payment_beneficiary')->nullable();
            $table->string('bank_account')->nullable();

            // Totals
            $table->decimal('total_expenses', 12, 2)->nullable();
            $table->decimal('balance', 12, 2)->nullable(); // total_expenses - advance_amount

            // Timestamps
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamp('resolved_at')->nullable();

            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Composite indexes for common queries
            $table->index(['user_id', 'status']);
            $table->index(['assigned_approver_id', 'status']);
            $table->index(['type', 'status']);
            $table->index('submitted_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('requests');
    }
};
