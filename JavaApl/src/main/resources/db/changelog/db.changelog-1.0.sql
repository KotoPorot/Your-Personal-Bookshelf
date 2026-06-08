--changeset rodionov:1
CREATE SCHEMA IF NOT EXISTS my_app_schema;

CREATE TABLE my_app_schema.users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);