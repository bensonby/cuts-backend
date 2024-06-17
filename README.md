# CUTS (backend)

## Tech stack

- nginx
- PHP8.3
- laravel
- MySQL

## Setup

```
cp .env-example .env
# also set APP_KEY in the .env file (32-character string)

# ensure nothing is using ports 3306 for mysql and 80 for nginx
# beware of port setting if it is changed, e.g. internally config should use 3306 for connecting to mysql container even if it exposed 3307
docker-compose up -d nginx mysql

# run composer install within container
# necessary?
docker-compose exec workspace bash
composer install # should be in /var/www folder with composer.json

# verify it works by going to http://localhost (should show Laravel page)
```

## Local development setup

Using Laravel Sail

```
./vendor/bin/sail up
# ./vendor/bin/sail build --no-cache
./vendor/bin/sail artisan migrate
./vendor/bin/sail mysql < path_to_db_dump.sql
```

## Database Migration

```
# initial setup
docker-compose exec workspace php artisan migrate:fresh
```

## Deployment to server

Deployment is done using Forge

## Updating course information

- Put the file `YYYY_yyyymmdd_hhmm.txt` in `storage/app/data/` folder
- Execute `docker-compose exec workspace php artisan update:courses /var/www/storage/app/data/YYYY_yyyymmdd_hhmm.txt`

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

## Laravel + Forge giving no file specified error on paths:

Add the following lines before `fastcgi_split_path_info` in nginx configuration:

```try_files $query_string /index.php =404;```

Source: [https://laravel.io/forum/01-28-2015-laravel-forge-no-input-file-specified#20311]
