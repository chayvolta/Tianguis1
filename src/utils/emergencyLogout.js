// Emergency logout utility
// Run this in the browser console if you're stuck logged in

import { supabase } from '../lib/supabase';

export async function emergencyLogout() {
  console.log('🚨 Emergency logout initiated...');
  
  // Sign out from Supabase
  await supabase.auth.signOut();
  
  // Clear all local storage
  localStorage.clear();
  
  // Clear session storage
  sessionStorage.clear();
  
  console.log('✅ Logged out and cleared storage');
  console.log('👉 Please refresh the page (F5)');
  
  // Auto refresh after 1 second
  setTimeout(() => {
    window.location.reload();
  }, 1000);
}

// Make it available globally
window.emergencyLogout = emergencyLogout;
