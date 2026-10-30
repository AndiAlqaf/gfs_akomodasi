FROM php:8.4-fpm-alpine

# Ekstensi & utilitas yang dibutuhkan aplikasi
RUN apk add --no-cache bash mysql-client \
    && docker-php-ext-install pdo pdo_mysql

# php.ini mode produksi.
# - expose_php=Off  -> header X-Powered-By hilang, versi PHP tidak bocor
# - display_errors=Off -> error tidak tampil ke klien, tetap masuk log
RUN { \
        echo 'expose_php = Off'; \
        echo 'display_errors = Off'; \
        echo 'display_startup_errors = Off'; \
        echo 'log_errors = On'; \
        echo 'error_log = /proc/self/fd/2'; \
        echo 'upload_max_filesize = 64M'; \
        echo 'post_max_size = 64M'; \
        echo 'memory_limit = 256M'; \
        echo 'max_execution_time = 120'; \
    } > /usr/local/etc/php/conf.d/zz-production.ini

WORKDIR /var/www/backend

# Copy application files
COPY . .

# Buang file dev/utilitas yang tidak diperlukan di produksi
# (.dockerignore sudah menyaring sebagian; ini lapis kedua)
RUN rm -f \
    add_meals_dp.php add_mr.php alter_guests.php \
    check_meals.php check_meeting_rooms.php check_missing_rooms.php \
    check_mr.php check_mr_content.php check_rooms.php check_sample.php \
    count_guests.php create_table.php extract_csv.php fix_db.php fix_regular.php \
    get_tables.php get_tables_mysql.php migrate_data.php \
    reseed_guests.php reseed_laundry_bags.php \
    seed_all_guests.php seed_all_guests_proper.php \
    seed_guests_1.php seed_guests_2.php seed_guests_3.php seed_guests_4.php \
    sync_db.php sync_regular_guests.php \
    test.php test_api.php test_db.php test_dump.php test_fetch.php \
    test_fetch_laundry_bags.php test_fetch_reservations.php test_guest_api.php \
    test_guests_schema.php test_meeting_rooms_table.php test_reservation.php test_rooms.php \
    database.sqlite \
    reservations_output.txt laundry_bags_output.txt test_fetch_output.txt \
    start-server.sh start-server.ps1 scratch_pob.js 2>/dev/null || true

# Uploads harus writable oleh worker FPM (www-data), bukan root
RUN mkdir -p /var/www/backend/uploads \
    && chown -R www-data:www-data /var/www/backend

# php-fpm default pool sudah listen di 0.0.0.0:9000
EXPOSE 9000

# -F = foreground, supaya container tetap hidup dan log ke stdout
CMD ["php-fpm", "-F"]
