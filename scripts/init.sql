CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE Users (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT NOW(),
    session_id UUID DEFAULT uuid_generate_v4(),
    warning_count INT DEFAULT 0
);

CREATE TABLE Answers (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT NOW(),
    query TEXT,
    content TEXT
);

CREATE TABLE UserAnswers (
    user_id INT REFERENCES Users (id),
    answer_id INT REFERENCES Answers (id),
    PRIMARY KEY (user_id, answer_id)
);
