<?php
// app/Policies/RequestPolicy.php

namespace App\Policies;

use App\Models\Request as ViaticosRequest;
use App\Models\User;

class RequestPolicy
{
    /**
     * Admins can do anything.
     */
    public function before(User $user, string $ability): ?bool
    {
        return $user->isAdmin() ? true : null;
    }

    /**
     * Any authenticated active user can list requests.
     * (The controller scopes the query by role.)
     */
    public function viewAny(User $user): bool
    {
        return $user->is_active;
    }

    /**
     * Owner or assigned approver can view a specific request.
     */
    public function view(User $user, ViaticosRequest $request): bool
    {
        return $user->id === $request->user_id
            || $user->id === $request->assigned_approver_id
            || $user->isApprover();
    }

    /**
     * Only the request owner can create/update their own requests.
     */
    public function create(User $user): bool
    {
        return $user->is_active;
    }

    public function update(User $user, ViaticosRequest $request): bool
    {
        // Only owner can edit, and only while still a draft
        return $user->id === $request->user_id
            && $request->status === ViaticosRequest::STATUS_DRAFT;
    }

    /**
     * Owner can submit their own draft.
     */
    public function submit(User $user, ViaticosRequest $request): bool
    {
        return $user->id === $request->user_id
            && $request->status === ViaticosRequest::STATUS_DRAFT;
    }

    /**
     * Only approvers/admins may approve or reject.
     * The request must be in a pending/in_review state.
     */
    public function approve(User $user, ViaticosRequest $request): bool
    {
        return $user->isApprover()
            && in_array($request->status, [
                ViaticosRequest::STATUS_PENDING,
                ViaticosRequest::STATUS_IN_REVIEW,
            ]);
    }

    /**
     * Owner can delete their own drafts.
     */
    public function delete(User $user, ViaticosRequest $request): bool
    {
        return $user->id === $request->user_id
            && $request->status === ViaticosRequest::STATUS_DRAFT;
    }
}
