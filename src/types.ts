export interface Property {
    id: number;
    user_id?: string;
    title: string;
    description?: string;
    price: number;
    location: string;
    city: string;
    postcode: string;
    bedrooms: number;
    property_type: string;
    listing_type: string;
    near_park?: boolean;
    near_school?: boolean;
    noise_level?: number;
    image_urls?: string[];          // updated
    image_url?: string;
    virtual_tour_link?: string;
    latitude: number;
    longitude: number;
    created_at?: string;
  }
  