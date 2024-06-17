<?php
namespace App\Repositories;

use App\Models\User;

use Auth0\Laravel\{UserRepositoryAbstract, UserRepositoryContract};
use Illuminate\Contracts\Auth\Authenticatable;

// https://github.com/auth0/laravel-auth0/blob/main/docs/Users.md#user-repositories
final class CustomUserRepository extends UserRepositoryAbstract implements UserRepositoryContract
{
    public function fromAccessToken(array $user): ?Authenticatable
    {
        /*
            $user = [ // Example of a decoded access token
                "iss"   => "https://example.auth0.com/",
                "aud"   => "https://api.example.com/calendar/v1/",
                "sub"   => "auth0|123456",
                "exp"   => 1458872196,
                "iat"   => 1458785796,
                "scope" => "read write",
            ];
        */

        return $this->upsertUser($user);
    }

    /**
     * Get an existing user or create a new one
     *
     * @param array $profile - Auth0 profile
     *
     * @return User
     */
    protected function upsertUser( $profile ) {  
        return User::firstOrCreate(['sub' => $profile['sub']], [
            'email' => $profile['email'] ?? '',
            'name' => $profile['name'] ?? '',
        ]);
    }

    public function fromSession(array $user): ?Authenticatable
    {
        /*
            $user = [ // Example of a decoded ID token
                "iss"         => "http://example.auth0.com",
                "aud"         => "client_id",
                "sub"         => "auth0|123456",
                "exp"         => 1458872196,
                "iat"         => 1458785796,
                "name"        => "Jane Doe",
                "email"       => "janedoe@example.com",
            ];
        */

        $user = User::updateOrCreate(
            attributes: [
                'auth0' => $user['sub'],
            ],
            values: [
                'name' => $user['name'] ?? '',
                'email' => $user['email'] ?? '',
                'email_verified' => $user['email_verified'] ?? false,
            ]
        );

        return $user;
    }
}
