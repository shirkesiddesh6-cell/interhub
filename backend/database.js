const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./puneintern.db", (err) => {
    if (err) {
        console.error("Database connection failed:", err.message);
    } else {
        console.log("PuneIntern database connected!");
    }
});

db.run(`
    CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT NOT NULL,
        college TEXT NOT NULL,
        course TEXT NOT NULL,
        year TEXT NOT NULL,
        specialization TEXT,
        internship_mode TEXT,
        location TEXT,
        skills TEXT,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`, (err) => {
    if (err) {
        console.error("Table creation failed:", err.message);
    } else {
        console.log("Students table ready!");
    }
});
db.run(`
    CREATE TABLE IF NOT EXISTS internships (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        company TEXT NOT NULL,
        location TEXT NOT NULL,
        mode TEXT NOT NULL,
        stipend TEXT,
        duration TEXT,
        skills TEXT,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`, (err) => {
    if (err) {
        console.error("Internships table creation failed:", err.message);
    } else {
        console.log("Internships table ready!");
    }
});
db.run(`
    CREATE TABLE IF NOT EXISTS applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        internship_id INTEGER NOT NULL,
        status TEXT DEFAULT 'Applied',
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id),
        FOREIGN KEY (internship_id) REFERENCES internships(id)
    )
`, (err) => {
    if (err) {
        console.error(
            "Applications table creation failed:",
            err.message
        );
    } else {
        console.log("Applications table ready!");
    }
});
module.exports = db;