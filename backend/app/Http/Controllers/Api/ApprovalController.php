<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Request as VRequest;
use App\Services\RequestService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ApprovalController extends Controller
{
    public function __construct(private readonly RequestService $service) {}

    public function approve(Request $request, VRequest $vRequest): JsonResponse
    {
        $this->authorize('approve',$vRequest);
        $data = $request->validate(['comment'=>'nullable|string|max:1000']);
        return response()->json($this->service->approve($vRequest,$request->user(),$data['comment']??null));
    }
    public function reject(Request $request, VRequest $vRequest): JsonResponse
    {
        $this->authorize('approve',$vRequest);
        $data = $request->validate(['comment'=>'required|string|max:1000']);
        return response()->json($this->service->reject($vRequest,$request->user(),$data['comment']));
    }
    public function comment(Request $request, VRequest $vRequest): JsonResponse
    {
        $this->authorize('approve',$vRequest);
        $data = $request->validate(['comment'=>'required|string|max:1000']);
        return response()->json($this->service->addComment($vRequest,$request->user(),$data['comment'])->load('approver'));
    }
    public function history(VRequest $request): JsonResponse
    {
        $this->authorize('view',$request);
        return response()->json($request->approvals()->with('approver')->get());
    }
}
