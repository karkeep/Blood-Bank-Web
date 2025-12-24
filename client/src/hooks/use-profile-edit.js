import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth-firebase';
import { toggleEmergencyAvailability, updateUserProfile } from '@/lib/firebase/user-service';
import { useToast } from '@/hooks/use-toast';

export function useProfileEdit() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    location: '',
    bloodType: '',
    emergencyAvailable: false,
    contactNumber: '',
    email: '',
    bio: '',
    fullName: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    phoneNumber: '',
  });
  
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        location: user.location || '',
        bloodType: user.bloodType || '',
        emergencyAvailable: user.emergencyAvailable || false,
        contactNumber: user.contactNumber || '',
        email: user.email || '',
        bio: user.bio || '',
        fullName: user.fullName || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        postalCode: user.postalCode || '',
        country: user.country || '',
        phoneNumber: user.phoneNumber || user.contactNumber || '',
      });
    }
  }, [user]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };
  
  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleEmergencyToggle = async (checked) => {
    if (!user) return;
    
    setIsToggling(true);
    
    try {
      await toggleEmergencyAvailability(user.id, checked);
      await refreshUser();
      
      toast({
        title: checked ? "Emergency availability enabled" : "Emergency availability disabled",
        description: checked 
          ? "You will now receive notifications for emergency donation requests matching your blood type." 
          : "You will no longer receive emergency donation requests.",
      });
      
      return true;
    } catch (error) {
      console.error('Error toggling emergency availability:', error);
      
      toast({
        title: "Update failed",
        description: "There was an error updating your availability. Please try again.",
        variant: "destructive",
      });
      
      return false;
    } finally {
      setIsToggling(false);
    }
  };
  
  const saveProfile = async () => {
    if (!user) return false;
    
    setIsLoading(true);
    
    try {
      await updateUserProfile(user.id, formData);
      await refreshUser();
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      
      toast({
        title: "Update failed",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive",
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    formData,
    setFormData,
    handleChange,
    handleSelectChange,
    handleEmergencyToggle,
    saveProfile,
    isLoading,
    isToggling,
  };
}
