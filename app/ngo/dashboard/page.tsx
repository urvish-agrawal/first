
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Search, ShoppingBag, Truck, History, Settings } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Donation {
  id: number
  name: string
  category: string
  conditions: string
  status: string
  donor_id: number
  donor_name: string
  location: string
  created_at: string
  images: string[]
  description?: string
  delivery_option?: string
}

interface ClaimedDonation extends Donation {
  claim_status: string
  claimed_at: string
}

export default function NgoDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("browse")
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [conditionFilter, setConditionFilter] = useState("all")
  const [availableDonations, setAvailableDonations] = useState<Donation[]>([])
  const [claimedDonations, setClaimedDonations] = useState<ClaimedDonation[]>([])
  const [stats, setStats] = useState({
    total: 0,
    processing: 0,
    shipping: 0,
    delivered: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const { user, token } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user && token) {
      fetchAvailableDonations()
      fetchClaimedDonations()
    }
  }, [user, token])

  const fetchAvailableDonations = async () => {
    try {
      // Build query parameters based on filters
      const queryParams = new URLSearchParams()
      queryParams.append('status', 'pending')
      
      if (categoryFilter !== 'all') {
        queryParams.append('category', categoryFilter)
      }
      
      if (conditionFilter !== 'all') {
        queryParams.append('conditions', conditionFilter)
      }
      
      if (searchTerm) {
        queryParams.append('search', searchTerm)
      }

      const response = await fetch(`/api/donations?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setAvailableDonations(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch available donations",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching available donations:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  // Add useEffect to refetch when filters change
  useEffect(() => {
    if (activeTab === 'browse' && token) {
      fetchAvailableDonations()
    }
  }, [searchTerm, categoryFilter, conditionFilter])

  const fetchClaimedDonations = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/donations?ngoId=${user?.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setClaimedDonations(data)

        // Calculate stats
        const total = data.length
        const processing = data.filter((d: ClaimedDonation) => d.claim_status === "processing").length
        const shipping = data.filter((d: ClaimedDonation) => d.claim_status === "shipping").length
        const delivered = data.filter((d: ClaimedDonation) => d.claim_status === "delivered").length

        setStats({
          total,
          processing,
          shipping,
          delivered,
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch claimed donations",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching claimed donations:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const claimDonation = async (donationId: number) => {
    try {
      const response = await fetch("/api/donations/claim", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ donationId }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Donation claimed successfully",
          variant: "default",
        })
        fetchAvailableDonations()
        fetchClaimedDonations()
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.message || "Failed to claim donation",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error claiming donation:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "processing":
        return "bg-yellow-100 text-yellow-800"
      case "shipping":
        return "bg-blue-100 text-blue-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Filter donations based on search and filters
  const filteredDonations = availableDonations.filter((donation) => {
    const matchesSearch =
      searchTerm === "" ||
      donation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (donation.donor_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      donation.location.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = categoryFilter === "all" || donation.category === categoryFilter
    const matchesCondition = conditionFilter === "all" || donation.conditions === conditionFilter

    return matchesSearch && matchesCategory && matchesCondition
  })


  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString()
  }

  const viewDonationDetails = (donationId: number) => {
    router.push(`/donations/${donationId}`)
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
          <h1 className="text-3xl font-bold">NGO Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Claimed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.processing}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Shipping</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.shipping}</div>
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

      <Tabs defaultValue="browse" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 mb-8">
          <TabsTrigger value="browse">
            <Search className="mr-2 h-4 w-4" /> Browse Donations
          </TabsTrigger>
          <TabsTrigger value="claimed">
            <ShoppingBag className="mr-2 h-4 w-4" /> Claimed Items
          </TabsTrigger>
          <TabsTrigger value="delivery">
            <Truck className="mr-2 h-4 w-4" /> Delivery Status
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="mr-2 h-4 w-4" /> History
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="mr-2 h-4 w-4" /> Profile
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse">
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-1 md:col-span-3">
              <Input
                placeholder="Search donations by name, category, donor, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            {/* <div>
              <Select 
                value={categoryFilter} 
                onValueChange={(value) => setCategoryFilter(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Clothing">Clothing</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                  <SelectItem value="Appliances">Appliances</SelectItem>
                  <SelectItem value="Furniture">Furniture</SelectItem>
                  <SelectItem value="Toys">Toys</SelectItem>
                  <SelectItem value="Medical">Medical</SelectItem>
                  <SelectItem value="Food">Food</SelectItem>
                  <SelectItem value="Electronics">Electronics</SelectItem>
                </SelectContent>
              </Select>
            </div> */}
            {/* <div>
              <Select 
                value={conditionFilter} 
                onValueChange={(value) => setConditionFilter(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Conditions</SelectItem>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Like New">Like New</SelectItem>
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="Fair">Fair</SelectItem>
                </SelectContent>
              </Select>
            </div> */}
            {/* <div>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setCategoryFilter("all")
                  setConditionFilter("all")
                }}
              >
                Clear Filters
              </Button>
            </div> */}
          </div>

          {isLoading ? (
            <div className="text-center py-8">Loading donations...</div>
          ) : filteredDonations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No available donations found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDonations.map((donation) => (
                <Card key={donation.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{donation.name}</CardTitle>
                        <CardDescription>Category: {donation.category}</CardDescription>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-800">{donation.conditions}</Badge>
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
                        <p className="text-sm text-gray-500">Donor: {donation.donor_name}</p>
                        <p className="text-sm text-gray-500">Location: {donation.location}</p>
                        <p className="text-sm text-gray-500">Listed: {formatDate(donation.created_at)}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => viewDonationDetails(donation.id)}
                    >
                      View Details
                    </Button>
                    <Button size="sm" onClick={() => claimDonation(donation.id)}>
                      Claim Item
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>


        <TabsContent value="claimed">
          {isLoading ? (
            <div className="text-center py-8">Loading claimed items...</div>
          ) : claimedDonations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">You haven't claimed any items yet.</p>
              <Button asChild>
                <Link href="#" onClick={() => setActiveTab("browse")}>
                  Browse Available Donations
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {claimedDonations.map((item) => (
                <Card key={item.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{item.name}</CardTitle>
                        <CardDescription>Category: {item.category}</CardDescription>
                      </div>
                      <Badge className={getStatusColor(item.claim_status || "")}>
                        {item.claim_status
                          ? item.claim_status.charAt(0).toUpperCase() + item.claim_status.slice(1)
                          : "Unknown"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.images[0] || "/placeholder.svg?height=100&width=100"}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-md"
                      />
                      <div>
                        <p className="text-sm text-gray-500">Donor: {item.donor_name}</p>
                        <p className="text-sm text-gray-500">Claimed: {formatDate(item.claimed_at)}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/donations/${item.id}`}>View Details</Link>
                    </Button>
                    {item.claim_status === "delivered" && <Button size="sm">Leave Feedback</Button>}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="delivery">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Status</CardTitle>
              <CardDescription>Track your claimed items</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">Loading delivery status...</div>
              ) : claimedDonations.filter((d) => d.claim_status === "shipping").length === 0 ? (
                <p className="text-center text-gray-500">No items currently in transit.</p>
              ) : (
                <div className="space-y-4">
                  {claimedDonations
                    .filter((d) => d.claim_status === "shipping")
                    .map((item) => (
                      <div key={item.id} className="flex justify-between items-center border-b pb-4">
                        <div className="flex items-center space-x-4">
                          <img
                            src={item.images[0] || "/placeholder.svg?height=50&width=50"}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded-md"
                          />
                          <div>
                            <h3 className="font-medium">{item.name}</h3>
                            <p className="text-sm text-gray-500">Donor: {item.donor_name}</p>
                          </div>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">In Transit</Badge>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Claim History</CardTitle>
              <CardDescription>View all your past claims and their status</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">Loading history...</div>
              ) : claimedDonations.filter((d) => d.claim_status === "delivered").length === 0 ? (
                <p className="text-center text-gray-500">No delivery history yet.</p>
              ) : (
                <div className="space-y-4">
                  {claimedDonations
                    .filter((d) => d.claim_status === "delivered")
                    .map((item) => (
                      <div key={item.id} className="flex justify-between items-center border-b pb-4">
                        <div>
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="text-sm text-gray-500">
                            Claimed: {formatDate(item.claimed_at)} • Donor: {item.donor_name}
                          </p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Delivered</Badge>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your NGO account preferences</CardDescription>
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

