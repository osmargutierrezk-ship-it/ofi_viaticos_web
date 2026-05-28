<?php
// database/migrations/2024_01_01_000004_create_approvals_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ─── Approvals ────────────────────────────────────────────────────────
        Schema::create('approvals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('request_id')->constrained('requests')->cascadeOnDelete();
            $table->foreignId('approver_id')->constrained('users')->cascadeOnDelete();

            $table->enum('action', ['submitted', 'in_review', 'approved', 'rejected', 'comment'])
                  ->index();
            $table->text('comment')->nullable();

            // Previous and new status for audit trail
            $table->string('from_status')->nullable();
            $table->string('to_status')->nullable();

            $table->timestamp('acted_at')->useCurrent();
            $table->timestamps();

            $table->index(['request_id', 'action']);
            $table->index('approver_id');
        });

        // ─── Uploaded Files ───────────────────────────────────────────────────
        Schema::create('uploaded_files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('request_id')->constrained('requests')->cascadeOnDelete();
            $table->foreignId('uploaded_by')->constrained('users')->cascadeOnDelete();

            $table->string('original_name');
            $table->string('stored_name');           // UUID-based filename on disk
            $table->string('path');                  // Relative path under /uploads
            $table->string('disk')->default('local');
            $table->string('mime_type');
            $table->unsignedBigInteger('size_bytes');// File size in bytes
            $table->enum('category', ['factura', 'comprobante', 'otro'])->default('factura');
            $table->boolean('is_valid')->default(true);
            $table->string('validation_note')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index('request_id');
            $table->index('uploaded_by');
        });

        // ─── Notifications ────────────────────────────────────────────────────
        Schema::create('push_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('endpoint')->unique();
            $table->string('p256dh_key');
            $table->string('auth_key');
            $table->string('user_agent')->nullable();
            $table->timestamps();

            $table->index('user_id');
        });

        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('request_id')->nullable()->constrained('requests')->nullOnDelete();

            $table->string('title');
            $table->text('body');
            $table->enum('type', ['submitted', 'in_review', 'approved', 'rejected', 'comment', 'reminder'])
                  ->index();
            $table->boolean('read')->default(false)->index();
            $table->json('data')->nullable();        // Extra payload for the frontend
            $table->timestamp('read_at')->nullable();

            $table->timestamps();

            $table->index(['user_id', 'read']);
            $table->index('created_at');
        });

        // ─── Audit Logs ───────────────────────────────────────────────────────
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('request_id')->nullable()->constrained('requests')->nullOnDelete();

            $table->string('action');               // e.g. "request.submitted", "file.uploaded"
            $table->string('entity_type')->nullable();
            $table->unsignedBigInteger('entity_id')->nullable();
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent')->nullable();
            $table->text('description')->nullable();

            $table->timestamp('created_at')->useCurrent();

            // Heavy read indexes
            $table->index(['user_id', 'created_at']);
            $table->index(['request_id', 'created_at']);
            $table->index('action');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('push_subscriptions');
        Schema::dropIfExists('uploaded_files');
        Schema::dropIfExists('approvals');
    }
};
