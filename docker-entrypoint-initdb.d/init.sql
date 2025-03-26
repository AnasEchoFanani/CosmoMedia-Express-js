CREATE DATABASE IF NOT EXISTS cosmomedia_dev;
USE cosmomedia_dev;

-- Create a new user with proper permissions
CREATE USER IF NOT EXISTS 'cosmomedia'@'%' IDENTIFIED WITH mysql_native_password BY 'password';
GRANT ALL PRIVILEGES ON cosmomedia_dev.* TO 'cosmomedia'@'%';

-- Update root user password
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';

FLUSH PRIVILEGES;
