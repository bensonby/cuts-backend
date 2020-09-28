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
docker-compose up -d nginx mysql

# run composer install within container
# necessary?
docker-compose exec workspace bash
composer install # should be in /var/www folder with composer.json

# verify it works by going to http://localhost (should show Laravel page)
```
