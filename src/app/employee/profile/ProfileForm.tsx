"use client";

import { useState, useRef } from "react";
import { updateEmployeeProfile } from "@/actions/employee";
import { Camera, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function ProfileForm({ user, profile, allServices = [] }: { user: any; profile: any; allServices?: string[] }) {
  const [isPending, setIsPending] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(profile.photoUrl || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>(profile.services || []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleService = (service: string) => {
    setSelectedServices(prev => 
      prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]
    );
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedServices(profile.services || []);
    setPhotoPreview(profile.photoUrl || null);
    setSelectedFile(null);
    setMessage(null);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    
    // Append selected services
    formData.delete("services");
    selectedServices.forEach(s => formData.append("services", s));
    
    if (selectedFile) {
      const uploadData = new FormData();
      uploadData.append("files", selectedFile);
      try {
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadData,
        });
        if (uploadRes.ok) {
          const { urls } = await uploadRes.json();
          if (urls && urls.length > 0) {
            formData.set("photoUrl", urls[0]);
          }
        } else {
          setMessage({ type: 'error', text: "Failed to upload photo." });
          setIsPending(false);
          return;
        }
      } catch (err) {
        setMessage({ type: 'error', text: "Error uploading photo." });
        setIsPending(false);
        return;
      }
    }
    const result = await updateEmployeeProfile(formData);

    if (result.success) {
      setMessage({ type: 'success', text: "Profile updated successfully." });
      setIsEditing(false);
    } else {
      setMessage({ type: 'error', text: result.error || "Failed to update profile." });
    }
    
    setIsPending(false);
  }

  return (
    <>
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Edit Profile</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to edit your profile?</p>
            <div className="flex gap-3 justify-end">
              <button 
                type="button"
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-gray-700 font-bold hover:bg-gray-100 rounded-xl transition-colors"
              >
                No
              </button>
              <button 
                type="button"
                onClick={() => {
                  setShowConfirm(false);
                  setIsEditing(true);
                }}
                className="px-4 py-2 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex justify-between items-center border-b border-gray-100 pb-4">
          <h2 className="text-xl font-bold">Profile Details</h2>
          {!isEditing && (
            <button 
              type="button"
              onClick={() => setShowConfirm(true)}
              className="px-4 py-2 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-colors text-sm"
            >
              Edit Profile
            </button>
          )}
        </div>

        {message && (
          <div className={`p-4 rounded-xl flex items-start gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        {/* Profile Photo */}
        <div className="flex items-center gap-6">
          <div 
            onClick={isEditing ? handlePhotoClick : undefined}
            className={`relative w-24 h-24 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden ${isEditing ? 'cursor-pointer group' : ''}`}
          >
            {photoPreview ? (
              <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <Camera className={`w-8 h-8 ${isEditing ? 'text-gray-400 group-hover:text-gray-600' : 'text-gray-400'} transition-colors`} />
            )}
            {isEditing && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-xs font-bold">Change</span>
              </div>
            )}
          </div>
          {isEditing && (
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1">Profile Photo</label>
              <button 
                type="button" 
                onClick={handlePhotoClick}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-200 transition-colors"
              >
                Change Photo
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Editable Fields (When in edit mode) */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-gray-900 border-b pb-2">Information</h3>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number</label>
              {isEditing ? (
                <input 
                  type="text" 
                  name="phone" 
                  defaultValue={user.phone || ""} 
                  required
                  maxLength={10}
                  pattern="\d{10}"
                  placeholder="10 digit number"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-black/5 outline-none transition-all text-sm"
                />
              ) : (
                <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 text-sm">
                  {user.phone || "Not specified"}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Address</label>
              {isEditing ? (
                <textarea 
                  name="address" 
                  defaultValue={profile.address || ""} 
                  rows={3}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-black/5 outline-none transition-all text-sm resize-none"
                />
              ) : (
                <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 text-sm whitespace-pre-wrap">
                  {profile.address || "Not specified"}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Assigned Services</label>
              {isEditing ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {allServices.map(service => (
                      <label key={service} className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                        <input 
                          type="checkbox" 
                          checked={selectedServices.includes(service)}
                          onChange={() => toggleService(service)}
                          className="w-4 h-4 text-black focus:ring-black border-gray-300 rounded"
                        />
                        <span className="text-sm font-medium text-gray-900">{service}</span>
                      </label>
                    ))}
                    {allServices.length === 0 && (
                      <p className="text-sm text-gray-500 italic col-span-2">No active services available.</p>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Select the services you are qualified to perform.</p>
                </>
              ) : (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedServices.length > 0 ? selectedServices.map((s: string) => (
                    <span key={s} className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700">
                      {s}
                    </span>
                  )) : (
                    <span className="text-sm text-gray-500">No services assigned.</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Read-Only Fields */}
          <div className="space-y-4 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
            <h3 className="font-bold text-lg text-gray-900 border-b pb-2">Account Details (Read-Only)</h3>
            
            <div>
              <label className="block text-sm font-bold text-gray-500 mb-1">Full Name</label>
              <div className="px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-700 text-sm">
                {user.name}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-500 mb-1">Email Address</label>
              <div className="px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-700 text-sm">
                {user.email}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-500 mb-1">Gender</label>
              <div className="px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-700 text-sm">
                {profile.gender || "Not specified"}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-500 mb-1">Date of Birth</label>
              <div className="px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-700 text-sm">
                {profile.dob ? new Date(profile.dob).toLocaleDateString("en-US") : "Not specified"}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-500 mb-1">Aadhaar Status</label>
              <div className="px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-700 text-sm flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${profile.status === 'APPROVED' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                {profile.status}
              </div>
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="pt-6 border-t border-gray-100 flex justify-end gap-4">
            <button 
              type="button" 
              onClick={handleCancel}
              disabled={isPending}
              className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isPending}
              className="px-8 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Changes
            </button>
          </div>
        )}
      </form>
    </>
  );
}
