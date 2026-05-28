<?php
namespace App\Providers;
use App\Models\Request as VRequest;
use App\Policies\RequestPolicy;
use App\Services\FileService;
use App\Services\NotificationService;
use App\Services\RequestService;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Bind services as singletons
        $this->app->singleton(NotificationService::class);
        $this->app->singleton(FileService::class);
        $this->app->singleton(RequestService::class, function ($app) {
            return new RequestService(
                $app->make(NotificationService::class),
                $app->make(FileService::class),
            );
        });
    }

    public function boot(): void
    {
        // Register request policy
        Gate::policy(VRequest::class, RequestPolicy::class);
    }
}
