import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Gift, Building2, Users } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Needy Connect</h1>
            <p className="text-xl md:text-2xl mb-8">Bridging the gap between generosity and need</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-emerald-600 hover:bg-gray-100">
                <Link href="/register?type=donor">Register as Donor</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-transparent border-white text-white hover:bg-white/10"
              >
                <Link href="/register?type=ngo">Register as NGO</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Donors</h3>
              <p className="text-gray-600">
                Register and list items you wish to donate. Upload photos and provide details about your donation.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">NGOs</h3>
              <p className="text-gray-600">
                Browse available donations, filter by category, and claim items that meet your organization's needs.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Connection</h3>
              <p className="text-gray-600">
                Coordinate delivery, provide feedback, and build a community of giving and receiving.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Donation Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["Clothing", "Food", "Education", "Appliances", "Furniture", "Electronics", "Toys", "Medical"].map(
              (category) => (
                <div
                  key={category}
                  className="bg-emerald-50 hover:bg-emerald-100 transition-colors p-4 rounded-lg text-center cursor-pointer"
                >
                  <p className="font-medium text-emerald-700">{category}</p>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-emerald-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Make a Difference?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join our platform today and be part of a community that's making a real impact.
          </p>
          <Button asChild size="lg" className="bg-white text-emerald-600 hover:bg-gray-100">
            <Link href="/register" className="inline-flex items-center">
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Needy Connect</h3>
              <p className="text-gray-300">Bridging the gap between generosity and need.</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-gray-300 hover:text-white">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-300 hover:text-white">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-gray-300 hover:text-white">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Contact Us</h3>
              <p className="text-gray-300">
                Email: info@needyconnect.org
                <br />
                Phone: +91 1234567890
              </p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; {new Date().getFullYear()} Needy Connect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

