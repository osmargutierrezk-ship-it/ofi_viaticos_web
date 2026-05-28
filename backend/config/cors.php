<?php
// config/cors.php
// Allows the React frontend (deployed separately on Render) to communicate
// with the Laravel API through the browser.

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Allowed origins are read from FRONTEND_URL env variable so the same
    | codebase works in local dev (localhost:5173) and production (Render URL).
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        env('FRONTEND_URL', 'http://localhost:5173'),
        'http://localhost:3000',
        'http://localhost:5173',
    ],

    'allowed_origins_patterns' => [
        '/^https:\/\/.*\.onrender\.com$/', // Allow any *.onrender.com subdomain
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => ['X-Total-Count'],

    'max_age' => 86400, // 24 hours — browsers cache preflight

    'supports_credentials' => true,
];
