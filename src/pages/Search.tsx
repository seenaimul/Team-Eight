import { useEffect, useState } from "react";
import { supabase } from "../supabase/client";
import FiltersSidebar from "../components/FiltersSidebar";
import { Button } from "../components/ui/Button";
import PropertyCard from "../components/PropertyCard";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import type { Property } from "../types";

export default function PropertyLayout() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProperties() {
      const { data: properties, error } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });
      
      console.log("PROPERTIES LOADED:", properties);
      
      if (error) {
        console.error("Error loading properties:", error);
      }
      
      if (!error && properties) {
        setProperties(properties);
      }
      setLoading(false);
    }

    loadProperties();
  }, []); // dependency array to run once

  return (
    <div className="flex gap-6 p-6">

      {/* Sidebar */}
      <FiltersSidebar />

      {/* Main content */}
      <main className="flex-1">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Sort by:</span>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              Recommended <ChevronDown className="h-4 w-4 opacity-60" />
            </Button>
          </div>
          <Button variant="outline" size="icon">
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {/* Property Grid */}
        {loading ? (
          <p>Loading properties...</p>
        ) : properties.length === 0 ? (
          <p className="text-gray-500">No properties available.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
