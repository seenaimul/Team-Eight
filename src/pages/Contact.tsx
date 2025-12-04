import { Mail, Phone, MapPin } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

export default function ContactPage() {
  const pageUrl = window.location.href;

  return (
    <div className="max-w-6xl mx-auto p-6">

      {/* Page Title */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-gray-900">Contact Us</h1>
        <p className="text-gray-600 mt-2">
          We'd love to hear from you. Reach out with any questions or enquiries.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

        {/* Left Column – Contact Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Get in Touch</h2>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Phone className="text-blue-600" />
              <p className="text-gray-700">+44 0203 123 4567</p>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="text-blue-600" />
              <p className="text-gray-700">support@youragency.com</p>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="text-blue-600" />
              <p className="text-gray-700">
                221B Baker Street  
                <br />
                London, NW1 6XE
              </p>
            </div>
          </div>

          {/* QR Code */}
          <div className="mt-6 flex flex-col items-center">
            <QRCodeCanvas value={pageUrl} size={140} includeMargin />
            <p className="text-xs text-gray-500 mt-2 text-center">
              Scan to open this contact page.
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white md:col-span-2 rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Send a Message</h2>

          <form className="space-y-6">
            {/* Name */}
            <div>
              <label className="block font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 
                           focus:ring-blue-500 focus:outline-none"
                placeholder="Your full name"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 
                           focus:ring-blue-500 focus:outline-none"
                placeholder="you@example.com"
                required
              />
            </div>

            {/* Message */}
            <div>
              <label className="block font-medium text-gray-700 mb-1">Message</label>
              <textarea
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 
                           focus:ring-blue-500 focus:outline-none"
                placeholder="How can we help you?"
                required
              ></textarea>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>

      {/* MAP SECTION */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Location</h2>

        <div className="w-full h-72 rounded-xl overflow-hidden shadow-md border border-gray-200">
          <iframe
            title="map"
            width="100%"
            height="100%"
            loading="lazy"
            allowFullScreen
            src={`https://www.google.com/maps?q=221B Baker Street, London&output=embed`}
          ></iframe>
        </div>
      </div>

    </div>
  );
}
