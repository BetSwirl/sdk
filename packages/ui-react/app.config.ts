import "dotenv/config"

const DEFAULT_URL = "http://localhost:5173"
const DEFAULT_PORT = 5173

if (!process.env.BASE_URL) {
  console.warn("⚠️  WARNING: BASE_URL is not set in environment variables!")
}

const baseUrl = process.env.BASE_URL || DEFAULT_URL

const parsedUrl = new URL(baseUrl)
const server = {
  isHttps: parsedUrl.protocol === "https:",
  host: parsedUrl.hostname,
  port: Number(parsedUrl.port) || DEFAULT_PORT,
}

console.log("Base URL: ", baseUrl)

export const config = {
  baseUrl,
  server,
}
