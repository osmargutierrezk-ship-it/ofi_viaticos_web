<?php

use Illuminate\Support\Facades\Route;

Route::get('/up', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now(),
    ]);
});

Route::get('/', function () {
    return response()->json([
        'app' => 'OFI Backend Running',
    ]);
});

Route::fallback(function () {
    return response()->json([
        'message' => 'Use the /api prefix.',
    ], 404);
});