import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { verifyAuth } from "@/lib/auth"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    const donations = await executeQuery<any[]>({
      query: `
        SELECT d.*, u.name as donor_name,
        (SELECT GROUP_CONCAT(image_url) FROM donation_images WHERE donation_id = d.id) as images
        FROM donations d
        JOIN users u ON d.donor_id = u.id
        WHERE d.id = ?
      `,
      values: [id],
    })

    if (donations.length === 0) {
      return NextResponse.json({ success: false, message: "Donation not found" }, { status: 404 })
    }

    const donation = {
      ...donations[0],
      images: donations[0].images ? donations[0].images.split(",") : [],
    }

    return NextResponse.json(donation)
  } catch (error) {
    console.error("Error fetching donation:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch donation" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { user } = authResult
    const id = params.id
    const body = await request.json()

    // Verify the user owns this donation
    const existingDonation = await executeQuery<any[]>({
      query: "SELECT * FROM donations WHERE id = ? AND donor_id = ?",
      values: [id, user.id],
    })

    if (existingDonation.length === 0) {
      return NextResponse.json(
        { success: false, message: "Donation not found or access denied" },
        { status: 404 }
      )
    }

    // Update donation
    await executeQuery({
      query: "UPDATE donations SET status = ? WHERE id = ?",
      values: [body.status, id],
    })

    return NextResponse.json({
      success: true,
      message: "Donation updated successfully",
    })
  } catch (error) {
    console.error("Donation update error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to update donation" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { user } = authResult
    const id = params.id

    // Verify the user owns this donation
    const existingDonation = await executeQuery<any[]>({
      query: "SELECT * FROM donations WHERE id = ? AND donor_id = ?",
      values: [id, user.id],
    })

    if (existingDonation.length === 0) {
      return NextResponse.json(
        { success: false, message: "Donation not found or access denied" },
        { status: 404 }
      )
    }

    // Begin transaction
    await executeQuery({ query: "START TRANSACTION", values: [] })

    try {
      // Delete images first
      await executeQuery({
        query: "DELETE FROM donation_images WHERE donation_id = ?",
        values: [id],
      })

      // Then delete the donation
      await executeQuery({
        query: "DELETE FROM donations WHERE id = ?",
        values: [id],
      })

      await executeQuery({ query: "COMMIT", values: [] })

      return NextResponse.json({
        success: true,
        message: "Donation deleted successfully",
      })
    } catch (error) {
      await executeQuery({ query: "ROLLBACK", values: [] })
      throw error
    }
  } catch (error) {
    console.error("Donation deletion error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to delete donation" },
      { status: 500 }
    )
  }
}