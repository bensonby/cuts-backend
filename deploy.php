<?php
// prerequisite
// install docker, docker-compose, (php7.4?) on server
namespace Deployer;

require 'recipe/laravel.php';

// Project name
set('application', 'cuts-backend');

// Project repository
set('repository', 'git@github.com:bensonby/cuts-backend.git');

// [Optional] Allocate tty for git clone. Default value is false.
set('git_tty', true); 

// set update_code_strategy to be clone instead of archive, for git submodule support
set('update_code_strategy', 'clone');

// Shared files/dirs between deploys 
add('shared_files', [
  '.env',
  'laradock/.env',
  'laradock/docker-compose.yml', // to add working_dir for workspace, and volume mount for storage to prevent issue on symlink with docker
  // 'laradock/nginx/sites/default.conf', // symlink not working for sharing this file into nginx container; use copy instead
]);
set('shared_dirs', []); // override laravel config; since with docker we don't need symlink for shared_dirs, but will rely on docker-compose mounting

set('copy_dirs', [
  'storage/app/data', // timetable data files
]);

// For using docker
set('bin/php', 'cd {{release_path}}/{{laradock_path}} && docker-compose exec --user=laradock -T workspace php');
set('bin/composer', 'cd {{release_path}}/{{laradock_path}} && docker-compose exec --user=laradock -T workspace composer --working-dir=/var/www/');

// Writable dirs by web server 
add('writable_dirs', []);
set('allow_anonymous_stats', false);

// for git submodules
set('git_recursive', true);

// path for docker-compose file
set('laradock_path', 'laradock');

// Hosts
host('cuts-backend')
    ->set('branch', 'staging')
    ->set('deploy_path', '~/{{application}}');

host('cuts-prod')
    ->set('branch', 'production')
    ->set('deploy_path', '~/{{application}}');

// Tasks

task('build', function () {
    run('cd {{release_path}} && build');
    // git init submodules
    // setup custom docker-compose.yml and custom .env
    // docker-compose -f my.yml up -d nginx mysql
});
task('docker:rebuild', function () {
    run('cd {{release_path}}/{{laradock_path}} && docker-compose up --build -d nginx mysql', ['timeout' => null]);
});
task('artisan2:migrate', function () {
    run('cd {{release_path}}/{{laradock_path}} && docker-compose exec -T workspace php /var/www/artisan -vvv migrate --force');
});
task('artisan2:migrate:fresh', function () {
    run('cd {{release_path}}/{{laradock_path}} && docker-compose exec -T workspace php /var/www/artisan -vvv migrate:fresh --force');
});
task('artisan2:optimize:clear', function () {
    run('cd {{release_path}}/{{laradock_path}} && docker-compose exec -T workspace php /var/www/artisan optimize:clear');
});
task('artisan2:route:clear', function () {
    run('cd {{release_path}}/{{laradock_path}} && docker-compose exec -T workspace php /var/www/artisan route:clear');
});
task('artisan2:cache:clear', function () {
    run('cd {{release_path}}/{{laradock_path}} && docker-compose exec -T workspace php /var/www/artisan cache:clear');
});
task('artisan2:config:clear', function () {
    run('cd {{release_path}}/{{laradock_path}} && docker-compose exec -T workspace php /var/www/artisan config:clear');
});
task('artisan2:view:clear', function () {
    run('cd {{release_path}}/{{laradock_path}} && docker-compose exec -T workspace php /var/www/artisan view:clear');
});
task('artisan2:view:cache', function () {
    run('cd {{release_path}}/{{laradock_path}} && docker-compose exec -T workspace php /var/www/artisan view:cache');
});
task('artisan2:config:cache', function () {
    run('cd {{release_path}}/{{laradock_path}} && docker-compose exec -T workspace php /var/www/artisan config:cache');
});
task('artisan2:route:cache', function () {
    run('cd {{release_path}}/{{laradock_path}} && docker-compose exec -T workspace php /var/www/artisan route:cache');
});
task('artisan2:storage:link', function () {
    run('cd {{release_path}}/{{laradock_path}} && docker-compose exec -T workspace php /var/www/artisan storage:link');
});
task('deploy:vendors', function () {
    run('{{bin/composer}} install');
});

task('copy:nginx_conf', function () {
    run('cp {{deploy_path}}/shared/laradock/nginx/sites/default.conf {{release_path}}/{{laradock_path}}/nginx/sites/');
});

// [Optional] if deploy fails automatically unlock.
after('deploy:failed', 'deploy:unlock');

// https://github.com/deployphp/deployer/issues/2802
after('deploy:update_code', 'deploy:git:submodules');
task('deploy:git:submodules', function () {
    $git = get('bin/git');

    cd('{{release_path}}');
    run("$git submodule update --init");
});

task('reset:cache', [
  'artisan2:optimize:clear',
  'artisan2:route:clear',
  'artisan2:config:clear',
  'artisan2:cache:clear',
  'artisan2:view:clear',
]);
task('initialize', [
    'deploy:prepare',
    // 'deploy:lock',
    'deploy:release',
    'deploy:update_code',
    'deploy:unlock',
    'deploy:cleanup',
]);

task('deploy', [
    'deploy:prepare',
    // 'deploy:lock', // it calls deploy:lock automatically after shared?
    'deploy:release',
    'deploy:update_code',
    'deploy:shared',
    'deploy:copy_dirs',
    'copy:nginx_conf',
    'docker:rebuild',
    // 'deploy:symlink', // do not use it since symlink not supported by docker
    'deploy:vendors',
    // 'artisan2:storage:link', // do not use it since symlink not supported by docker
    // 'artisan2:view:cache',
    'artisan2:config:cache',
    'artisan2:route:cache',
    // 'artisan2:migrate:fresh', // first time run only
    'artisan2:migrate',
    'deploy:unlock',
    'deploy:cleanup',
]);
