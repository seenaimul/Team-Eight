import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../supabase/client';
import SellerSidebar from '../../components/seller/SellerSidebar';
import SellerHeader from '../../components/seller/SellerHeader';
import {
  Home,
  DollarSign,
  MapPin,
  TreePine,
  Image as ImageIcon,
  Camera,
  Upload,
} from 'lucide-react';

export default function AddProperty() {
  const navigate = useNavigate();
  const { userId: urlUserId } = useParams<{ userId: string }>();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [propertyType, setPropertyType] = useState('House');
  const [bedrooms, setBedrooms] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [postcode, setPostcode] = useState('');
  const [noiseLevel, setNoiseLevel] = useState('Low');
  const [nearPark, setNearPark] = useState(false);
  const [nearSchool, setNearSchool] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [virtualTourLink, setVirtualTourLink] = useState('https://your-virtual-tour-link.com');
  const [latitude, setLatitude] = useState<number | ''>('');
  const [longitude, setLongitude] = useState<number | ''>('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validate userId from URL matches current session user
  useEffect(() => {
    const validateUser = async () => {
      if (!urlUserId) {
        setIsAuthorized(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        navigate('/signin');
        return;
      }

      if (session.user.id !== urlUserId) {
        // User trying to access another user's data - unauthorized
        navigate('/unauthorized');
        setIsAuthorized(false);
        return;
      }

      setIsAuthorized(true);
    };

    validateUser();
  }, [urlUserId, navigate]);

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors({ ...errors, image: 'Please select a valid image file (PNG, JPG)' });
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrors({ ...errors, image: 'Image size must be less than 10MB' });
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setErrors({ ...errors, image: '' });
  };

  // Upload image to Supabase
  const uploadImageToSupabase = async (): Promise<string | null> => {
    if (!imageFile) return null;

    try {
      const ext = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('property-images')
        .upload(fileName, imageFile);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('property-images')
        .getPublicUrl(uploadData.path);

      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image. Please try again.');
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) newErrors.title = 'Property title is required';
    if (!bedrooms || bedrooms < 1) newErrors.bedrooms = 'Number of bedrooms is required';
    if (!description.trim() || description.length < 50) {
      newErrors.description = 'Description must be at least 50 characters';
    }
    if (!price || price < 0) newErrors.price = 'Property price is required';
    if (!streetAddress.trim()) newErrors.streetAddress = 'Street address is required';
    if (!city.trim()) newErrors.city = 'City is required';
    if (!postcode.trim()) newErrors.postcode = 'Postcode is required';
    if (!imageFile) newErrors.image = 'Property image is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Upload image first
      const imageUrl = await uploadImageToSupabase();

      if (!imageUrl) {
        throw new Error('Failed to upload image');
      }

      // Insert property into Supabase
      const { data, error } = await supabase
        .from('properties')
        .insert({
          title: title.trim(),
          description: description.trim(),
          price: Number(price),
          location: streetAddress.trim(),
          city: city.trim(),
          postcode: postcode.trim(),
          bedrooms: Number(bedrooms),
          property_type: propertyType,
          near_park: nearPark,
          near_school: nearSchool,
          noise_level: noiseLevel,
          image_url: imageUrl,
          virtual_tour_link: virtualTourLink.trim() && virtualTourLink !== 'https://your-virtual-tour-link.com' 
            ? virtualTourLink.trim() 
            : null,
          latitude: latitude === '' ? null : Number(latitude),
          longitude: longitude === '' ? null : Number(longitude),
        })
        .select();

      if (error) {
        console.error('Insert error:', error);
        throw error;
      }

      // Success - redirect to properties page
      if (urlUserId) {
        navigate(`/seller/${urlUserId}/properties`);
      }
    } catch (error: any) {
      console.error('Error creating property:', error);
      setErrors({ submit: error.message || 'Failed to create property listing. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (urlUserId) {
      navigate(`/seller/${urlUserId}/properties`);
    }
  };

  // Show loading while validating authorization
  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show unauthorized message
  if (isAuthorized === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Unauthorized</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <SellerSidebar />

        {/* Main Content */}
        <main className="flex-1 lg:ml-0">
          {/* Top Header */}
          <SellerHeader />

          {/* Page Content */}
          <div className="p-6 max-w-5xl mx-auto">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Property</h1>
              <p className="text-gray-600">Provide details about your property listing.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error message */}
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {errors.submit}
                </div>
              )}

              {/* SECTION 1: Basic Information */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Home className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
                </div>

                <div className="space-y-5">
                  {/* Property Title */}
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                      Property Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Modern 3-Bedroom House in City Centre"
                      className={`w-full rounded-lg border px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.title ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                  </div>

                  {/* Property Type */}
                  <div>
                    <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700 mb-2">
                      Property Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="propertyType"
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="House">House</option>
                      <option value="Flat">Flat</option>
                      <option value="Studio">Studio</option>
                      <option value="Cottage">Cottage</option>
                      <option value="Bungalow">Bungalow</option>
                      <option value="Detached">Detached</option>
                      <option value="Semi-detached">Semi-detached</option>
                    </select>
                  </div>

                  {/* Number of Bedrooms */}
                  <div>
                    <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Bedrooms <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                      </div>
                      <input
                        id="bedrooms"
                        type="number"
                        min="1"
                        value={bedrooms}
                        onChange={(e) => setBedrooms(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="e.g., 3"
                        className={`w-full rounded-lg border pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.bedrooms ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {errors.bedrooms && <p className="mt-1 text-sm text-red-600">{errors.bedrooms}</p>}
                  </div>

                  {/* Property Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      Property Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your property in detail. Include key features, amenities, and what makes it special..."
                      rows={6}
                      className={`w-full rounded-lg border px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                        errors.description ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    <p className="mt-1 text-xs text-gray-500">Minimum 50 characters recommended</p>
                    {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                  </div>
                </div>
              </div>

              {/* SECTION 2: Pricing */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Pricing</h2>
                </div>

                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                    Property Price <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-sm font-medium">£</span>
                    </div>
                    <input
                      id="price"
                      type="number"
                      min="0"
                      step="1000"
                      value={price}
                      onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="2500000"
                      className={`w-full rounded-lg border pl-8 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.price ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Enter the asking price in GBP (£).</p>
                  {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
                </div>
              </div>

              {/* SECTION 3: Location Details */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-yellow-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Location Details</h2>
                </div>

                <div className="space-y-5">
                  {/* Street Address */}
                  <div>
                    <label htmlFor="streetAddress" className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="streetAddress"
                      type="text"
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      placeholder="e.g., 5 Cuthbert Street, Albion Square"
                      className={`w-full rounded-lg border px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.streetAddress ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.streetAddress && <p className="mt-1 text-sm text-red-600">{errors.streetAddress}</p>}
                  </div>

                  {/* City and Postcode */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="city"
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g., London"
                        className={`w-full rounded-lg border px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.city ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
                    </div>

                    <div>
                      <label htmlFor="postcode" className="block text-sm font-medium text-gray-700 mb-2">
                        Postcode <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="postcode"
                        type="text"
                        value={postcode}
                        onChange={(e) => setPostcode(e.target.value)}
                        placeholder="e.g., SW1A 1AA"
                        className={`w-full rounded-lg border px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.postcode ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.postcode && <p className="mt-1 text-sm text-red-600">{errors.postcode}</p>}
                    </div>
                  </div>

                  {/* Noise Level */}
                  <div>
                    <label htmlFor="noiseLevel" className="block text-sm font-medium text-gray-700 mb-2">
                      Noise Level
                    </label>
                    <select
                      id="noiseLevel"
                      value={noiseLevel}
                      onChange={(e) => setNoiseLevel(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Low">Low (Quiet area)</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 4: Lifestyle Features */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                    <TreePine className="w-5 h-5 text-purple-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Lifestyle Features</h2>
                </div>

                <div className="space-y-4">
                  {/* Near Park Toggle */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                        <TreePine className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Near Park</p>
                        <p className="text-sm text-gray-500">Close to green spaces</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNearPark(!nearPark)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        nearPark ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          nearPark ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Near School Toggle */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l0-7" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Near School</p>
                        <p className="text-sm text-gray-500">Close to educational facilities</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNearSchool(!nearSchool)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        nearSchool ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          nearSchool ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* SECTION 5: Property Media */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 text-red-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Property Media</h2>
                </div>

                <div className="space-y-5">
                  {/* Property Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Property Image</label>
                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                        errors.image
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
                      }`}
                    >
                      {imagePreview ? (
                        <div className="space-y-4">
                          <img
                            src={imagePreview}
                            alt="Property preview"
                            className="max-h-64 mx-auto rounded-lg object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setImageFile(null);
                              setImagePreview(null);
                              // Clear file input
                              const fileInput = document.getElementById('image-upload') as HTMLInputElement;
                              if (fileInput) fileInput.value = '';
                            }}
                            className="text-sm text-red-600 hover:text-red-700"
                          >
                            Remove image
                          </button>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-sm text-gray-600 mb-2">Drop your image here, or browse</p>
                          <p className="text-xs text-gray-500 mb-4">PNG, JPG up to 10MB</p>
                          <label htmlFor="image-upload" className="inline-block">
                            <span className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-blue-700 transition-colors">
                              Choose File
                            </span>
                            <input
                              id="image-upload"
                              type="file"
                              accept="image/png,image/jpeg,image/jpg"
                              onChange={handleImageSelect}
                              className="hidden"
                            />
                          </label>
                        </>
                      )}
                    </div>
                    {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image}</p>}
                  </div>

                  {/* Virtual Tour Link */}
                  <div>
                    <label htmlFor="virtualTourLink" className="block text-sm font-medium text-gray-700 mb-2">
                      Virtual Tour Link (Optional)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Camera className="w-5 h-5 text-gray-400" />
                      </div>
                      <input
                        id="virtualTourLink"
                        type="url"
                        value={virtualTourLink}
                        onChange={(e) => setVirtualTourLink(e.target.value)}
                        placeholder="https://your-virtual-tour-link.com"
                        className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 6: Map Coordinates */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Map Coordinates</h2>
                    <p className="text-sm text-gray-500">Optional - Auto-filled from address</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-2">
                      Latitude
                    </label>
                    <input
                      id="latitude"
                      type="number"
                      step="any"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="51.5074"
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-2">
                      Longitude
                    </label>
                    <input
                      id="longitude"
                      type="number"
                      step="any"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="-0.1278"
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Map Preview */}
                <div className="border border-gray-200 rounded-lg h-64 bg-gray-50 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Map preview will appear here</p>
                  </div>
                </div>
              </div>

              {/* SECTION 7: Bottom Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Property Listing'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

