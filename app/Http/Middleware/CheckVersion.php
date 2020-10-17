<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckVersion
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next, $requiredAndroidVersion, $requiredIosVersion)
    {
        $appPlatform = $request->header('X-Platform');
        $appVersion = $request->header('X-App-Version');
        if ($appPlatform === 'android' && version_compare($appVersion, $requiredAndroidVersion, '<')) {
            return response()->json(["message" => "Bad Request. Please update your App to use this function."], 400);
        }
        if ($appPlatform === 'ios' && version_compare($appVersion, $requiredIosVersion, '<')) {
            return response()->json(["message" => "Bad Request. Please update your App to use this function."], 400);
        }
        return $next($request);
    }
}
