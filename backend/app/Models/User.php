<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'name','email','password','role','department','position',
        'employee_code','avatar_path','is_active','last_login_at',
    ];
    protected $hidden = ['password','remember_token'];
    protected $casts  = [
        'email_verified_at' => 'datetime',
        'last_login_at'     => 'datetime',
        'is_active'         => 'boolean',
        'password'          => 'hashed',
    ];

    public function isAdmin():    bool { return $this->role === 'admin'; }
    public function isApprover(): bool { return in_array($this->role, ['admin','approver']); }

    public function requests()         { return $this->hasMany(Request::class, 'user_id'); }
    public function assignedRequests() { return $this->hasMany(Request::class, 'assigned_approver_id'); }
    public function approvals()        { return $this->hasMany(Approval::class, 'approver_id'); }
    public function appNotifications() { return $this->hasMany(AppNotification::class, 'user_id'); }
    public function pushSubscriptions(){ return $this->hasMany(PushSubscription::class, 'user_id'); }
    public function auditLogs()        { return $this->hasMany(AuditLog::class, 'user_id'); }

    public function scopeActive($q)    { return $q->where('is_active', true); }
    public function scopeApprovers($q) { return $q->whereIn('role', ['admin','approver']); }
}
