<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Request extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'folio','user_id','assigned_approver_id','type','status',
        'destination','travel_start','travel_end','purpose','cost_center','reason',
        'received_advance','advance_amount','advance_date','advance_folio',
        'payment_amount','payment_concept','payment_beneficiary','bank_account',
        'total_expenses','balance','submitted_at','reviewed_at','resolved_at','notes',
    ];
    protected $casts = [
        'travel_start'    =>'date','travel_end'=>'date','advance_date'=>'date',
        'received_advance'=>'boolean',
        'advance_amount'  =>'decimal:2','payment_amount'=>'decimal:2',
        'total_expenses'  =>'decimal:2','balance'=>'decimal:2',
        'submitted_at'    =>'datetime','reviewed_at'=>'datetime','resolved_at'=>'datetime',
    ];

    const STATUS_DRAFT     = 'draft';
    const STATUS_PENDING   = 'pending';
    const STATUS_IN_REVIEW = 'in_review';
    const STATUS_APPROVED  = 'approved';
    const STATUS_REJECTED  = 'rejected';
    const TYPE_VIATICOS    = 'viaticos';
    const TYPE_PAGO        = 'pago';
    const TYPE_ANTICIPO    = 'anticipo';

    public static function generateFolio(string $type): string
    {
        $prefix = match($type) {
            self::TYPE_VIATICOS=>'VIA', self::TYPE_PAGO=>'PAG',
            self::TYPE_ANTICIPO=>'ANT', default=>'SOL',
        };
        $count = self::where('type',$type)->whereYear('created_at',now()->year)->count()+1;
        return sprintf('%s-%d-%03d', $prefix, now()->year, $count);
    }

    public function getTravelDaysAttribute(): int
    {
        if (!$this->travel_start || !$this->travel_end) return 0;
        return $this->travel_start->diffInDays($this->travel_end) + 1;
    }
    public function getStatusLabelAttribute(): string
    {
        return match($this->status) {
            self::STATUS_DRAFT=>'Borrador', self::STATUS_PENDING=>'Pendiente',
            self::STATUS_IN_REVIEW=>'En revisión', self::STATUS_APPROVED=>'Aprobado',
            self::STATUS_REJECTED=>'Rechazado', default=>'Desconocido',
        };
    }
    public function getTypeLabelAttribute(): string
    {
        return match($this->type) {
            self::TYPE_VIATICOS=>'Viáticos y gastos', self::TYPE_PAGO=>'Solicitud de pago',
            self::TYPE_ANTICIPO=>'Solicitud de anticipo', default=>'Solicitud',
        };
    }

    public function user()            { return $this->belongsTo(User::class,'user_id'); }
    public function assignedApprover(){ return $this->belongsTo(User::class,'assigned_approver_id'); }
    public function approvals()       { return $this->hasMany(Approval::class)->orderBy('acted_at','desc'); }
    public function files()           { return $this->hasMany(UploadedFile::class)->whereNull('deleted_at'); }
    public function appNotifications(){ return $this->hasMany(AppNotification::class); }
    public function auditLogs()       { return $this->hasMany(AuditLog::class); }

    public function scopePendingApproval($q)        { return $q->whereIn('status',[self::STATUS_PENDING,self::STATUS_IN_REVIEW]); }
    public function scopeForApprover($q, int $id)   { return $q->where('assigned_approver_id',$id); }
    public function scopeForUser($q, int $id)        { return $q->where('user_id',$id); }
}
