package com.yourbookshelf.yourbookshelf.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "book_progress", schema = "my_app_schema")
@Getter @Setter @NoArgsConstructor
public class MyBookProgress {

    @Id
    private Long id;

    @OneToOne
    @MapsId
    @JoinColumn(name = "book_id", nullable = false, unique = true)
    private MyBook book;

    @Column(name = "current_cfi")
    private String currentCfi;

    @Column(name = "reading_time")
    private Integer readingTime;

    @Column(name = "progress")
    private Float progress;

    @Column(name = "current_section")
    private Integer currentSection;

    @Column(name = "number_of_sections")
    private Integer numberOfSections;

    @Column(name = "current_chapter_in_section")
    private Integer currentChapterInSection;

    @Column(name = "number_of_chapters_in_section")
    private Integer numberOfChaptersInSection;

    @UpdateTimestamp
    @Column(name = "timestamp")
    private LocalDateTime timestamp;
}
