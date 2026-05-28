<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Request as VRequest;
use App\Models\UploadedFile;
use App\Services\FileService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FileController extends Controller
{
    public function __construct(private readonly FileService $fileService) {}

    public function store(Request $request, VRequest $vRequest): JsonResponse
    {
        $this->authorize('update',$vRequest);
        $data = $request->validate(['file'=>'required|file|mimes:jpg,jpeg,png,pdf|max:5120','category'=>'nullable|in:factura,comprobante,otro']);
        return response()->json($this->fileService->store($vRequest,$request->user(),$data['file'],$data['category']??'factura'),201);
    }
    public function destroy(Request $request, UploadedFile $uploadedFile): JsonResponse
    {
        $this->authorize('update',$uploadedFile->request);
        $this->fileService->delete($uploadedFile,$request->user());
        return response()->json(['message'=>'Archivo eliminado.']);
    }
}
