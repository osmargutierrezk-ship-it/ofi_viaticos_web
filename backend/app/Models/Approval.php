<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Approval extends Model
{
    protected $fillable = ['request_id','approver_id','action','comment','from_status','to_status','acted_at'];
    protected $casts = ['acted_at'=>'datetime'];
    public function request()  { return $this->belongsTo(Request::class); }
    public function approver() { return $this->belongsTo(User::class,'approver_id'); }
    public function getActionLabelAttribute(): string {
        return match($this->action) {
            'submitted'=>'Enviada a revisión','in_review'=>'Tomada en revisión',
            'approved'=>'Aprobada','rejected'=>'Rechazada','comment'=>'Comentario añadido',
            default=>$this->action,
        };
    }
}
