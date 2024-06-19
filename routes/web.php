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
    $ios = env('CUTS_IOS_DOWNLOAD_LINK', null);
    $android = env('CUTS_ANDROID_DOWNLOAD_LINK', null);
    $link_count = ($ios == null ? 0 : 1) + ($android == null ? 0 : 1);
    return view('index', [
        'ios_link' => $ios,
        'android_link' => $android,
        'link_count' => $link_count,
    ]);
});

Route::get('/tos.html', function () {
    return view('tos');
});

Route::get('/privacy-policy.html', function () {
    return view('privacy');
});

Route::get('/planner', function (Request $request) {
  $year = intval($request->input('year')) ?: env('CUTS_DATA_LATEST_YEAR', 2023);
  $term = intval($request->input('term')) ?: 1;
  return view('planner', [
    'year' => $year,
    'term' => $term,
  ]);
});
