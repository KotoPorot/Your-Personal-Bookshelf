-- liquibase formatted sql

--changeset rodionov:1 fix naming column SHELF_NAME

ALTER TABLE my_app_schema.shelves
    ALTER COLUMN shelfName RENAME TO shelf_name;
