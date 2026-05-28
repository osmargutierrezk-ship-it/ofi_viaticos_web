<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        abort_unless($request->user()->isAdmin(),403);
        $query = AuditLog::with('user')->orderByDesc('created_at');
        if ($a = $request->query('action'))     $query->where('action',$a);
        if ($u = $request->query('user_id'))    $query->where('user_id',$u);
        if ($r = $request->query('request_id')) $query->where('request_id',$r);
        return response()->json($query->paginate(50));
    }
    public function forRequest(Request $request, int $requestId): JsonResponse
    {
        abort_unless($request->user()->isApprover(),403);
        return response()->json(AuditLog::with('user')->where('request_id',$requestId)->orderByDesc('created_at')->get());
    }
}
