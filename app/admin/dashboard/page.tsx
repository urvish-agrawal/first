"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Users, Building2, Package, AlertTriangle, CheckCircle, XCircle, X } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"

// Types
interface User {
  id: number | string
  name: string
  email: string
  type: string
  status: string
  created_at: string
  phone?: string
  address?: string
}

interface NGO extends User {
  registration_number?: string
  description?: string
}

interface Donation {
  id: number
  name: string
  donor_name: string
  category: string
  conditions: string
  status: string
  created_at: string
  description?: string
  location?: string
  delivery_option?: string
  images: string[]
}

interface Report {
  id: number
  type: string
  subject: string
  reporter: string
  status: string
  date: string
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [users, setUsers] = useState<User[]>([])
  const [ngos, setNgos] = useState<NGO[]>([])
  const [donations, setDonations] = useState<Donation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalNgos: 0,
    totalDonations: 0,
    pendingReports: 8, // This would come from a real API in production
  })

  // View modal states
  const [viewUserDialog, setViewUserDialog] = useState(false)
  const [viewNgoDialog, setViewNgoDialog] = useState(false)
  const [viewDonationDialog, setViewDonationDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedNgo, setSelectedNgo] = useState<NGO | null>(null)
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null)

  const { toast } = useToast()

  // Fetch users, NGOs, and donations
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch all users
        const usersResponse = await fetch("/api/users?type=donor")
        const usersData = await usersResponse.json()
        setUsers(usersData)

        // Fetch NGOs
        const ngosResponse = await fetch("/api/users?type=ngo")
        const ngosData = await ngosResponse.json()
        setNgos(ngosData)

        // Fetch donations
        const donationsResponse = await fetch("/api/donations")
        const donationsData = await donationsResponse.json()
        setDonations(donationsData)

        // Update stats
        setStats({
          totalUsers: usersData.length,
          totalNgos: ngosData.length,
          totalDonations: donationsData.length,
          pendingReports: 8, // This would come from a real API in production
        })
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [toast])

  // Handle user status change
  const handleUserStatusChange = async (userId: number | string, newStatus: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update user status")
      }

      // Update the user in the state
      setUsers((prevUsers) => prevUsers.map((user) => (user.id === userId ? { ...user, status: newStatus } : user)))

      toast({
        title: "Success",
        description: `User status updated to ${newStatus} successfully.`,
      })
    } catch (error) {
      console.error("Error updating user status:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update user status. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle NGO approval
  const handleApproveNGO = async (ngoId: number | string) => {
    try {
      const response = await fetch(`/api/users/${ngoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "active" }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to approve NGO")
      }

      // Update the NGO in the state
      setNgos((prevNgos) => prevNgos.map((ngo) => (ngo.id === ngoId ? { ...ngo, status: "active" } : ngo)))

      toast({
        title: "Success",
        description: "NGO has been approved successfully.",
      })
    } catch (error) {
      console.error("Error approving NGO:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to approve NGO. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle NGO deactivation
  const handleDeactivateNGO = async (ngoId: number | string) => {
    try {
      const response = await fetch(`/api/users/${ngoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "inactive" }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to deactivate NGO")
      }

      // Update the NGO in the state
      setNgos((prevNgos) => prevNgos.map((ngo) => (ngo.id === ngoId ? { ...ngo, status: "inactive" } : ngo)))

      toast({
        title: "Success",
        description: "NGO has been deactivated successfully.",
      })
    } catch (error) {
      console.error("Error deactivating NGO:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to deactivate NGO. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle NGO activation
  const handleActivateNGO = async (ngoId: number | string) => {
    try {
      const response = await fetch(`/api/users/${ngoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "active" }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to activate NGO")
      }

      // Update the NGO in the state
      setNgos((prevNgos) => prevNgos.map((ngo) => (ngo.id === ngoId ? { ...ngo, status: "active" } : ngo)))

      toast({
        title: "Success",
        description: "NGO has been activated successfully.",
      })
    } catch (error) {
      console.error("Error activating NGO:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to activate NGO. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle donation removal
  const handleRemoveDonation = async (donationId: number) => {
    try {
      const response = await fetch(`/api/donations/${donationId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to remove donation")
      }

      // Remove the donation from the state
      setDonations((prevDonations) => prevDonations.filter((donation) => donation.id !== donationId))

      // Update total donations count
      setStats((prevStats) => ({
        ...prevStats,
        totalDonations: prevStats.totalDonations - 1,
      }))

      toast({
        title: "Success",
        description: "Donation has been removed successfully.",
      })
    } catch (error) {
      console.error("Error removing donation:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove donation. Please try again.",
        variant: "destructive",
      })
    }
  }

  // View user details
  const handleViewUser = (user: User) => {
    setSelectedUser(user)
    setViewUserDialog(true)
  }

  // View NGO details
  const handleViewNgo = (ngo: NGO) => {
    setSelectedNgo(ngo)
    setViewNgoDialog(true)
  }

  // View donation details
  const handleViewDonation = async (donationId: number) => {
    try {
      // Fetch detailed donation information
      const response = await fetch(`/api/donations/${donationId}`)

      if (!response.ok) {
        throw new Error("Failed to fetch donation details")
      }

      const donationData = await response.json()
      setSelectedDonation(donationData)
      setViewDonationDialog(true)
    } catch (error) {
      console.error("Error fetching donation details:", error)
      toast({
        title: "Error",
        description: "Failed to fetch donation details. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Status badge color mapping
  const getUserStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "approved":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "inactive":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getDonationStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800"
      case "shipping":
        return "bg-blue-100 text-blue-800"
      case "processing":
        return "bg-yellow-100 text-yellow-800"
      case "claimed":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getReportStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-800"
      case "investigating":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Mock data for reports (to be replaced with real API data later)
  const reports = [
    {
      id: 1,
      type: "user",
      subject: "Inappropriate behavior",
      reporter: "Hope Foundation",
      status: "pending",
      date: "2023-12-10",
    },
    {
      id: 2,
      type: "donation",
      subject: "Item not as described",
      reporter: "Children's Care",
      status: "resolved",
      date: "2023-11-25",
    },
    {
      id: 3,
      type: "ngo",
      subject: "Suspicious activity",
      reporter: "John Doe",
      status: "investigating",
      date: "2023-12-05",
    },
  ]

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, Admin</p>
        </div>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">
            <Users className="mr-2 h-4 w-4" /> Users
          </TabsTrigger>
          <TabsTrigger value="ngos">
            <Building2 className="mr-2 h-4 w-4" /> NGOs
          </TabsTrigger>
          <TabsTrigger value="donations">
            <Package className="mr-2 h-4 w-4" /> Donations
          </TabsTrigger>
          {/* <TabsTrigger value="reports">
            <AlertTriangle className="mr-2 h-4 w-4" /> Reports
          </TabsTrigger> */}
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalUsers}</div>
                <p className="text-sm text-gray-500">+12 this month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total NGOs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalNgos}</div>
                <p className="text-sm text-gray-500">+3 this month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total Donations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalDonations}</div>
                <p className="text-sm text-gray-500">+45 this month</p>
              </CardContent>
            </Card>
            {/* <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Pending Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.pendingReports}</div>
                <p className="text-sm text-gray-500">-2 from last week</p>
              </CardContent>
            </Card> */}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Users</CardTitle>
                <CardDescription>Latest user registrations</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Join Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...users, ...ngos]
                      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                      .slice(0, 5)
                      .map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.name}</TableCell>
                          <TableCell className="capitalize">{user.type}</TableCell>
                          <TableCell>
                            <Badge className={getUserStatusColor(user.status)}>{user.status}</Badge>
                          </TableCell>
                          <TableCell>{formatDate(user.created_at)}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Donations</CardTitle>
                <CardDescription>Latest donation activities</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Donor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {donations
                      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                      .slice(0, 5)
                      .map((donation) => (
                        <TableRow key={donation.id}>
                          <TableCell>{donation.name}</TableCell>
                          <TableCell>{donation.donor_name}</TableCell>
                          <TableCell>
                            <Badge className={getDonationStatusColor(donation.status)}>{donation.status}</Badge>
                          </TableCell>
                          <TableCell>{formatDate(donation.created_at)}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage all registered donors</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell className="capitalize">{user.type}</TableCell>
                      <TableCell>
                        <Badge className={getUserStatusColor(user.status)}>{user.status}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(user.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleViewUser(user)}>
                            View
                          </Button>
                          {user.status === "active" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-500"
                              onClick={() => handleUserStatusChange(user.id, "inactive")}
                            >
                              Deactivate
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-500"
                              onClick={() => handleUserStatusChange(user.id, "active")}
                            >
                              Activate
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ngos">
          <Card>
            <CardHeader>
              <CardTitle>NGO Management</CardTitle>
              <CardDescription>Manage all registered NGOs</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ngos.map((ngo) => (
                    <TableRow key={ngo.id}>
                      <TableCell>{ngo.name}</TableCell>
                      <TableCell>{ngo.email}</TableCell>
                      <TableCell>
                        <Badge className={getUserStatusColor(ngo.status)}>{ngo.status}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(ngo.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleViewNgo(ngo)}>
                            View
                          </Button>
                          {ngo.status === "pending" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-500"
                              onClick={() => handleApproveNGO(ngo.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" /> Approve
                            </Button>
                          )}
                          {ngo.status === "active" || ngo.status === "approved" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-500"
                              onClick={() => handleDeactivateNGO(ngo.id)}
                            >
                              <XCircle className="h-4 w-4 mr-1" /> Deactivate
                            </Button>
                          ) : (
                            ngo.status === "inactive" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-green-500"
                                onClick={() => handleActivateNGO(ngo.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" /> Activate
                              </Button>
                            )
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="donations">
          <Card>
            <CardHeader>
              <CardTitle>Donation Management</CardTitle>
              <CardDescription>Monitor all donation activities</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Donor</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {donations.map((donation) => (
                    <TableRow key={donation.id}>
                      <TableCell>{donation.name}</TableCell>
                      <TableCell>{donation.donor_name}</TableCell>
                      <TableCell className="capitalize">{donation.category}</TableCell>
                      <TableCell className="capitalize">{donation.conditions}</TableCell>
                      <TableCell>
                        <Badge className={getDonationStatusColor(donation.status)}>{donation.status}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(donation.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleViewDonation(donation.id as number)}>
                            View
                          </Button>
                          {donation.status === "pending" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-500"
                              onClick={() => handleRemoveDonation(donation.id as number)}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Report Management</CardTitle>
              <CardDescription>Handle user and donation reports</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Reporter</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="capitalize">{report.type}</TableCell>
                      <TableCell>{report.subject}</TableCell>
                      <TableCell>{report.reporter}</TableCell>
                      <TableCell>
                        <Badge className={getReportStatusColor(report.status)}>{report.status}</Badge>
                      </TableCell>
                      <TableCell>{report.date}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                          {report.status === "pending" && (
                            <>
                              <Button variant="outline" size="sm" className="text-green-500">
                                <CheckCircle className="h-4 w-4 mr-1" /> Resolve
                              </Button>
                              <Button variant="outline" size="sm" className="text-red-500">
                                <XCircle className="h-4 w-4 mr-1" /> Dismiss
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent> */}
      </Tabs>

      {/* User View Dialog */}
      <Dialog open={viewUserDialog} onOpenChange={setViewUserDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              User Details
              <DialogClose className="h-4 w-4 opacity-70" onClick={() => setViewUserDialog(false)}>
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </DialogClose>
            </DialogTitle>
            <DialogDescription>Detailed information about the user</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Name</h3>
                  <p>{selectedUser.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Email</h3>
                  <p>{selectedUser.email}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Type</h3>
                  <p className="capitalize">{selectedUser.type}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <Badge className={getUserStatusColor(selectedUser.status)}>{selectedUser.status}</Badge>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Join Date</h3>
                  <p>{formatDate(selectedUser.created_at)}</p>
                </div>
                {selectedUser.phone && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                    <p>{selectedUser.phone}</p>
                  </div>
                )}
                {selectedUser.address && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Address</h3>
                    <p>{selectedUser.address}</p>
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-2">
                {selectedUser.status === "active" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500"
                    onClick={() => {
                      handleUserStatusChange(selectedUser.id, "inactive")
                      setViewUserDialog(false)
                    }}
                  >
                    Deactivate User
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-green-500"
                    onClick={() => {
                      handleUserStatusChange(selectedUser.id, "active")
                      setViewUserDialog(false)
                    }}
                  >
                    Activate User
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* NGO View Dialog */}
      <Dialog open={viewNgoDialog} onOpenChange={setViewNgoDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              NGO Details
              <DialogClose className="h-4 w-4 opacity-70" onClick={() => setViewNgoDialog(false)}>
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </DialogClose>
            </DialogTitle>
            <DialogDescription>Detailed information about the NGO</DialogDescription>
          </DialogHeader>
          {selectedNgo && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Name</h3>
                  <p>{selectedNgo.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Email</h3>
                  <p>{selectedNgo.email}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <Badge className={getUserStatusColor(selectedNgo.status)}>{selectedNgo.status}</Badge>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Join Date</h3>
                  <p>{formatDate(selectedNgo.created_at)}</p>
                </div>
                {selectedNgo.registration_number && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Registration Number</h3>
                    <p>{selectedNgo.registration_number}</p>
                  </div>
                )}
                {selectedNgo.phone && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                    <p>{selectedNgo.phone}</p>
                  </div>
                )}
                {selectedNgo.address && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Address</h3>
                    <p>{selectedNgo.address}</p>
                  </div>
                )}
              </div>
              {selectedNgo.description && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Description</h3>
                  <p className="text-sm">{selectedNgo.description}</p>
                </div>
              )}
              <div className="flex justify-end space-x-2">
                {selectedNgo.status === "pending" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-green-500"
                    onClick={() => {
                      handleApproveNGO(selectedNgo.id)
                      setViewNgoDialog(false)
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" /> Approve
                  </Button>
                )}
                {selectedNgo.status === "active" || selectedNgo.status === "approved" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500"
                    onClick={() => {
                      handleDeactivateNGO(selectedNgo.id)
                      setViewNgoDialog(false)
                    }}
                  >
                    <XCircle className="h-4 w-4 mr-1" /> Deactivate
                  </Button>
                ) : (
                  selectedNgo.status === "inactive" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-500"
                      onClick={() => {
                        handleActivateNGO(selectedNgo.id)
                        setViewNgoDialog(false)
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" /> Activate
                    </Button>
                  )
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Donation View Dialog */}
      <Dialog open={viewDonationDialog} onOpenChange={setViewDonationDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              Donation Details
              <DialogClose className="h-4 w-4 opacity-70" onClick={() => setViewDonationDialog(false)}>
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </DialogClose>
            </DialogTitle>
            <DialogDescription>Detailed information about the donation</DialogDescription>
          </DialogHeader>
          {selectedDonation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Item Name</h3>
                  <p>{selectedDonation.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Donor</h3>
                  <p>{selectedDonation.donor_name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Category</h3>
                  <p className="capitalize">{selectedDonation.category}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Condition</h3>
                  <p className="capitalize">{selectedDonation.conditions}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <Badge className={getDonationStatusColor(selectedDonation.status)}>{selectedDonation.status}</Badge>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Date Listed</h3>
                  <p>{formatDate(selectedDonation.created_at)}</p>
                </div>
                {selectedDonation.location && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Location</h3>
                    <p>{selectedDonation.location}</p>
                  </div>
                )}
                {selectedDonation.delivery_option && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Delivery Option</h3>
                    <p className="capitalize">{selectedDonation.delivery_option}</p>
                  </div>
                )}
              </div>
              {selectedDonation.description && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Description</h3>
                  <p className="text-sm">{selectedDonation.description}</p>
                </div>
              )}
              {selectedDonation.images && selectedDonation.images.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Images</h3>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {selectedDonation.images.map((image, index) => (
                      <img
                        key={index}
                        src={image || "/placeholder.svg"}
                        alt={`${selectedDonation.name} - image ${index + 1}`}
                        className="w-full h-20 object-cover rounded-md"
                      />
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-end space-x-2">
                {selectedDonation.status === "pending" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500"
                    onClick={() => {
                      handleRemoveDonation(selectedDonation.id as number)
                      setViewDonationDialog(false)
                    }}
                  >
                    Remove Donation
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

