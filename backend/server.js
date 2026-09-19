const express = require("express");
const cors = require("cors");
const db = require("./database");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = 5000;


// ===============================
// MIDDLEWARE
// ===============================

app.use(cors());
app.use(express.json());


// ===============================
// HOME / SERVER TEST
// ===============================

app.get("/", (req, res) => {
    res.json({
        message: "PuneIntern Backend is running!"
    });
});


// ===============================
// STUDENT REGISTRATION
// ===============================

app.post("/api/students/register", async (req, res) => {

    try {

        const {
            firstName,
            lastName,
            email,
            phone,
            college,
            course,
            year,
            specialization,
            internshipMode,
            location,
            skills,
            password
        } = req.body;


        if (
            !firstName ||
            !lastName ||
            !email ||
            !phone ||
            !college ||
            !course ||
            !year ||
            !password
        ) {

            return res.status(400).json({
                success: false,
                message: "Please fill all required fields."
            });

        }


        const hashedPassword =
            await bcrypt.hash(password, 10);


        const sql = `
            INSERT INTO students
            (
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
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;


        const values = [
            firstName,
            lastName,
            email,
            phone,
            college,
            course,
            year,
            specialization || null,
            internshipMode || null,
            location || null,
            skills || null,
            hashedPassword
        ];


        db.run(sql, values, function (err) {

            if (err) {

                if (
                    err.message.includes(
                        "UNIQUE constraint failed"
                    )
                ) {

                    return res.status(409).json({
                        success: false,
                        message:
                            "An account with this email already exists."
                    });

                }


                console.error(
                    "Registration failed:",
                    err.message
                );


                return res.status(500).json({
                    success: false,
                    message: "Registration failed."
                });

            }


            res.status(201).json({

                success: true,

                message:
                    "Student registered successfully!",

                studentId:
                    this.lastID

            });

        });

    } catch (error) {

        console.error(
            "Server error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Internal server error."

        });

    }

});


// ===============================
// STUDENT LOGIN
// ===============================

app.post("/api/students/login", async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        if (!email || !password) {

            return res.status(400).json({

                success: false,

                message:
                    "Email and password are required."

            });

        }


        const sql = `
            SELECT *
            FROM students
            WHERE email = ?
        `;


        db.get(
            sql,
            [email],
            async (err, student) => {

                if (err) {

                    console.error(
                        "Login database error:",
                        err.message
                    );


                    return res.status(500).json({

                        success: false,

                        message:
                            "Login failed."

                    });

                }


                if (!student) {

                    return res.status(401).json({

                        success: false,

                        message:
                            "Invalid email or password."

                    });

                }


                const passwordMatch =
                    await bcrypt.compare(
                        password,
                        student.password
                    );


                if (!passwordMatch) {

                    return res.status(401).json({

                        success: false,

                        message:
                            "Invalid email or password."

                    });

                }


                res.json({

                    success: true,

                    message:
                        "Login successful!",

                    student: {

                        id:
                            student.id,

                        firstName:
                            student.first_name,

                        lastName:
                            student.last_name,

                        email:
                            student.email

                    }

                });

            }
        );

    } catch (error) {

        console.error(
            "Login server error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Internal server error."

        });

    }

});


// ===============================
// GET STUDENT PROFILE
// ===============================

app.get(
    "/api/students/profile/:id",
    (req, res) => {

        const studentId =
            req.params.id;


        const sql = `
            SELECT
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
            WHERE id = ?
        `;


        db.get(
            sql,
            [studentId],
            (err, student) => {

                if (err) {

                    console.error(
                        "Profile database error:",
                        err.message
                    );


                    return res.status(500).json({

                        success: false,

                        message:
                            "Unable to load student profile."

                    });

                }


                if (!student) {

                    return res.status(404).json({

                        success: false,

                        message:
                            "Student not found."

                    });

                }


                res.json({

                    success: true,

                    student:
                        student

                });

            }
        );

    }
);


// ===============================
// UPDATE STUDENT PROFILE
// ===============================

app.put(
    "/api/students/profile/:id",
    (req, res) => {

        const studentId =
            req.params.id;


        const {
            phone,
            course,
            college,
            year,
            specialization,
            internshipMode,
            location,
            skills
        } = req.body;


        const sql = `
            UPDATE students
            SET
                phone = ?,
                course = ?,
                college = ?,
                year = ?,
                specialization = ?,
                internship_mode = ?,
                location = ?,
                skills = ?
            WHERE id = ?
        `;


        const values = [

            phone,
            course,
            college,
            year,
            specialization,
            internshipMode,
            location,
            skills,
            studentId

        ];


        db.run(
            sql,
            values,
            function (err) {

                if (err) {

                    console.error(
                        "Profile update error:",
                        err.message
                    );


                    return res.status(500).json({

                        success: false,

                        message:
                            "Unable to update student profile."

                    });

                }


                if (this.changes === 0) {

                    return res.status(404).json({

                        success: false,

                        message:
                            "Student not found."

                    });

                }


                res.json({

                    success: true,

                    message:
                        "Student profile updated successfully."

                });

            }
        );

    }
);


// ===============================
// GET ALL INTERNSHIPS
// ===============================

app.get(
    "/api/internships",
    (req, res) => {

        const sql = `
            SELECT
                id,
                title,
                company,
                location,
                mode,
                stipend,
                duration,
                skills,
                description,
                created_at
            FROM internships
            ORDER BY created_at DESC
        `;


        db.all(
            sql,
            [],
            (err, rows) => {

                if (err) {

                    console.error(
                        "Internship fetch error:",
                        err.message
                    );


                    return res.status(500).json({

                        success: false,

                        message:
                            "Unable to fetch internships."

                    });

                }


                res.json({

                    success: true,

                    internships:
                        rows

                });

            }
        );

    }
);


// ===============================
// POST NEW INTERNSHIP
// ===============================

app.post(
    "/api/internships",
    (req, res) => {

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


        if (
            !title ||
            !company ||
            !location ||
            !mode
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Title, company, location and work mode are required."

            });

        }


        const sql = `
            INSERT INTO internships
            (
                title,
                company,
                location,
                mode,
                stipend,
                duration,
                skills,
                description
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;


        db.run(
            sql,
            [
                title,
                company,
                location,
                mode,
                stipend || "",
                duration || "6 Months",
                skills || "",
                description || ""
            ],
            function (err) {

                if (err) {

                    console.error(
                        "Internship creation error:",
                        err.message
                    );


                    return res.status(500).json({

                        success: false,

                        message:
                            "Unable to create internship."

                    });

                }


                res.status(201).json({

                    success: true,

                    message:
                        "Internship published successfully!",

                    internshipId:
                        this.lastID

                });

            }
        );

    }
);


// ===============================
// GET STUDENT APPLICATIONS
// ===============================

app.get(
    "/api/applications/student/:studentId",
    (req, res) => {

        const studentId =
            req.params.studentId;


        const sql = `
            SELECT
                applications.id,
                applications.status,
                applications.applied_at,
                internships.title,
                internships.company,
                internships.location,
                internships.mode,
                internships.stipend,
                internships.duration
            FROM applications
            INNER JOIN internships
                ON applications.internship_id =
                   internships.id
            WHERE applications.student_id = ?
            ORDER BY applications.applied_at DESC
        `;


        db.all(
            sql,
            [studentId],
            (err, rows) => {

                if (err) {

                    console.error(
                        "Application fetch error:",
                        err.message
                    );


                    return res.status(500).json({

                        success: false,

                        message:
                            "Unable to fetch applications."

                    });

                }


                res.json({

                    success: true,

                    applications:
                        rows

                });

            }
        );

    }
);


// ===============================
// APPLY FOR INTERNSHIP
// ===============================

app.post(
    "/api/applications",
    (req, res) => {

        const {
            studentId,
            internshipId
        } = req.body;


        if (
            !studentId ||
            !internshipId
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Student ID and Internship ID are required."

            });

        }


        // Check for duplicate application

        const checkSql = `
            SELECT id
            FROM applications
            WHERE student_id = ?
            AND internship_id = ?
        `;


        db.get(
            checkSql,
            [
                studentId,
                internshipId
            ],
            (err, existingApplication) => {

                if (err) {

                    console.error(
                        "Application check error:",
                        err.message
                    );


                    return res.status(500).json({

                        success: false,

                        message:
                            "Unable to check existing application."

                    });

                }


                if (existingApplication) {

                    return res.status(409).json({

                        success: false,

                        message:
                            "You have already applied for this internship."

                    });

                }


                const sql = `
                    INSERT INTO applications
                    (
                        student_id,
                        internship_id
                    )
                    VALUES (?, ?)
                `;


                db.run(
                    sql,
                    [
                        studentId,
                        internshipId
                    ],
                    function (err) {

                        if (err) {

                            console.error(
                                "Application error:",
                                err.message
                            );


                            return res.status(500).json({

                                success: false,

                                message:
                                    "Unable to submit application."

                            });

                        }


                        res.status(201).json({

                            success: true,

                            message:
                                "Application submitted successfully!",

                            applicationId:
                                this.lastID

                        });

                    }
                );

            }
        );

    }
);


// ===============================
// START SERVER
// ===============================
app.get("/api/company/applications", (req, res) => {
    const sql = `
        SELECT
            applications.id,
            applications.student_id,
            applications.internship_id,
            applications.status,
            applications.applied_at,
            students.first_name,
            students.last_name,
            students.email,
            students.skills,
            internships.title AS internship_title,
            internships.company,
            internships.location,
            internships.mode,
            internships.stipend,
            internships.duration
        FROM applications
        JOIN students
            ON applications.student_id = students.id
        JOIN internships
            ON applications.internship_id = internships.id
        ORDER BY applications.applied_at DESC
    `;

    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error("Company applications error:", err.message);

            return res.status(500).json({
                success: false,
                message: "Unable to load applications."
            });
        }

        res.json({
            success: true,
            applications: rows
        });
    });
});
app.listen(
    PORT,
    () => {

        console.log(
            `Server running at http://localhost:${PORT}`
        );

    }
);