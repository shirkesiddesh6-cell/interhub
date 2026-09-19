const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const path = require("path");

const app = express();

app.use(
    "/api",
    createProxyMiddleware({
        target: "http://127.0.0.1:5001",
        changeOrigin: true
    })
);

app.use(express.static(path.join(__dirname), { index: "home.html" }));

app.listen(3000, () => {
    console.log("InternHub running at http://localhost:3000");
});