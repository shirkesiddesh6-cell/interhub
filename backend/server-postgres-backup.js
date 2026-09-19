const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const pool = require("./postgres");

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({ message: "PuneIntern PostgreSQL Backend is running!" });
});

// Student Registration
app.post("/api/students/register", async (req, res) => {
    try {
        const {
            first_name,
            last_name,
            email,
            phone,
            college,
            course,
            year,
            specialization,
            internship_mode,
            location,
            skills,
            password
        } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `INSERT INTO students
            (first_name, last_name, email, phone, college, course, year,
             specialization, internship_mode, location, skills, password)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
            RETURNING id, first_name, last_name, email`,
            [
                first_name,
                last_name,
                email,
                phone,
                college,
                course,
                year,
                specialization,
                internship_mode,
                location,
                skills,
                hashedPassword
            ]
        );

        res.status(201).json({
            message: "Student registered successfully!",
            student: result.rows[0]
        });

    } catch (err) {
        if (err.code === "23505") {
            return res.status(409).json({
                message: "Email already registered."
            });
        }

        console.error(err.message);
        res.status(500).json({
            message: "Registration failed."
        });
    }
});

// Student Login
app.post("/api/students/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const result = await pool.query(
            "SELECT * FROM students WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        const student = result.rows[0];

        const validPassword = await bcrypt.compare(
            password,
            student.password
        );

        if (!validPassword) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        res.json({
            message: "Login successful!",
            student: {
                id: student.id,
                first_name: student.first_name,
                last_name: student.last_name,
                email: student.email
            }
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            message: "Login failed."
        });
    }
});

// Update Student Profile
app.put("/api/students/profile/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const {
            first_name,
            last_name,
            phone,
            college,
            course,
            year,
            specialization,
            internship_mode,
            location,
            skills
        } = req.body;

        const result = await pool.query(
            `UPDATE students
             SET
                first_name = $1,
                last_name = $2,
                phone = $3,
                college = $4,
                course = $5,
                year = $6,
                specialization = $7,
                internship_mode = $8,
                location = $9,
                skills = $10
             WHERE id = $11
             RETURNING
                id,
                first_name,
                last_name,
                email,
                phone,
                college,
                course,
                year,
                specialization,
                internship_mode,
                location,
                skills`,
            [
                first_name,
                last_name,
                phone,
                college,
                course,
                year,
                specialization,
                internship_mode,
                location,
                skills,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Student not found."
            });
        }

        res.json({
            message: "Profile updated successfully!",
            student: result.rows[0]
        });

       } catch (err) {
        console.error(err.message);
        res.status(500).json({
            message: "Failed to update student profile."
        });
    }
});

// Get Student Profile
app.get("/api/students/profile/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT
                id,
                first_name,
                last_name,
                email,
                phone,
                college,
                course,
                year,
                specialization,
                internship_mode,
                location,
                skills,
                created_at
             FROM students
             WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Student not found."
            });
        }

        res.json(result.rows[0]);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            message: "Failed to fetch student profile."
        });
    }
});

// Get Internships
app.get("/api/internships", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM internships ORDER BY id"
        );

        res.json(result.rows);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            message: "Failed to fetch internships."
        });
    }
});

// Get Student Applications
app.get("/api/applications/student/:studentId", async (req, res) => {
    try {
        const { studentId } = req.params;

        const result = await pool.query(
            `SELECT
                a.id,
                a.status,
                a.applied_at,
                i.title,
                i.company,
                i.location,
                i.mode,
                i.stipend,
                i.duration,
                i.skills
             FROM applications a
             JOIN internships i ON a.internship_id = i.id
             WHERE a.student_id = $1
             ORDER BY a.id`,
            [studentId]
        );

        res.json(result.rows);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            message: "Failed to fetch applications."
        });
    }
});

// Apply for Internship
app.post("/api/applications", async (req, res) => {
    try {
        const { student_id, internship_id } = req.body;

        const result = await pool.query(
            `INSERT INTO applications
            (student_id, internship_id)
            VALUES ($1, $2)
            RETURNING *`,
            [student_id, internship_id]
        );

        res.status(201).json({
            message: "Application submitted successfully!",
            application: result.rows[0]
        });

    } catch (err) {
        if (err.code === "23505") {
            return res.status(409).json({
                message: "You already applied for this internship."
            });
        }

        console.error(err.message);
        res.status(500).json({
            message: "Application failed."
        });
    }
});

// Company: Post a new internship
app.post("/api/internships", async (req, res) => {
    try {
        const {
            title,
            company,
            location,
            mode,
            stipend,
            duration,
            skills,
            description
        } = req.body;

        if (!title || !company || !location || !mode) {
            return res.status(400).json({
                message: "Title, company, location and mode are required."
            });
        }

        const result = await pool.query(
            `INSERT INTO internships
            (title, company, location, mode, stipend, duration, skills, description)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
            RETURNING *`,
            [
                title,
                company,
                location,
                mode,
                stipend || "",
                duration || "6 Months",
                skills || "",
                description || ""
            ]
        );

        res.status(201).json({
            message: "Internship posted successfully!",
            internship: result.rows[0]
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            message: "Failed to post internship."
        });
    }
});
// Company: View all internship applications
app.get("/api/company/applications", async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                a.id,
                a.student_id,
                a.internship_id,
                a.status,
                a.applied_at,
                s.first_name,
                s.last_name,
                s.email,
                s.skills,
                i.title AS internship_title,
                i.company,
                i.location,
                i.mode,
                i.stipend,
                i.duration
             FROM applications a
             JOIN students s ON a.student_id = s.id
             JOIN internships i ON a.internship_id = i.id
             ORDER BY a.applied_at DESC`
        );

        res.json({
            success: true,
            applications: result.rows
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            message: "Failed to fetch company applications."
        });
    }
});

const server = app.listen(PORT, "127.0.0.1", () => {
    console.log(`PostgreSQL backend running at http://localhost:${PORT}`);
});

server.on("error", (err) => {
    console.error("SERVER ERROR:", err);
});