<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class AppNotification extends Model
{
    protected $table = 'notifications';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['id','user_id','request_id','title','body','type','read','data','read_at'];
    protected $casts = ['read'=>'boolean','data'=>'array','read_at'=>'datetime'];

    protected static function boot() {
        parent::boot();
        static::creating(fn($m) => $m->id = (string) Str::uuid());
    }
    public function user()    { return $this->belongsTo(User::class); }
    public function request() { return $this->belongsTo(Request::class); }
    public function markAsRead(): void { $this->update(['read'=>true,'read_at'=>now()]); }
}
