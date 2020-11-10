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

## Updating course information

- Put the file `YYYY_yyyymmdd_hhmm.txt` in `storage/app/data/` folder
- Execute `docker-compose exec workspace php artisan update:courses /var/www/storage/app/data/YYYY_yyyymmdd_hhmm.txt`

## Certbot cert installation

- Modify the `environment` of `certbot` section in `docker-compose.yml`
- Do not use `"` for safety unless strictly necessary
- Add volume mounting for nginx for acme-challenge folder (referring to setup in nginx default.conf)
- Add `/etc/letsencrypt` volume mounting for `certbot` container
- run `docker-compose up -d certbot`

## Nginx config

- Create custom nginx config at `laradock/nginx/sites/default.conf`

## Database backup

https://github.com/spatie/laravel-backup

Fill in s3 variables in .env

```
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=
AWS_BUCKET=
SLACK_WEBHOOK_URL=
```

Execute backup (once):

```
docker-compose exec workspace php artisan backup:run --only-db
```

## Changes made to docker-compose

```
Add database variables
Set `WORKSPACE_INSTALL_MYSQL_CLIENT` to `true`
```
