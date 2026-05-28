<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    const UPDATED_AT = null;
    protected $fillable = ['user_id','request_id','action','entity_type','entity_id','old_values','new_values','ip_address','user_agent','description'];
    protected $casts = ['old_values'=>'array','new_values'=>'array'];

    public function user()    { return $this->belongsTo(User::class); }
    public function request() { return $this->belongsTo(Request::class); }

    public static function record(string $action, ?int $userId, ?int $requestId=null, array $payload=[], ?string $description=null): self
    {
        return self::create([
            'action'=>$action,'user_id'=>$userId,'request_id'=>$requestId,
            'description'=>$description,'ip_address'=>request()->ip(),
            'user_agent'=>request()->userAgent(),...$payload,
        ]);
    }
}
