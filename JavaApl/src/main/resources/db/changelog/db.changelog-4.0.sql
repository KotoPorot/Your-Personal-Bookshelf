-- liquibase formatted sql
--changeset rodionov:1-update-books-table
ALTER TABLE my_app_schema.books ADD COLUMN file_path VARCHAR(255);
ALTER TABLE my_app_schema.books ADD COLUMN cover_path VARCHAR(255);
ALTER TABLE my_app_schema.books ADD COLUMN author VARCHAR(255);