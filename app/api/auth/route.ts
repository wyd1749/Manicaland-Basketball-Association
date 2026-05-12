import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const DATA_PATH = path.join(process.cwd(), "lib", "data.json")

export async function POST(request: Request) {
  const { username, password } = await request.json()
  const raw = fs.readFileSync(DATA_PATH, "utf-8")
  const data = JSON.parse(raw)

  if (username === data.admin.username && password === data.admin.password) {
    return NextResponse.json({ success: true, token: "mba-admin-token-2026" })
  }

  return NextResponse.json(
    { success: false, message: "Invalid credentials" },
    { status: 401 }
  )
}
