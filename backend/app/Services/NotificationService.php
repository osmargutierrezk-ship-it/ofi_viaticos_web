<?php
// app/Services/NotificationService.php

namespace App\Services;

use App\Models\AppNotification;
use App\Models\PushSubscription;
use App\Models\Request as ViaticosRequest;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;

class NotificationService
{
    // ─── Persist + push to browser ───────────────────────────────────────────
    public function notify(
        User $recipient,
        ViaticosRequest $request,
        string $type,
        string $title,
        string $body,
        array $extraData = [],
    ): AppNotification {
        // 1. Persist in DB
        $notification = AppNotification::create([
            'user_id'    => $recipient->id,
            'request_id' => $request->id,
            'type'       => $type,
            'title'      => $title,
            'body'       => $body,
            'data'       => array_merge(['folio' => $request->folio, 'type' => $request->type_label], $extraData),
        ]);

        // 2. Web Push (best-effort, don't fail on push errors)
        try {
            $this->sendWebPush($recipient, $title, $body, [
                'notificationId' => $notification->id,
                'folio'          => $request->folio,
                'requestId'      => $request->id,
            ]);
        } catch (\Throwable $e) {
            Log::warning('Web push failed', ['user' => $recipient->id, 'error' => $e->getMessage()]);
        }

        return $notification;
    }

    // ─── Web Push ─────────────────────────────────────────────────────────────
    private function sendWebPush(User $user, string $title, string $body, array $data = []): void
    {
        $subscriptions = PushSubscription::where('user_id', $user->id)->get();
        if ($subscriptions->isEmpty()) return;

        $auth = [
            'VAPID' => [
                'subject'    => config('services.vapid.subject'),
                'publicKey'  => config('services.vapid.public_key'),
                'privateKey' => config('services.vapid.private_key'),
            ],
        ];

        $webPush = new WebPush($auth);
        $payload = json_encode(['title' => $title, 'body' => $body, 'data' => $data]);

        foreach ($subscriptions as $sub) {
            $webPush->queueNotification(
                Subscription::create([
                    'endpoint' => $sub->endpoint,
                    'keys'     => ['p256dh' => $sub->p256dh_key, 'auth' => $sub->auth_key],
                ]),
                $payload,
            );
        }

        foreach ($webPush->flush() as $report) {
            if ($report->isSubscriptionExpired()) {
                // Remove stale subscriptions
                PushSubscription::where('endpoint', $report->getEndpoint())->delete();
            }
        }
    }

    // ─── Mark as read ─────────────────────────────────────────────────────────
    public function markRead(User $user, ?string $notificationId = null): int
    {
        $query = AppNotification::where('user_id', $user->id)->where('read', false);

        if ($notificationId) {
            $query->where('id', $notificationId);
        }

        return $query->update(['read' => true, 'read_at' => now()]);
    }

    // ─── Unread count ─────────────────────────────────────────────────────────
    public function unreadCount(User $user): int
    {
        return AppNotification::where('user_id', $user->id)->where('read', false)->count();
    }
}
