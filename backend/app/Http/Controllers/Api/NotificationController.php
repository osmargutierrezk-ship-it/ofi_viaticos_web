<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\AppNotification;
use App\Models\PushSubscription;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function __construct(private readonly NotificationService $notificationService) {}

    public function index(Request $request): JsonResponse
    {
        $notifs = AppNotification::where('user_id',$request->user()->id)->orderByDesc('created_at')->paginate(20);
        return response()->json([...$notifs->toArray(),'unread_count'=>$this->notificationService->unreadCount($request->user())]);
    }
    public function markAllRead(Request $request): JsonResponse
    {
        return response()->json(['marked'=>$this->notificationService->markRead($request->user())]);
    }
    public function markRead(Request $request, string $id): JsonResponse
    {
        $this->notificationService->markRead($request->user(),$id);
        return response()->json(['ok'=>true]);
    }
    public function subscribe(Request $request): JsonResponse
    {
        $data = $request->validate(['endpoint'=>'required|url','p256dh_key'=>'required|string','auth_key'=>'required|string']);
        PushSubscription::updateOrCreate(['endpoint'=>$data['endpoint']],['user_id'=>$request->user()->id,...$data,'user_agent'=>$request->userAgent()]);
        return response()->json(['subscribed'=>true],201);
    }
    public function unsubscribe(Request $request): JsonResponse
    {
        $data = $request->validate(['endpoint'=>'required|url']);
        PushSubscription::where('user_id',$request->user()->id)->where('endpoint',$data['endpoint'])->delete();
        return response()->json(['unsubscribed'=>true]);
    }
}
