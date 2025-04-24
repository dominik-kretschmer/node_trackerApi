import { db } from "./index.js";

const schema = [
    `
        CREATE TABLE IF NOT EXISTS symptom_entries
        (
            id         INT AUTO_INCREMENT PRIMARY KEY,
            user_id    INT  NOT NULL,
            date       DATE NOT NULL,
            sneezing   INT  NOT NULL DEFAULT 0,
            itchy_eyes INT  NOT NULL DEFAULT 0,
            congestion INT  NOT NULL DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES users (id)

        )
    `,
    `
        CREATE TABLE IF NOT EXISTS pollen_types
        (
            id   INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL UNIQUE
        );
    `,
    `
        CREATE TABLE IF NOT EXISTS pollen_entries
        (
            id             INT AUTO_INCREMENT PRIMARY KEY,
            date           DATE NOT NULL,
            pollen_type_id INT  NOT NULL,
            value          FLOAT NOT NULL DEFAULT 0,
            FOREIGN KEY (pollen_type_id) REFERENCES pollen_types (id),
            UNIQUE KEY unique_date_type (date, pollen_type_id)
        );
    `,
    `
        CREATE TABLE IF NOT EXISTS users
        (
            id            INT AUTO_INCREMENT PRIMARY KEY,
            username      VARCHAR(255) NOT NULL UNIQUE,
            password_hash TEXT         NOT NULL,
            created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `,
    `
        CREATE TABLE IF NOT EXISTS daily_entries
        (
            id                 INT AUTO_INCREMENT PRIMARY KEY,
            user_id            INT NOT NULL,
            mood_rating        INT,
            energy_level       INT,
            productivity_level INT,
            sleep_quality      INT,
            created_at         DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            UNIQUE KEY unique_entry (user_id, created_at)
        )
    `,
    `
        CREATE TABLE IF NOT EXISTS food_entries
        (
            id          INT AUTO_INCREMENT PRIMARY KEY,
            user_id     INT  NOT NULL,
            description TEXT NOT NULL,
            category    VARCHAR(100),
            created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    `,
];

for (const query of schema) {
    await db.raw(query);
}

console.log("📦 Datenbank initialisiert");
