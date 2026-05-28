<?php
use Illuminate\Support\Facades\Route;
Route::get('/up', fn() => response()->json(['status'=>'ok','timestamp'=>now()]));
Route::fallback(fn() => response()->json(['message'=>'Use the /api prefix.'], 404));
