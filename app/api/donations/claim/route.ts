import { NextResponse } from "next/server"
import { executeQuery, getConnection } from "@/lib/db" // You'll need to export getConnection from your db.ts
import { verifyAuth } from "@/lib/auth"

export async function POST(request: Request) {
  let connection;
  try {
    // Verify authentication
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { user } = authResult
    if (user.type !== "ngo") {
      return NextResponse.json({ success: false, message: "Only NGOs can claim donations" }, { status: 403 })
    }

    const body = await request.json()
    const { donationId, deliveryCharge = 0 } = body

    // Check if donation exists and is available
    const donations = await executeQuery<any[]>({
      query: "SELECT * FROM donations WHERE id = ? AND status = ?",
      values: [donationId, "pending"],
    })

    if (donations.length === 0) {
      return NextResponse.json({ success: false, message: "Donation not found or already claimed" }, { status: 404 })
    }

    // Get a connection from the pool
    connection = await getConnection()
    
    // Begin transaction (using direct query)
    await connection.query("START TRANSACTION")

    try {
      // Update donation status
      await connection.query(
        "UPDATE donations SET status = ? WHERE id = ?",
        ["claimed", donationId]
      )

      // Create claim record
      await connection.query(
        `INSERT INTO donation_claims 
         (donation_id, ngo_id, status, delivery_charge)
         VALUES (?, ?, ?, ?)`,
        [donationId, user.id, "processing", deliveryCharge]
      )

      // Commit transaction
      await connection.query("COMMIT")

      // Get updated donation with claim details
      const [updatedDonations] = await connection.query(
        `SELECT d.*, u.name as donor_name, dc.status as claim_status, 
         dc.delivery_charge, dc.claimed_at,
         (SELECT GROUP_CONCAT(image_url) FROM donation_images WHERE donation_id = d.id) as images
         FROM donations d
         JOIN users u ON d.donor_id = u.id
         JOIN donation_claims dc ON d.id = dc.donation_id
         WHERE d.id = ? AND dc.ngo_id = ?`,
        [donationId, user.id]
      )

      const donation = updatedDonations[0]
      donation.images = donation.images ? donation.images.split(",") : []

      return NextResponse.json({
        success: true,
        message: "Donation claimed successfully",
        donation,
      })
    } catch (error) {
      // Rollback transaction on error
      if (connection) await connection.query("ROLLBACK")
      throw error
    }
  } catch (error) {
    console.error("Donation claim error:", error)
    return NextResponse.json({ success: false, message: "Failed to claim donation" }, { status: 500 })
  } finally {
    // Release the connection back to the pool
    if (connection) connection.release()
  }
}