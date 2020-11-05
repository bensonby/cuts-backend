<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\UserCourse;
use App\Observers\UserCourseObserver;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        $this->app->bind(
            \Auth0\Login\Contract\Auth0UserRepository::class,
            \App\Repositories\CustomUserRepository::class
        );
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
      UserCourse::observe(UserCourseObserver::class);
    }
}
