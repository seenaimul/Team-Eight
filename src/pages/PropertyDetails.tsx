import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../supabase/client";
import { QRCodeCanvas } from "qrcode.react";
import type { Property } from "../types";

export default function PropertyDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchProperty = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("id", Number(id))
        .single();

      if (error) {
        console.error(error);
        setProperty(null);
      } else {
        setProperty(data);
      }

      setLoading(false);
    };

    fetchProperty();
  }, [id]);

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!property) return <p className="text-center mt-10">Property not found</p>;

  const pageUrl = window.location.href;

  return (
    <div className="max-w-6xl mx-auto p-6">

      {/* HEADER IMAGE */}
      {property.image_url && (
        <div className="mb-8">
          <img
            src={property.image_url}
            alt={property.title}
            className="w-full h-96 object-cover rounded-xl shadow-md"
          />
        </div>
      )}

      {/* TITLE + PRICE */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">{property.title}</h1>
          <p className="text-gray-600 text-lg mt-1">
            {property.location}, {property.city} {property.postcode}
          </p>
        </div>
        <p className="text-blue-600 text-3xl font-bold mt-4 md:mt-0">
          £{property.price.toLocaleString()}
        </p>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* LEFT SECTION */}
        <div className="md:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-gray-700 leading-relaxed">{property.description}</p>
          </div>

          {/* Details */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-4">Property Details</h2>
            <div className="grid grid-cols-2 gap-4 text-gray-700">
              <p><strong>Bedrooms:</strong> {property.bedrooms}</p>
              <p><strong>Type:</strong> {property.property_type}</p>
              {property.near_school && <p><strong>Nearby:</strong> School</p>}
              {property.near_park && <p><strong>Nearby:</strong> Park</p>}
              {property.noise_level && <p><strong>Noise Level:</strong> {property.noise_level}</p>}
              {property.virtual_tour_link && (
                <p className="col-span-2">
                  <strong>Virtual Tour:</strong>{" "}
                  <a
                    href={property.virtual_tour_link}
                    className="text-blue-500 underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    View Tour
                  </a>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR — QR CODE PANEL */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-xl font-semibold mb-4">Share / Print</h3>

          <div className="flex flex-col items-center">
            <QRCodeCanvas value={pageUrl} size={180} includeMargin />

            <p className="text-gray-600 text-sm mt-4 text-center">
              Scan to view this property online.
            </p>

            <button
              onClick={() => window.print()}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg"
            >
              Print Page
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
