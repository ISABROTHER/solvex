// @ts-nocheck
import React, { useState, useEffect } from "react";
import { useAuth } from "../../features/auth/AuthProvider"; // <-- CORRECTED IMPORT
import { supabase } from "../../lib/supabase/client"; // Import Supabase client for profile updates
import { useToast } from "../../contexts/ToastContext";
import { Loader2, Save } from "lucide-react";

// Assuming Profile type matches your 'profiles' table structure
// You might need to import this type properly
type Profile = {
  id?: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  // Add other fields as necessary
};

const ProfilePage: React.FC = () => {
  const { user, session } = useAuth(); // Get authenticated user info
  const { addToast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch profile data on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) {
        setLoading(false);
        setError("User not found.");
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from("profiles")
          .select("first_name, last_name, email, phone, company") // Select desired fields
          .eq("id", user.id)
          .single();

        if (fetchError) {
          if (fetchError.code === 'PGRST116') { // Profile not found
            console.warn("Profile not found for user:", user.id);
            setProfile({ email: user.email }); // Initialize with email at least
            setError("Profile data incomplete. Please fill in your details.");
          } else {
             throw fetchError; // Rethrow other errors
          }
        } else {
          setProfile(data);
        }
      } catch (err: any) {
        console.error("Error fetching profile:", err);
        setError(err.message || "Failed to load profile data.");
        addToast({ type: 'error', title: 'Loading Error', message: 'Could not load profile.' });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, addToast]); // Depend on user object

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => (prev ? { ...prev, [name]: value } : null));
  };

  // Handle profile update submission
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !profile) return;

    setIsUpdating(true);
    setError(null);

    try {
       // Prepare data for update (ensure 'id' is not included if updating)
       const updateData: Omit<Profile, 'id' | 'email'> = { // Exclude id and email (usually shouldn't be changed here)
           first_name: profile.first_name,
           last_name: profile.last_name,
           phone: profile.phone,
           company: profile.company,
           // Add updated_at if your trigger isn't handling it automatically (it should be)
           // updated_at: new Date().toISOString()
       };

      const { error: updateError } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", user.id); // Update the profile matching the user's ID

      if (updateError) throw updateError;

      addToast({ type: 'success', title: 'Profile Updated', message: 'Your details have been saved.' });
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setError(err.message || "Failed to update profile.");
      addToast({ type: 'error', title: 'Update Failed', message: 'Could not save profile changes.' });
    } finally {
      setIsUpdating(false);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">My Profile</h1>

      {error && !loading && ( // Show error prominently if loading finished
         <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-md text-sm">
             {error}
         </div>
      )}


      {profile ? (
        <form onSubmit={handleUpdateProfile} className="bg-white p-6 rounded-lg shadow space-y-4">
          {/* Email (Read-only) */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={profile.email || user?.email || ""} // Show profile email or fallback to auth email
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
              disabled // Email shouldn't be changed here
            />
             <p className="mt-1 text-xs text-gray-500">Email cannot be changed here.</p>
          </div>

          {/* First Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="first_name">
                  First Name
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name" // Name must match state key
                  value={profile.first_name || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FF5722]"
                  disabled={isUpdating}
                />
              </div>

            {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="last_name">
                  Last Name
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name" // Name must match state key
                  value={profile.last_name || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FF5722]"
                  disabled={isUpdating}
                />
              </div>
          </div>


          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="phone">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone" // Name must match state key
              value={profile.phone || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FF5722]"
              disabled={isUpdating}
            />
          </div>

          {/* Company */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="company">
              Company (Optional)
            </label>
            <input
              type="text"
              id="company"
              name="company" // Name must match state key
              value={profile.company || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FF5722]"
              disabled={isUpdating}
            />
          </div>

          {/* Update Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isUpdating}
              className="w-full sm:w-auto flex justify-center items-center gap-2 bg-[#FF5722] text-white font-bold py-2 px-6 rounded-md hover:bg-[#E64A19] transition-colors disabled:opacity-50 disabled:cursor-wait"
            >
              {isUpdating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5"/>}
              {isUpdating ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      ) : (
         // Case where profile is null after loading and no specific error was set earlier
         <p className="text-center text-gray-500">Could not load profile information.</p>
      )}
    </div>
  );
};

export default ProfilePage;