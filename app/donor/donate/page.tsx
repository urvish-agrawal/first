"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Camera, X } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }).max(100),
  category: z.string().min(1, { message: "Please select a category" }).max(50),
  conditions: z.enum(['excellent', 'good', 'fair', 'poor'], {
    required_error: "Please select the item condition"
  }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  delivery_option: z.enum(['pickup', 'delivery', 'both'], {
    required_error: "Please select a delivery option"
  }),
  location: z.string().min(5, { message: "Location must be at least 5 characters" }).max(100),
})

export default function DonatePage() {
  const router = useRouter()
  const { user, token } = useAuth()
  const { toast } = useToast()
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: "",
      conditions: undefined,
      description: "",
      delivery_option: undefined,
      location: "",
    },
  })

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)

    try {
      const MAX_SIZE = 5 * 1024 * 1024 // 5MB per file
      const validFiles = Array.from(files)
        .slice(0, 5 - imageUrls.length)
        .filter(file => {
          if (file.size > MAX_SIZE) {
            toast({
              title: "File too large",
              description: `${file.name} exceeds 5MB limit`,
              variant: "destructive",
            })
            return false
          }
          if (!file.type.startsWith("image/")) {
            toast({
              title: "Invalid file type",
              description: `${file.name} is not an image`,
              variant: "destructive",
            })
            return false
          }
          return true
        })

      if (validFiles.length === 0) return

      const formData = new FormData()
      validFiles.forEach(file => formData.append("images", file))

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to upload images")
      }

      const data = await response.json()
      setImageUrls(prev => [...prev, ...data.files])
    } catch (error: any) {
      console.error("Image upload error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to upload images",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const removeImage = (index: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index))
  }

const onSubmit = async (values: z.infer<typeof formSchema>) => {
  if (!user || !token) {
    toast({
      title: "Error",
      description: "You must be logged in to donate items",
      variant: "destructive",
    });
    router.push("/login");
    return;
  }

  setIsLoading(true);

  try {
    // Validate image URLs
    const validImageUrls = imageUrls.filter(url => 
      typeof url === 'string' && url.startsWith('/uploads/')
    );

    console.log("Submitting donation with:", {
      ...values,
      images: validImageUrls,
      donorId: user.id
    });

    const response = await fetch("/api/donations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...values,
        images: validImageUrls,
      }),
    });

    let responseData;
    try {
      responseData = await response.json().catch(() => ({}));
    } catch (e) {
      responseData = {};
      console.error("Failed to parse JSON response:", e);
    }

    console.log("API Response:", {
      status: response.status,
      statusText: response.statusText,
      data: responseData
    });

    if (!response.ok) {
      const errorDetails = {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseData,
      };
      console.error("API Error Details:", errorDetails);
      
      throw new Error(
        responseData.message || 
        response.statusText || 
        `Failed to create donation (Status: ${response.status})`
      );
    }

    toast({
      title: "Success",
      description: "Donation created successfully!",
      variant: "default",
    });
    router.push("/donor/dashboard");
  } catch (error: any) {
    console.error("Full error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });
    toast({
      title: "Error",
      description: error.message || "An unexpected error occurred",
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
};

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Please log in to donate items</h1>
        <Button asChild>
          <Link href="/login">Login</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Donate an Item</h1>

        <Card>
          <CardHeader>
            <CardTitle>Item Details</CardTitle>
            <CardDescription>Provide details about the item you wish to donate</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Winter Clothes Bundle" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="clothing">Clothing</SelectItem>
                            <SelectItem value="food">Food</SelectItem>
                            <SelectItem value="education">Education</SelectItem>
                            <SelectItem value="appliances">Appliances</SelectItem>
                            <SelectItem value="furniture">Furniture</SelectItem>
                            <SelectItem value="electronics">Electronics</SelectItem>
                            <SelectItem value="toys">Toys</SelectItem>
                            <SelectItem value="medical">Medical</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="conditions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Condition</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select condition" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="excellent">Excellent (Like New)</SelectItem>
                            <SelectItem value="good">Good (Minor Wear)</SelectItem>
                            <SelectItem value="fair">Fair (Visible Wear)</SelectItem>
                            <SelectItem value="poor">Poor (Functional but Worn)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Provide details about your donation"
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <h3 className="text-lg font-medium mb-2">Photos</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Add up to 5 photos of your item
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                    {imageUrls.map((url, index) => (
                      <div key={index} className="relative aspect-square">
                        <img
                          src={url}
                          alt={`Donation ${index + 1}`}
                          className="w-full h-full object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    {imageUrls.length < 5 && (
                      <label className="border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer aspect-square hover:bg-gray-50">
                        <Camera className="h-8 w-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">
                          {isUploading ? "Uploading..." : "Add Photo"}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                          multiple
                          disabled={isUploading}
                        />
                      </label>
                    )}
                  </div>
                </div>

                <Separator />

                <h3 className="text-lg font-medium">Delivery Information</h3>

                <FormField
                  control={form.control}
                  name="delivery_option"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Delivery Option</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select delivery option" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pickup">NGO Pickup Only</SelectItem>
                          <SelectItem value="delivery">I Can Deliver</SelectItem>
                          <SelectItem value="both">Both Options Available</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Mumbai, Maharashtra" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-4 pt-4">
                  <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading || isUploading}>
                    {isLoading ? "Creating..." : "List Donation"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}