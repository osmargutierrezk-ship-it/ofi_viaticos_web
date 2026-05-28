<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Request as VRequest;
use App\Services\RequestService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RequestController extends Controller
{
    public function __construct(private readonly RequestService $service) {}

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = $user->isApprover()
            ? VRequest::with(['user','assignedApprover'])
            : VRequest::forUser($user->id)->with(['user']);
        if ($s = $request->query('status')) $query->where('status',$s);
        if ($t = $request->query('type'))   $query->where('type',$t);
        if ($q = $request->query('q'))
            $query->where(fn($q2)=>$q2->where('folio','ilike',"%{$q}%")->orWhereHas('user',fn($u)=>$u->where('name','ilike',"%{$q}%")));
        return response()->json($query->orderByDesc('created_at')->paginate($request->integer('per_page',15)));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'type'            =>'required|in:viaticos,pago,anticipo',
            'destination'     =>'required_if:type,viaticos|nullable|string|max:255',
            'travel_start'    =>'required_if:type,viaticos|nullable|date',
            'travel_end'      =>'required_if:type,viaticos|nullable|date|after_or_equal:travel_start',
            'purpose'         =>'required_if:type,viaticos|nullable|string|max:255',
            'cost_center'     =>'nullable|string|max:100',
            'reason'          =>'required_if:type,viaticos|nullable|string|max:1000',
            'received_advance'=>'boolean',
            'advance_amount'  =>'required_if:received_advance,true|nullable|numeric|min:0',
            'advance_date'    =>'required_if:received_advance,true|nullable|date',
            'advance_folio'   =>'required_if:received_advance,true|nullable|string',
            'payment_amount'  =>'required_if:type,pago|nullable|numeric|min:0',
            'payment_concept' =>'required_if:type,pago|nullable|string|max:500',
            'notes'           =>'nullable|string|max:2000',
        ]);
        return response()->json($this->service->create($request->user(),$data)->load(['user','files']),201);
    }

    public function show(VRequest $request): JsonResponse
    {
        $this->authorize('view',$request);
        return response()->json($request->load(['user','assignedApprover','files','approvals.approver']));
    }

    public function update(Request $request, VRequest $vRequest): JsonResponse
    {
        $this->authorize('update',$vRequest);
        abort_if($vRequest->status !== VRequest::STATUS_DRAFT,422,'Solo se pueden editar borradores.');
        $data = $request->validate([
            'destination'     =>'nullable|string|max:255',
            'travel_start'    =>'nullable|date',
            'travel_end'      =>'nullable|date|after_or_equal:travel_start',
            'purpose'         =>'nullable|string|max:255',
            'cost_center'     =>'nullable|string|max:100',
            'reason'          =>'nullable|string|max:1000',
            'received_advance'=>'boolean',
            'advance_amount'  =>'nullable|numeric|min:0',
            'advance_date'    =>'nullable|date',
            'advance_folio'   =>'nullable|string',
            'notes'           =>'nullable|string|max:2000',
        ]);
        return response()->json($this->service->update($vRequest,$data));
    }

    public function submit(VRequest $request): JsonResponse
    {
        $this->authorize('submit',$request);
        abort_if($request->status !== VRequest::STATUS_DRAFT,422,'La solicitud ya fue enviada.');
        return response()->json($this->service->submit($request));
    }

    public function destroy(VRequest $request): JsonResponse
    {
        $this->authorize('delete',$request);
        abort_if($request->status !== VRequest::STATUS_DRAFT,422,'No se puede eliminar una solicitud enviada.');
        $request->delete();
        return response()->json(['message'=>'Solicitud eliminada.']);
    }

    public function stats(Request $request): JsonResponse
    {
        $user = $request->user();
        $stats = $user->isApprover()
            ? $this->service->statsForApprover($user)
            : $this->service->statsForUser($user);
        return response()->json($stats);
    }
}
