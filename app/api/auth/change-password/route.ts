import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const DATA_PATH = path.join(process.cwd(), "lib", "data.json")

export async function POST(request: Request) {
  try {
    const { username, answer1, answer2, answer3, newPassword } = await request.json()

    if (!username || !answer1 || !answer2 || !answer3 || !newPassword) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      )
    }

    const raw = fs.readFileSync(DATA_PATH, "utf-8")
    const data = JSON.parse(raw)

    if (username !== data.admin.username) {
      return NextResponse.json(
        { success: false, message: "Invalid username" },
        { status: 401 }
      )
    }

    const questions = data.admin.securityQuestions
    if (
      answer1 !== questions[0].answer ||
      answer2 !== questions[1].answer ||
      answer3 !== questions[2].answer
    ) {
      return NextResponse.json(
        { success: false, message: "One or more security answers are incorrect" },
        { status: 401 }
      )
    }

    data.admin.password = newPassword
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2))

    return NextResponse.json({ success: true, message: "Password changed successfully" })
  } catch {
    return NextResponse.json(
      { success: false, message: "An error occurred. Please try again." },
      { status: 500 }
    )
  }
}

