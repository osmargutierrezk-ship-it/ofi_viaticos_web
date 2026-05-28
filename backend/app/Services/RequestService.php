<?php
// app/Services/RequestService.php

namespace App\Services;

use App\Models\Approval;
use App\Models\AppNotification;
use App\Models\AuditLog;
use App\Models\Request as ViaticosRequest;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class RequestService
{
    public function __construct(
        private readonly NotificationService $notificationService,
        private readonly FileService $fileService,
    ) {}

    // ─── Create a new draft ───────────────────────────────────────────────────
    public function create(User $user, array $data): ViaticosRequest
    {
        return DB::transaction(function () use ($user, $data) {
            $request = ViaticosRequest::create([
                ...$data,
                'user_id' => $user->id,
                'folio'   => ViaticosRequest::generateFolio($data['type']),
                'status'  => ViaticosRequest::STATUS_DRAFT,
            ]);

            AuditLog::record(
                'request.created',
                $user->id,
                $request->id,
                description: "Borrador {$request->folio} creado",
            );

            return $request;
        });
    }

    // ─── Update a draft ───────────────────────────────────────────────────────
    public function update(ViaticosRequest $request, array $data): ViaticosRequest
    {
        $old = $request->toArray();
        $request->update($data);

        AuditLog::record(
            'request.updated',
            auth()->id(),
            $request->id,
            ['old_values' => $old, 'new_values' => $request->fresh()->toArray()],
            "Solicitud {$request->folio} actualizada",
        );

        return $request->fresh();
    }

    // ─── Submit for approval ──────────────────────────────────────────────────
    public function submit(ViaticosRequest $request): ViaticosRequest
    {
        return DB::transaction(function () use ($request) {
            // Determine approver: pick first available approver in the same department or any admin
            $approver = User::approvers()
                ->active()
                ->where('department', $request->user->department)
                ->first()
                ?? User::approvers()->active()->first();

            $request->update([
                'status'               => ViaticosRequest::STATUS_PENDING,
                'assigned_approver_id' => $approver?->id,
                'submitted_at'         => now(),
            ]);

            // Log the approval event
            Approval::create([
                'request_id'  => $request->id,
                'approver_id' => auth()->id(),
                'action'      => 'submitted',
                'from_status' => ViaticosRequest::STATUS_DRAFT,
                'to_status'   => ViaticosRequest::STATUS_PENDING,
                'acted_at'    => now(),
            ]);

            AuditLog::record(
                'request.submitted',
                auth()->id(),
                $request->id,
                description: "Solicitud {$request->folio} enviada a aprobación",
            );

            // Notify requester
            $this->notificationService->notify(
                $request->user,
                $request,
                'submitted',
                'Solicitud enviada',
                "Tu solicitud {$request->folio} fue enviada y está pendiente de revisión.",
            );

            // Notify approver
            if ($approver) {
                $this->notificationService->notify(
                    $approver,
                    $request,
                    'submitted',
                    'Nueva solicitud pendiente',
                    "{$request->user->name} envió la solicitud {$request->folio} para tu aprobación.",
                );
            }

            return $request->fresh(['user', 'assignedApprover', 'files', 'approvals']);
        });
    }

    // ─── Approve ──────────────────────────────────────────────────────────────
    public function approve(ViaticosRequest $request, User $approver, ?string $comment = null): ViaticosRequest
    {
        return DB::transaction(function () use ($request, $approver, $comment) {
            $oldStatus = $request->status;

            $request->update([
                'status'      => ViaticosRequest::STATUS_APPROVED,
                'resolved_at' => now(),
            ]);

            Approval::create([
                'request_id'  => $request->id,
                'approver_id' => $approver->id,
                'action'      => 'approved',
                'comment'     => $comment,
                'from_status' => $oldStatus,
                'to_status'   => ViaticosRequest::STATUS_APPROVED,
                'acted_at'    => now(),
            ]);

            AuditLog::record(
                'request.approved',
                $approver->id,
                $request->id,
                description: "Solicitud {$request->folio} aprobada por {$approver->name}",
            );

            $this->notificationService->notify(
                $request->user,
                $request,
                'approved',
                '✅ Solicitud aprobada',
                "Tu solicitud {$request->folio} fue aprobada por {$approver->name}." .
                ($comment ? " Comentario: {$comment}" : ''),
            );

            return $request->fresh();
        });
    }

    // ─── Reject ───────────────────────────────────────────────────────────────
    public function reject(ViaticosRequest $request, User $approver, string $comment): ViaticosRequest
    {
        return DB::transaction(function () use ($request, $approver, $comment) {
            $oldStatus = $request->status;

            $request->update([
                'status'      => ViaticosRequest::STATUS_REJECTED,
                'resolved_at' => now(),
            ]);

            Approval::create([
                'request_id'  => $request->id,
                'approver_id' => $approver->id,
                'action'      => 'rejected',
                'comment'     => $comment,
                'from_status' => $oldStatus,
                'to_status'   => ViaticosRequest::STATUS_REJECTED,
                'acted_at'    => now(),
            ]);

            AuditLog::record(
                'request.rejected',
                $approver->id,
                $request->id,
                description: "Solicitud {$request->folio} rechazada. Motivo: {$comment}",
            );

            $this->notificationService->notify(
                $request->user,
                $request,
                'rejected',
                '❌ Solicitud rechazada',
                "Tu solicitud {$request->folio} fue rechazada. Motivo: {$comment}",
            );

            return $request->fresh();
        });
    }

    // ─── Add Comment ──────────────────────────────────────────────────────────
    public function addComment(ViaticosRequest $request, User $approver, string $comment): Approval
    {
        $approval = Approval::create([
            'request_id'  => $request->id,
            'approver_id' => $approver->id,
            'action'      => 'comment',
            'comment'     => $comment,
            'from_status' => $request->status,
            'to_status'   => $request->status,
            'acted_at'    => now(),
        ]);

        $this->notificationService->notify(
            $request->user,
            $request,
            'comment',
            'Nuevo comentario',
            "{$approver->name} comentó en tu solicitud {$request->folio}: \"{$comment}\"",
        );

        AuditLog::record('request.commented', $approver->id, $request->id, description: "Comentario añadido a {$request->folio}");

        return $approval;
    }

    // ─── Dashboard Stats ──────────────────────────────────────────────────────
    public function statsForUser(User $user): array
    {
        $base = ViaticosRequest::forUser($user->id);
        return [
            'active'        => (clone $base)->whereIn('status', ['draft','pending','in_review'])->count(),
            'pending'       => (clone $base)->where('status', 'pending')->count(),
            'approved_month'=> (clone $base)->where('status', 'approved')->whereMonth('resolved_at', now()->month)->count(),
            'rejected_month'=> (clone $base)->where('status', 'rejected')->whereMonth('resolved_at', now()->month)->count(),
        ];
    }

    public function statsForApprover(User $approver): array
    {
        $base = ViaticosRequest::forApprover($approver->id);
        return [
            'pending'        => (clone $base)->where('status', 'pending')->count(),
            'in_review'      => (clone $base)->where('status', 'in_review')->count(),
            'approved_month' => (clone $base)->where('status', 'approved')->whereMonth('resolved_at', now()->month)->count(),
            'rejected_month' => (clone $base)->where('status', 'rejected')->whereMonth('resolved_at', now()->month)->count(),
        ];
    }
}
