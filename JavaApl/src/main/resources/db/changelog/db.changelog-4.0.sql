-- liquibase formatted sql
--changeset rodionov:1-update-books-table
ALTER TABLE my_app_schema.books ADD COLUMN file_path VARCHAR(255);
ALTER TABLE my_app_schema.books ADD COLUMN cover_path VARCHAR(255);
ALTER TABLE my_app_schema.books ADD COLUMN author VARCHAR(255);

--changeset rodionov:2-create-table-book-progress
CREATE TABLE my_app_schema.book_progress(
book_id BIGINT NOT NULL,
current_cfi TEXT ,
reading_time INT DEFAULT 0,
progress FLOAT DEFAULT 0,
current_section INT,
number_of_sections INT,
current_chapter_in_section INT,
number_of_chapters_in_section INT,
CONSTRAINT pk_book_progress PRIMARY KEY (book_id)
);

ALTER TABLE my_app_schema.book_progress
ADD CONSTRAINT fk_book_progress_book
FOREIGN KEY (book_id)
REFERENCES my_app_schema.books (id)
ON DELETE CASCADE;

--changeset rodionov:3-add-column-timestamp
ALTER TABLE my_app_schema.book_progress ADD COLUMN timestamp TIMESTAMP;