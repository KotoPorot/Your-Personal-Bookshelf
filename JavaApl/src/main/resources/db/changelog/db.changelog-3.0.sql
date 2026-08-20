-- liquibase formatted sql

--changeset rodionov:1 fix naming column SHELF_NAME

ALTER TABLE my_app_schema.shelves RENAME COLUMN "shelfName" TO shelf_name;