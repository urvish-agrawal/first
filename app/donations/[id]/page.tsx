"use client"

import { useEffect, useState, use } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Donation {
  id: number
  name: string
  category: string
  conditions: string
  description: string
  donor_id: number
  donor_name: string
  location: string
  delivery_option: string
  status: string
  created_at: string
  images: string[]
}

export default function DonationDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id: donationId } = use(params)
  const [donation, setDonation] = useState<Donation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { user, token } = useAuth()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterCondition, setFilterCondition] = useState('all')
  const [allDonations, setAllDonations] = useState<Donation[]>([])

  // Get all donations first (you might need to adjust your API endpoint)
  useEffect(() => {
    const fetchAllDonations = async () => {
      try {
        const response = await fetch('/api/donations', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setAllDonations(data)
        }
      } catch (error) {
        console.error("Error fetching all donations:", error)
      }
    }

    if (token) {
      fetchAllDonations()
    }
  }, [token])

  // Filter donations based on search and filter criteria
  const filteredDonations = allDonations.filter(donation => {
    const matchesSearch = donation.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         donation.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = filterCategory === 'all' || donation.category === filterCategory
    const matchesCondition = filterCondition === 'all' || donation.conditions === filterCondition

    return matchesSearch && matchesCategory && matchesCondition
  })

  const fetchDonation = async () => {
    try {
      const response = await fetch(`/api/donations/${donationId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setDonation(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch donation details",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching donation:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchDonation()
    }
  }, [donationId, token, toast])

  const claimDonation = async () => {
    if (!donation) return
    
    try {
      const response = await fetch("/api/donations/claim", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ donationId: donation.id }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Donation claimed successfully",
          variant: "default",
        })
        setDonation({ ...donation, status: "claimed" })
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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Loading donation details...</p>
      </div>
    )
  }

  if (!donation) {
    return (
      <div className="container mx-auto px-4 py-8">
        {/* Add filter controls at the top */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Input
            placeholder="Search donations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/3"
          />
          
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full md:w-1/4">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="clothing">Clothing</SelectItem>
              <SelectItem value="food">Food</SelectItem>
              <SelectItem value="furniture">Furniture</SelectItem>
              <SelectItem value="electronics">Electronics</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterCondition} onValueChange={setFilterCondition}>
            <SelectTrigger className="w-full md:w-1/4">
              <SelectValue placeholder="Filter by condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Conditions</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="used">Used</SelectItem>
              <SelectItem value="refurbished">Refurbished</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredDonations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDonations.map((donation) => (
              <Card key={donation.id}>
                <CardHeader>
                  <CardTitle>{donation.name}</CardTitle>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">{donation.category}</Badge>
                    <Badge className="bg-emerald-100 text-emerald-800">{donation.conditions}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <Image
                      src={donation.images[0] || "/placeholder.svg"}
                      alt={donation.name}
                      width={400}
                      height={300}
                      className="rounded-lg object-cover w-full h-48"
                    />
                  </div>
                  <p className="text-gray-600 line-clamp-2">{donation.description}</p>
                  <Button asChild className="w-full mt-4">
                    <Link href={`/donations/${donation.id}`}>View Details</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p>No donations found matching your criteria</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setSearchTerm('')
                setFilterCategory('all')
                setFilterCondition('all')
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
     

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle>{donation.name}</CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline">{donation.category}</Badge>
              <Badge className="bg-emerald-100 text-emerald-800">{donation.conditions}</Badge>
              <Badge variant="secondary">{donation.status}</Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="mb-4">
                <Image
                  src={donation.images[0] || "/placeholder.svg"}
                  alt={donation.name}
                  width={600}
                  height={400}
                  className="rounded-lg object-cover w-full h-64"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {donation.images.slice(1).map((image, index) => (
                  <Image
                    key={index}
                    src={image}
                    alt={`${donation.name} ${index + 1}`}
                    width={200}
                    height={150}
                    className="rounded-md object-cover w-full h-24"
                  />
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Description</h3>
                <p className="text-gray-600">{donation.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium">Donor</h3>
                  <p className="text-gray-600">{donation.donor_name}</p>
                </div>
                <div>
                  <h3 className="font-medium">Location</h3>
                  <p className="text-gray-600">{donation.location}</p>
                </div>
                <div>
                  <h3 className="font-medium">Delivery Option</h3>
                  <p className="text-gray-600">{donation.delivery_option}</p>
                </div>
                <div>
                  <h3 className="font-medium">Listed On</h3>
                  <p className="text-gray-600">
                    {new Date(donation.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {donation.status === "pending" && user?.type === "ngo" && (
                <Button 
                  onClick={claimDonation}
                  className="w-full mt-6"
                >
                  Claim This Donation
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}