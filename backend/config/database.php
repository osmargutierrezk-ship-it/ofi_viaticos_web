<?php
// config/database.php  (only the pgsql connection shown — merge into Laravel default)
//
// Render provides these env vars automatically when you attach a PostgreSQL
// database to your service: PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD.

return [

    'default' => env('DB_CONNECTION', 'pgsql'),

    'connections' => [

        'pgsql' => [
            'driver'         => 'pgsql',
            'url'            => env('DATABASE_URL'),          // Render also sets DATABASE_URL
            'host'           => env('DB_HOST', env('PGHOST', '127.0.0.1')),
            'port'           => env('DB_PORT', env('PGPORT', '5432')),
            'database'       => env('DB_DATABASE', env('PGDATABASE', 'forge')),
            'username'       => env('DB_USERNAME', env('PGUSER', 'forge')),
            'password'       => env('DB_PASSWORD', env('PGPASSWORD', '')),
            'charset'        => 'utf8',
            'prefix'         => '',
            'prefix_indexes' => true,
            'search_path'    => 'public',
            'sslmode'        => env('DB_SSLMODE', 'require'), // Required for Render hosted PG

            // Connection pool — Render free tier allows ~97 connections
            'options' => extension_loaded('pdo_pgsql') ? array_filter([
                PDO::ATTR_PERSISTENT         => false,
                PDO::ATTR_TIMEOUT            => 10,
                PDO::ATTR_EMULATE_PREPARES   => false,
                PDO::ATTR_STRINGIFY_FETCHES  => false,
            ]) : [],
        ],

    ],

    'migrations' => [
        'table'                  => 'migrations',
        'update_date_on_publish' => true,
    ],

    'redis' => [
        'client' => env('REDIS_CLIENT', 'phpredis'),
        'default' => [
            'host'     => env('REDIS_HOST', '127.0.0.1'),
            'password' => env('REDIS_PASSWORD', null),
            'port'     => env('REDIS_PORT', 6379),
            'database' => env('REDIS_DB', 0),
        ],
    ],

];
