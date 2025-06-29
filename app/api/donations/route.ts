import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { verifyAuth } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    // Get URL parameters
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const conditions = searchParams.get("conditions")
    const status = searchParams.get("status")
    const donorId = searchParams.get("donorId")
    const ngoId = searchParams.get("ngoId")

    // Build the query
    let query = `
      SELECT d.*, u.name as donor_name, 
      (SELECT GROUP_CONCAT(image_url) FROM donation_images WHERE donation_id = d.id) as images
      FROM donations d
      JOIN users u ON d.donor_id = u.id
      WHERE 1=1
    `

    const queryParams: any[] = []

    if (category) {
      query += " AND d.category = ?"
      queryParams.push(category)
    }

    if (conditions) {
      query += " AND d.conditions = ?"
      queryParams.push(conditions)
    }

    if (status) {
      query += " AND d.status = ?"
      queryParams.push(status)
    }

    if (donorId) {
      query += " AND d.donor_id = ?"
      queryParams.push(donorId)
    }

    if (ngoId) {
      query += " AND d.id IN (SELECT donation_id FROM donation_claims WHERE ngo_id = ?)"
      queryParams.push(ngoId)
    }

    query += " ORDER BY d.created_at DESC"

    // Execute the query
    const donations = await executeQuery<any[]>({
      query,
      values: queryParams,
    })

    // Process the results
    const processedDonations = donations.map((donation) => {
      return {
        ...donation,
        images: donation.images ? donation.images.split(",") : [],
      }
    })

    return NextResponse.json(processedDonations)
  } catch (error) {
    console.error("Error fetching donations:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch donations" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      console.error("Authentication failed:", authResult);
      return NextResponse.json(
        { success: false, message: "Unauthorized" }, 
        { status: 401 }
      );
    }

    const { user } = authResult;
    console.log("Authenticated user:", user);

    if (user.type !== "donor") {
      return NextResponse.json(
        { success: false, message: "Only donors can create donations" }, 
        { status: 403 }
      );
    }

    const body = await request.json();
    console.log("Request body:", body);

    // Validate required fields
    const requiredFields = ['name', 'category', 'conditions', 'description', 'delivery_option', 'location'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Missing required fields: ${missingFields.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // Insert donation
    const result = await executeQuery<any>({
      query: `
        INSERT INTO donations 
        (name, category, conditions, description, donor_id, delivery_option, location, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      values: [
        body.name,
        body.category,
        body.conditions,
        body.description,
        user.id,
        body.delivery_option,
        body.location,
        'pending' // Default status
      ],
    });

    console.log("Insert result:", result);

    const donationId = result.insertId;

    // Handle images if provided
   if (body.images && body.images.length > 0) {
  try {
    // Create placeholders and flatten values for MariaDB
    const placeholders = body.images.map(() => '(?, ?)').join(', ');
    const values = body.images.flatMap(url => [donationId, url]);
    
    await executeQuery({
      query: `
        INSERT INTO donation_images (donation_id, image_url)
        VALUES ${placeholders}
      `,
      values: values
    });
  } catch (imageError) {
    console.error("Image insertion error:", imageError);
    // Rollback donation if image insertion fails
    await executeQuery({
      query: "DELETE FROM donations WHERE id = ?",
      values: [donationId],
    });
    throw new Error("Failed to save donation images");
  }
}
    return NextResponse.json(
      { 
        success: true, 
        message: "Donation created successfully",
        donationId 
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error("Full error in API route:", {
      message: error.message,
      stack: error.stack
    });
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || "Failed to create donation",
        error: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}
