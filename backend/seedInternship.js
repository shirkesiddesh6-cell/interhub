const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./puneintern.db", (err) => {
    if (err) {
        console.error("Database connection failed:", err.message);
        return;
    }

    console.log("Connected to PuneIntern database!");
});

const internships = [
    {
        title: "Cloud Support Intern",
        company: "Pune Cloud Technologies",
        location: "Pune",
        mode: "Hybrid",
        stipend: "₹10,000/month",
        duration: "6 Months",
        skills: "AWS, Linux, Networking",
        description: "Assist the cloud support team with AWS infrastructure and troubleshooting."
    },
    {
        title: "DevOps Intern",
        company: "Mumbai Tech Solutions",
        location: "Mumbai",
        mode: "On-site",
        stipend: "₹12,000/month",
        duration: "6 Months",
        skills: "Docker, Kubernetes, Git",
        description: "Work with the DevOps team on containers, deployments and CI/CD."
    },
    {
        title: "Frontend Developer Intern",
        company: "Digital Innovation Labs",
        location: "Remote",
        mode: "Remote",
        stipend: "₹8,000/month",
        duration: "3 Months",
        skills: "HTML, CSS, JavaScript",
        description: "Build and maintain responsive web pages for company projects."
    }
];

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
    SELECT ?, ?, ?, ?, ?, ?, ?, ?
    WHERE NOT EXISTS (
        SELECT 1
        FROM internships
        WHERE title = ?
        AND company = ?
    )
`;

let completed = 0;

internships.forEach((internship) => {

    db.run(
        sql,
        [
            internship.title,
            internship.company,
            internship.location,
            internship.mode,
            internship.stipend,
            internship.duration,
            internship.skills,
            internship.description,
            internship.title,
            internship.company
        ],
        function (err) {

            if (err) {
                console.error(
                    "Failed to process internship:",
                    err.message
                );
            } else if (this.changes === 1) {
                console.log(
                    `Added internship: ${internship.title}`
                );
            } else {
                console.log(
                    `Already exists: ${internship.title}`
                );
            }

            completed++;

            if (completed === internships.length) {
                db.close(() => {
                    console.log("Internship seed completed!");
                });
            }
        }
    );

});