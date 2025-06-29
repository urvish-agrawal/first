"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Plus, Package, History, Star, Settings } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"

interface Donation {
  id: number
  name: string
  category: string
  status: string
  created_at: string
  images: string[]
  donor_name?: string
}

export default function DonorDashboard() {
  const [activeTab, setActiveTab] = useState("donations")
  const [myDonations, setMyDonations] = useState<Donation[]>([])
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    claimed: 0,
    delivered: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const { user, token } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user && token) {
      fetchDonations()
    }
  }, [user, token])

  const fetchDonations = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/donations?donorId=${user?.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setMyDonations(data)

        // Calculate stats
        const total = data.length
        const pending = data.filter((d: Donation) => d.status === "pending").length
        const claimed = data.filter(
          (d: Donation) => d.status === "claimed" || d.status === "processing" || d.status === "shipping",
        ).length
        const delivered = data.filter((d: Donation) => d.status === "delivered").length

        setStats({
          total,
          pending,
          claimed,
          delivered,
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch donations",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching donations:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const cancelDonation = async (id: number) => {
    try {
      const response = await fetch(`/api/donations/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "cancelled" }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Donation cancelled successfully",
          variant: "default",
        })
        fetchDonations()
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.message || "Failed to cancel donation",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error cancelling donation:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "claimed":
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "shipping":
        return "bg-purple-100 text-purple-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString()
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Please log in to view your dashboard</h1>
        <Button asChild>
          <Link href="/login">Login</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Donor Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user.name}</p>
        </div>
        <Button asChild>
          <Link href="/donor/donate">
            <Plus className="mr-2 h-4 w-4" /> Donate Item
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Donations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Claimed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.claimed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Delivered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.delivered}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="donations" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="donations">
            <Package className="mr-2 h-4 w-4" /> My Donations
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="mr-2 h-4 w-4" /> History
          </TabsTrigger>
          <TabsTrigger value="reviews">
            <Star className="mr-2 h-4 w-4" /> Reviews
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="mr-2 h-4 w-4" /> Profile
          </TabsTrigger>
        </TabsList>

       <TabsContent value="donations">
        {isLoading ? (
          <div className="text-center py-8">Loading donations...</div>
        ) : myDonations.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">You haven't made any donations yet.</p>
            <Button asChild>
              <Link href="/donor/donate">Make Your First Donation</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myDonations.map((donation) => (
              <Card key={donation.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{donation.name}</CardTitle>
                      <CardDescription>Category: {donation.category}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(donation.status)}>
                      {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <img
                      src={donation.images[0] || "/placeholder.svg"}
                      alt={donation.name}
                      className="w-20 h-20 object-cover rounded-md"
                    />
                    <div>
                      <p className="text-sm text-gray-500">Date: {formatDate(donation.created_at)}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/donations/${donation.id}`}>View Details</Link>
                  </Button>
                  {donation.status === "pending" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => cancelDonation(donation.id)}
                    >
                      Cancel
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Donation History</CardTitle>
              <CardDescription>View all your past donations and their status</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">Loading history...</div>
              ) : (
                <div className="space-y-4">
                  {myDonations
                    .filter((d) => d.status === "delivered" || d.status === "cancelled")
                    .map((donation) => (
                      <div key={donation.id} className="flex justify-between items-center border-b pb-4">
                        <div>
                          <h3 className="font-medium">{donation.name}</h3>
                          <p className="text-sm text-gray-500">{new Date(donation.created_at).toLocaleDateString()}</p>
                        </div>
                        <Badge className={getStatusColor(donation.status)}>
                          {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                        </Badge>
                      </div>
                    ))}

                  {myDonations.filter((d) => d.status === "delivered" || d.status === "cancelled").length === 0 && (
                    <p className="text-center text-gray-500">No donation history yet.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <CardTitle>Reviews & Feedback</CardTitle>
              <CardDescription>See what NGOs are saying about your donations</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Your reviews and feedback will appear here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Name</h3>
                  <p>{user.name}</p>
                </div>
                <div>
                  <h3 className="font-medium">Email</h3>
                  <p>{user.email}</p>
                </div>
                <div>
                  <h3 className="font-medium">Phone</h3>
                  <p>{user.phone}</p>
                </div>
                <div>
                  <h3 className="font-medium">Address</h3>
                  <p>{user.address}</p>
                </div>
                <Button variant="outline">Edit Profile</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

