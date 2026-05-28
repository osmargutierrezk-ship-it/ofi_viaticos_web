<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class UploadedFile extends Model
{
    use SoftDeletes;
    protected $table = 'uploaded_files';
    protected $fillable = ['request_id','uploaded_by','original_name','stored_name','path','disk','mime_type','size_bytes','category','is_valid','validation_note'];
    protected $casts = ['is_valid'=>'boolean','size_bytes'=>'integer'];
    protected $appends = ['formatted_size','is_image','is_pdf'];

    public function request()    { return $this->belongsTo(Request::class); }
    public function uploadedBy() { return $this->belongsTo(User::class,'uploaded_by'); }
    public function getFormattedSizeAttribute(): string {
        $kb = $this->size_bytes / 1024;
        return $kb >= 1024 ? number_format($kb/1024,1).' MB' : number_format($kb,0).' KB';
    }
    public function getIsImageAttribute(): bool { return str_starts_with($this->mime_type,'image/'); }
    public function getIsPdfAttribute(): bool   { return $this->mime_type === 'application/pdf'; }
}
