import { NextResponse } from "next/server"

// Mock data for reports
const reports = [
  {
    id: 1,
    type: "user",
    subject: "Inappropriate behavior",
    description: "This user has been posting offensive content.",
    reporterId: "ngo101",
    reporterName: "Hope Foundation",
    reportedId: "user125",
    reportedName: "Robert Johnson",
    status: "pending",
    date: "2023-12-10",
  },
  {
    id: 2,
    type: "donation",
    subject: "Item not as described",
    description: "The item was in much worse conditions than described.",
    reporterId: "ngo102",
    reporterName: "Children's Care",
    reportedId: 3,
    reportedName: "Kitchen Appliances",
    status: "resolved",
    date: "2023-11-25",
  },
]

export async function GET(request: Request) {
  // Get URL parameters
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type")
  const status = searchParams.get("status")
  const reporterId = searchParams.get("reporterId")

  // Filter reports based on parameters
  let filteredReports = [...reports]

  if (type) {
    filteredReports = filteredReports.filter((r) => r.type === type)
  }

  if (status) {
    filteredReports = filteredReports.filter((r) => r.status === status)
  }

  if (reporterId) {
    filteredReports = filteredReports.filter((r) => r.reporterId === reporterId)
  }

  return NextResponse.json(filteredReports)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // In a real application, you would:
    // 1. Validate the input
    // 2. Save to database

    // For demo purposes, we'll just return a success response
    const newReport = {
      id: reports.length + 1,
      ...body,
      status: "pending",
      date: new Date().toISOString().split("T")[0],
    }

    return NextResponse.json(
      {
        success: true,
        message: "Report submitted successfully",
        report: newReport,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Report submission error:", error)
    return NextResponse.json({ success: false, message: "Failed to submit report" }, { status: 500 })
  }
}

