import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const DATA_PATH = path.join(process.cwd(), "lib", "data.json")

function readData() {
  const raw = fs.readFileSync(DATA_PATH, "utf-8")
  return JSON.parse(raw)
}

function writeData(data: Record<string, unknown>) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2))
}

export async function GET() {
  const data = readData()
  const { admin: _admin, ...publicData } = data
  return NextResponse.json(publicData)
}

export async function POST(request: Request) {
  const body = await request.json()
  const data = readData()

  const { action, entity, payload } = body

  if (action === "create") {
    const list = data[entity as string] as Record<string, unknown>[]
    const newId = String(
      Math.max(0, ...list.map((item) => Number(item.id))) + 1
    )
    list.push({ ...payload, id: newId })
  } else if (action === "update") {
    const list = data[entity as string] as Record<string, unknown>[]
    const index = list.findIndex(
      (item) => item.id === payload.id
    )
    if (index !== -1) list[index] = payload
  } else if (action === "delete") {
    data[entity as string] = (
      data[entity as string] as Record<string, unknown>[]
    ).filter((item) => item.id !== payload.id)
  }

  writeData(data)
  const { admin: _admin, ...publicData } = data
  return NextResponse.json(publicData)
}
