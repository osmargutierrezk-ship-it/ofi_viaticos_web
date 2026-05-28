<?php

namespace Database\Seeders;

use App\Models\Approval;
use App\Models\AppNotification;
use App\Models\Request as ViaticosRequest;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── Users ─────────────────────────────────────────────────────────────

        $admin = User::updateOrCreate(
            ['email' => 'admin@olam.com'],
            [
                'name'          => 'Administrador OFI',
                'password'      => Hash::make('password'),
                'role'          => 'admin',
                'department'    => 'TI',
                'position'      => 'Administrador del Sistema',
                'employee_code' => 'EMP-0001',
                'is_active'     => true,
            ]
        );

        $approver = User::updateOrCreate(
            ['email' => 'gerente.finanzas@olam.com'],
            [
                'name'          => 'Gerente Finanzas',
                'password'      => Hash::make('password'),
                'role'          => 'approver',
                'department'    => 'Finanzas',
                'position'      => 'Gerente de Finanzas',
                'employee_code' => 'EMP-0002',
                'is_active'     => true,
            ]
        );

        $osmar = User::updateOrCreate(
            ['email' => 'osmar@olam.com'],
            [
                'name'          => 'Osmar Gómez',
                'password'      => Hash::make('password'),
                'role'          => 'user',
                'department'    => 'Contabilidad',
                'position'      => 'Contador',
                'employee_code' => 'EMP-0010',
                'is_active'     => true,
            ]
        );

        $laura = User::updateOrCreate(
            ['email' => 'laura@olam.com'],
            [
                'name'          => 'Laura Pérez',
                'password'      => Hash::make('password'),
                'role'          => 'user',
                'department'    => 'Ventas',
                'position'      => 'Ejecutiva de Ventas',
                'employee_code' => 'EMP-0011',
                'is_active'     => true,
            ]
        );

        // ── Requests ──────────────────────────────────────────────────────────

        // 1. Draft viáticos (Osmar)

        $req1 = ViaticosRequest::updateOrCreate(
            ['folio' => 'VIA-2024-089'],
            [
                'user_id'               => $osmar->id,
                'assigned_approver_id' => $approver->id,
                'type'                  => 'viaticos',
                'status'                => 'pending',
                'destination'           => 'Monterrey, Nuevo León',
                'travel_start'          => '2024-05-20',
                'travel_end'            => '2024-05-23',
                'purpose'               => 'Visita a cliente',
                'cost_center'           => 'CC-2100 - Ventas Industriales',
                'reason'                => 'Visita a cliente para negociación de contrato anual de suministro. Reuniones con el equipo de compras.',
                'received_advance'      => true,
                'advance_amount'        => 5000.00,
                'advance_date'          => '2024-05-17',
                'advance_folio'         => 'ANT-2024-0456',
                'submitted_at'          => now()->subDays(1),
            ]
        );

        // 2. Approved payment (Laura)

        $req2 = ViaticosRequest::updateOrCreate(
            ['folio' => 'PAG-2024-041'],
            [
                'user_id'               => $laura->id,
                'assigned_approver_id' => $approver->id,
                'type'                  => 'pago',
                'status'                => 'approved',
                'payment_amount'        => 12500.00,
                'payment_concept'       => 'Proveedor de servicios logísticos — Mayo 2024',
                'payment_beneficiary'   => 'Transportes del Norte S.A.',
                'submitted_at'          => now()->subDays(3),
                'resolved_at'           => now()->subDays(1),
            ]
        );

        Approval::updateOrCreate(
            [
                'request_id'  => $req2->id,
                'approver_id' => $approver->id,
            ],
            [
                'action'      => 'approved',
                'comment'     => 'Documentación completa. Pago autorizado.',
                'from_status' => 'pending',
                'to_status'   => 'approved',
                'acted_at'    => now()->subDays(1),
            ]
        );

        // 3. Rejected viáticos (Osmar)

        $req3 = ViaticosRequest::updateOrCreate(
            ['folio' => 'VIA-2024-082'],
            [
                'user_id'               => $osmar->id,
                'assigned_approver_id' => $approver->id,
                'type'                  => 'viaticos',
                'status'                => 'rejected',
                'destination'           => 'Ciudad de México',
                'travel_start'          => '2024-05-10',
                'travel_end'            => '2024-05-12',
                'purpose'               => 'Capacitación',
                'reason'                => 'Asistencia a taller de finanzas corporativas.',
                'received_advance'      => false,
                'submitted_at'          => now()->subDays(8),
                'resolved_at'           => now()->subDays(6),
            ]
        );

        Approval::updateOrCreate(
            [
                'request_id'  => $req3->id,
                'approver_id' => $approver->id,
            ],
            [
                'action'      => 'rejected',
                'comment'     => 'Falta comprobante de inscripción al taller. Favor de reenviar con documentación completa.',
                'from_status' => 'pending',
                'to_status'   => 'rejected',
                'acted_at'    => now()->subDays(6),
            ]
        );

        // ── Notifications ─────────────────────────────────────────────────────

        AppNotification::updateOrCreate(
            [
                'user_id' => $osmar->id,
                'title'   => '❌ Solicitud rechazada',
            ],
            [
                'request_id' => $req3->id,
                'body'       => 'Tu solicitud VIA-2024-082 fue rechazada. Falta comprobante de inscripción.',
                'type'       => 'rejected',
                'read'       => false,
            ]
        );

        AppNotification::updateOrCreate(
            [
                'user_id' => $approver->id,
                'title'   => 'Nueva solicitud pendiente',
            ],
            [
                'request_id' => $req1->id,
                'body'       => 'Osmar Gómez envió VIA-2024-089 para tu aprobación.',
                'type'       => 'submitted',
                'read'       => false,
            ]
        );

        $this->command->info(
            '✅ Seeder completado: 4 usuarios, 3 solicitudes y notificaciones de ejemplo.'
        );
    }
}