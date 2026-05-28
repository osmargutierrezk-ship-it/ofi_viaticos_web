<?php
// routes/api.php
//
// All routes are prefixed with /api automatically by Laravel.
// Protected routes require a valid Sanctum token: Authorization: Bearer <token>

use App\Http\Controllers\Api\ApprovalController;
use App\Http\Controllers\Api\AuditController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\FileController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\RequestController;
use Illuminate\Support\Facades\Route;

// ─── Public ───────────────────────────────────────────────────────────────────
Route::post('/auth/login',  [AuthController::class, 'login']);

// ─── Authenticated ────────────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me',      [AuthController::class, 'me']);

    // ── Requests ──────────────────────────────────────────────────────────────
    Route::prefix('requests')->group(function () {

        Route::get('/',        [RequestController::class, 'index']);   // GET  /api/requests
        Route::post('/',       [RequestController::class, 'store']);   // POST /api/requests
        Route::get('/stats',   [RequestController::class, 'stats']);   // GET  /api/requests/stats

        Route::prefix('{request}')->group(function () {
            Route::get('/',    [RequestController::class, 'show']);    // GET    /api/requests/{id}
            Route::put('/',    [RequestController::class, 'update']);  // PUT    /api/requests/{id}
            Route::delete('/', [RequestController::class, 'destroy']); // DELETE /api/requests/{id}

            // Workflow actions
            Route::post('/submit',  [RequestController::class, 'submit']);      // POST /api/requests/{id}/submit
            Route::post('/approve', [ApprovalController::class, 'approve']);    // POST /api/requests/{id}/approve
            Route::post('/reject',  [ApprovalController::class, 'reject']);     // POST /api/requests/{id}/reject
            Route::post('/comment', [ApprovalController::class, 'comment']);    // POST /api/requests/{id}/comment

            // Files for this request
            Route::post('/files',   [FileController::class, 'store']);          // POST /api/requests/{id}/files

            // Approval history
            Route::get('/history',  [ApprovalController::class, 'history']);    // GET  /api/requests/{id}/history

            // Audit trail (approver/admin only)
            Route::get('/audit',    [AuditController::class, 'forRequest']);    // GET  /api/requests/{id}/audit
        });
    });

    // ── Standalone File Actions ───────────────────────────────────────────────
    Route::delete('/files/{uploadedFile}', [FileController::class, 'destroy']); // DELETE /api/files/{id}

    // ── Notifications ─────────────────────────────────────────────────────────
    Route::prefix('notifications')->group(function () {
        Route::get('/',              [NotificationController::class, 'index']);       // GET  /api/notifications
        Route::post('/read',         [NotificationController::class, 'markAllRead']); // POST /api/notifications/read
        Route::post('/{id}/read',    [NotificationController::class, 'markRead']);    // POST /api/notifications/{id}/read
    });

    // ── Push Subscriptions ────────────────────────────────────────────────────
    Route::prefix('push')->group(function () {
        Route::post('/subscribe',   [NotificationController::class, 'subscribe']);   // POST /api/push/subscribe
        Route::delete('/unsubscribe',[NotificationController::class, 'unsubscribe']); // DELETE /api/push/unsubscribe
    });

    // ── Audit Logs (admin only) ───────────────────────────────────────────────
    Route::get('/audit-logs', [AuditController::class, 'index']); // GET /api/audit-logs
});
