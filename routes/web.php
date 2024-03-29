<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return view('index');
});

Route::get('/tos.html', function () {
    return view('tos');
});

Route::get('/privacy-policy.html', function () {
    return view('privacy');
});

Route::get('/planner', function (Request $request) {
  $year = intval($request->input('year')) ?: env('CUTS_DATA_LATEST_YEAR', 2021);
  $term = intval($request->input('term')) ?: 1;
  return view('planner', [
    'year' => $year,
    'term' => $term,
  ]);
});
