<?php
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->api(prepend: [
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);
        $middleware->alias([
            'role' => \App\Http\Middleware\CheckRole::class,
        ]);
        $middleware->trustProxies(headers: Request::HEADER_X_FORWARDED_FOR |
            Request::HEADER_X_FORWARDED_HOST | Request::HEADER_X_FORWARDED_PORT |
            Request::HEADER_X_FORWARDED_PROTO | Request::HEADER_X_FORWARDED_AWS_ELB);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (\Throwable $e, Request $request) {
            if ($request->is('api/*')) {
                if ($e instanceof ValidationException)
                    return response()->json(['message'=>'Datos no válidos.','errors'=>$e->errors()], 422);
                if ($e instanceof NotFoundHttpException)
                    return response()->json(['message'=>'Recurso no encontrado.'], 404);
                if ($e instanceof \Illuminate\Auth\AuthenticationException)
                    return response()->json(['message'=>'No autenticado.'], 401);
                if ($e instanceof \Illuminate\Auth\Access\AuthorizationException)
                    return response()->json(['message'=>'No autorizado.'], 403);
                return response()->json(['message'=>config('app.debug')?$e->getMessage():'Error interno.'], 500);
            }
        });
    })->create();
