"use client"

import { useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"

const donorFormSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email({ message: "Please enter a valid email address." }),
    password: z.string().min(8, { message: "Password must be at least 8 characters." }),
    confirmPassword: z.string(),
    phone: z.string().min(10, { message: "Please enter a valid phone number." }),
    address: z.string().min(5, { message: "Address must be at least 5 characters." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

const ngoFormSchema = z
  .object({
    name: z.string().min(2, { message: "NGO name must be at least 2 characters." }),
    email: z.string().email({ message: "Please enter a valid email address." }),
    password: z.string().min(8, { message: "Password must be at least 8 characters." }),
    confirmPassword: z.string(),
    phone: z.string().min(10, { message: "Please enter a valid phone number." }),
    address: z.string().min(5, { message: "Address must be at least 5 characters." }),
    description: z.string().min(20, { message: "Description must be at least 20 characters." }),
    registrationNumber: z.string().min(5, { message: "Registration number is required." }),
    category: z.string().min(1, { message: "Please select a category." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export default function RegisterPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const { register } = useAuth()
  const defaultTab = searchParams.get("type") || "donor"
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [isLoading, setIsLoading] = useState(false)

  const donorForm = useForm<z.infer<typeof donorFormSchema>>({
    resolver: zodResolver(donorFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      address: "",
    },
  })

  const ngoForm = useForm<z.infer<typeof ngoFormSchema>>({
    resolver: zodResolver(ngoFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      address: "",
      description: "",
      registrationNumber: "",
      category: "",
    },
  })

  async function onDonorSubmit(values: z.infer<typeof donorFormSchema>) {
    setIsLoading(true)

    try {
      const userData = {
        ...values,
        type: "donor",
      }

      const result = await register(userData)

      if (result.success) {
        toast({
          title: "Registration successful",
          description: "Your account has been created. You can now log in.",
          variant: "default",
        })
        router.push("/login")
      } else {
        toast({
          title: "Registration failed",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function onNgoSubmit(values: z.infer<typeof ngoFormSchema>) {
    setIsLoading(true)

    try {
      const userData = {
        ...values,
        type: "ngo",
      }

      const result = await register(userData)

      if (result.success) {
        toast({
          title: "Registration successful",
          description: "Your NGO account has been created. Please wait for admin approval before logging in.",
          variant: "default",
        })
        router.push("/login")
      } else {
        toast({
          title: "Registration failed",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Create an Account</h1>

        <Tabs defaultValue={defaultTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="donor">Donor</TabsTrigger>
            <TabsTrigger value="ngo">NGO</TabsTrigger>
          </TabsList>

          <TabsContent value="donor">
            <Form {...donorForm}>
              <form onSubmit={donorForm.handleSubmit(onDonorSubmit)} className="space-y-4">
                <FormField
                  control={donorForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={donorForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={donorForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={donorForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={donorForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+91 1234567890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={donorForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Your full address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Registering..." : "Register as Donor"}
                </Button>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="ngo">
            <Form {...ngoForm}>
              <form onSubmit={ngoForm.handleSubmit(onNgoSubmit)} className="space-y-4">
                <FormField
                  control={ngoForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NGO Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Organization Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={ngoForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="contact@ngo.org" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={ngoForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={ngoForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={ngoForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+91 1234567890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={ngoForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea placeholder="NGO full address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={ngoForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Tell us about your organization" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={ngoForm.control}
                  name="registrationNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Registration Number</FormLabel>
                      <FormControl>
                        <Input placeholder="NGO Registration Number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={ngoForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NGO Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="environment">Environment</SelectItem>
                          <SelectItem value="children">Children</SelectItem>
                          <SelectItem value="elderly">Elderly</SelectItem>
                          <SelectItem value="women">Women Empowerment</SelectItem>
                          <SelectItem value="animals">Animal Welfare</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Registering..." : "Register as NGO"}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-emerald-600 hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

