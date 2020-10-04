# CUTS (backend)

## Tech stack

- nginx
- php7.3
- laravel
- MySQL

## Setup

```
git submodule init # laradock as submodule
git submodule update

cp .env-example .env
# also set APP_KEY in the .env file (32-character string)
cd laradock
# modify variables as setup, esp matching mysql password with laradock
cp env-example .env

# ensure nothing is using ports 3306 for mysql and 80 for nginx
# beware of port setting if it is changed, e.g. internally config should use 3306 for connecting to mysql container even if it exposed 3307
docker-compose up -d nginx mysql

# run composer install within container
# necessary?
docker-compose exec workspace bash
composer install # should be in /var/www folder with composer.json

# verify it works by going to http://localhost (should show Laravel page)
```

## Database Migration

```
# initial setup
docker-compose exec workspace php artisan migrate:fresh
```

## Deployment

In laradock folder, in `.env` set `WORKSPACE_INSTALL_DEPLOYER` to `true`.
Run `docker-compose build workspace` if necessary to reflect changes

Note: all environment variables should also be added to the `laradock/.env`, e.g. `DB_xxx`, `AUTH0_xxx`. These should be added in `docker-compose.yml` as environment variable for `workspace`, in order to be able for `workspace` container to have theses environment variables defined properly.
