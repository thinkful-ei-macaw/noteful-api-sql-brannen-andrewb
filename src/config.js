module.exports = {
    PORT: process.env.PORT || 8000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    DATABASE_URL: process.env.DB_URL || "postgresql://postgres@localhost/noteful",
    TEST_DATABASE_URL: process.env.TEST_DB_URL || "postgresql://postgres@localhost/noteful-test"
}