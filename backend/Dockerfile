FROM php:8.2-cli-alpine

# Install system dependencies and PHP extensions
RUN apk add --no-cache \
    bash \
    mysql-client \
    && docker-php-ext-install pdo pdo_mysql

# Set working directory
WORKDIR /var/www/backend

# Copy application files
COPY . .

# Remove dev/utility files that are not needed in production
RUN rm -f \
    add_meals_dp.php \
    add_mr.php \
    alter_guests.php \
    check_meals.php \
    check_meeting_rooms.php \
    check_missing_rooms.php \
    check_mr.php \
    check_mr_content.php \
    check_rooms.php \
    check_sample.php \
    count_guests.php \
    create_table.php \
    extract_csv.php \
    fix_db.php \
    fix_regular.php \
    get_tables.php \
    get_tables_mysql.php \
    migrate_data.php \
    reseed_guests.php \
    reseed_laundry_bags.php \
    seed_all_guests.php \
    seed_all_guests_proper.php \
    seed_guests_1.php \
    seed_guests_2.php \
    seed_guests_3.php \
    seed_guests_4.php \
    sync_db.php \
    sync_regular_guests.php \
    test.php \
    test_api.php \
    test_db.php \
    test_dump.php \
    test_fetch.php \
    test_fetch_laundry_bags.php \
    test_fetch_reservations.php \
    test_guest_api.php \
    test_guests_schema.php \
    test_meeting_rooms_table.php \
    test_reservation.php \
    test_rooms.php \
    reservations_output.txt \
    laundry_bags_output.txt \
    test_fetch_output.txt \
    start-server.ps1 \
    scratch_pob.js 2>/dev/null || true

# Create uploads directory
RUN mkdir -p /var/www/backend/uploads && chmod 755 /var/www/backend/uploads

# Expose backend port
EXPOSE 31145

# Start PHP built-in server
CMD ["sh", "start-server.sh"]
