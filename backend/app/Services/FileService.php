<?php
// app/Services/FileService.php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\Request as ViaticosRequest;
use App\Models\UploadedFile;
use App\Models\User;
use Illuminate\Http\UploadedFile as LaravelFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FileService
{
    private const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'application/pdf'];
    private const MAX_BYTES     = 5 * 1024 * 1024; // 5 MB

    /**
     * Validate and persist one uploaded file, return the UploadedFile model.
     */
    public function store(ViaticosRequest $request, User $uploader, LaravelFile $file, string $category = 'factura'): UploadedFile
    {
        // Runtime validation (request validation should catch these first)
        abort_if(!in_array($file->getMimeType(), self::ALLOWED_MIMES), 422, 'Formato de archivo no permitido.');
        abort_if($file->getSize() > self::MAX_BYTES, 422, 'El archivo supera el límite de 5 MB.');

        $storedName = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $directory  = 'uploads/' . $request->folio;
        $path       = $file->storeAs($directory, $storedName, 'local');

        $model = UploadedFile::create([
            'request_id'    => $request->id,
            'uploaded_by'   => $uploader->id,
            'original_name' => $file->getClientOriginalName(),
            'stored_name'   => $storedName,
            'path'          => $path,
            'disk'          => 'local',
            'mime_type'     => $file->getMimeType(),
            'size_bytes'    => $file->getSize(),
            'category'      => $category,
        ]);

        AuditLog::record(
            'file.uploaded',
            $uploader->id,
            $request->id,
            ['new_values' => ['file' => $file->getClientOriginalName(), 'size' => $file->getSize()]],
            "Archivo {$file->getClientOriginalName()} adjuntado a {$request->folio}",
        );

        return $model;
    }

    /**
     * Soft-delete a file and remove it from disk.
     */
    public function delete(UploadedFile $uploadedFile, User $user): void
    {
        Storage::disk($uploadedFile->disk)->delete($uploadedFile->path);
        $uploadedFile->delete();

        AuditLog::record(
            'file.deleted',
            $user->id,
            $uploadedFile->request_id,
            description: "Archivo {$uploadedFile->original_name} eliminado",
        );
    }
}
