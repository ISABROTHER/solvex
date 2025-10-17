// @ts-nocheck
import React from "react";
import { useState } from "react";
import { RefreshCw, Database, CircleCheck as CheckCircle, CircleAlert as AlertCircle } from "lucide-react";
import Card from "../components/Card";
import { supabase } from "../../../../lib/supabase/client";

const SettingsTab: React.FC = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [syncMessage, setSyncMessage] = useState('');

  const handleDatabaseSync = async () => {
    setIsSyncing(true);
    setSyncStatus('idle');
    setSyncMessage('');

    try {
      // --- LIVE RENTAL EQUIPMENT SEEDING ---
      const equipmentData = [
        {
          name: "DJI Osmo Pocket 3 Creator Combo",
          description: "Compact and capable 4K pocket gimbal camera.",
          category: "Camera",
          price_per_day: 100, 
          image_url: 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcSoYt3SQZ4JdARHvsnt5YNwEcLOgCK3ChpttRQ11k2-aVn6OiYSfJq7Upf10YZUtSUsxy8FFVDNiyxYdGfzaU2lk6uvdPM5dsGQaoFwVRdQBPHn9qb82eu4ww', 
          features: ['1-Inch CMOS & 4K/120fps', '2-Inch Rotatable Screen', '3-Axis Gimbal Mechanical Stabilization'], 
          video_url: 'https://www.youtube.com/embed/MZq_2OJ5kOo', 
          is_available: true
        },
        {
          name: "Sony A7 IV",
          description: "Mirrorless hybrid camera with image stabilization and lightning-fast autofocus.",
          category: "Camera",
          price_per_day: 700,
          image_url: 'https://www.japanphoto.no/imageserver/750/750/scale/p/japan/PIM_PROD/Sony/PIM1143909_Sony_1634709214767.jpg',
          features: ['Newly developed back-illuminated 33 megapixel Exmor R sensor', '4K/60p video in super35 format'],
          video_url: 'https://www.youtube.com/embed/bUgOEDqhZVY',
          is_available: true
        },
        {
          name: "DJI MINI 4 PRO FLY MORE COMBO (DJI RC 2)",
          description: "Professional drone with 4K HDR capabilities.",
          category: "Drone",
          price_per_day: 500,
          image_url: 'https://djioslo.no/Userfiles/Upload/images/Modules/Eshop/27473_31283_DJI-Mini-4-Pro-RC-2-2.jpeg',
          features: ['Under 249g', '4K/60fps HDR True Vertical Shooting', 'Omnidirectional obstacle sensing'],
          video_url: 'https://www.youtube.com/embed/FaCKViuXd_I',
          is_available: true
        },
        {
          name: "Sony FE 28-70mm f/3.5-5.6 US",
          description: "Lightweight, compact 35mm full-frame standard zoom lens.",
          category: "Lens",
          price_per_day: 150,
          image_url: 'https://www.sony.no/image/fd6df2f58083e52631a23154639f3571?fmt=pjpeg&wid=1014&hei=396&bgcolor=F1F5F9&bgc=F1F5F9',
          features: ['Lightweight, compact 35mm full-frame standard zoom lens', '28-70mm zoom range and F3.5-5.6 aperture'],
          video_url: 'https://www.youtube.com/embed/x4ZZC5nqS0o',
          is_available: true
        },
        {
          name: "DJI MIC MINI",
          description: "Carry Less, Capture More",
          category: "Audio",
          price_per_day: 30,
          image_url: 'https://djioslo.no/Userfiles/Upload/images/Modules/Eshop/31146_DJI-Mic-Mini-45-DJI-Mic-Mini-Transmitte(1).png',
          features: ['Small, ultralight, discreet', 'High-quality sound with stable transmission'],
          video_url: 'https://www.youtube.com/embed/iBgZJJ-NBTs',
          is_available: true
        },
        {
          name: "Canon EOS 5D Mark II",
          description: "Full Frame DSLR Camera",
          category: "Camera",
          price_per_day: 800,
          image_url: 'https://m.media-amazon.com/images/I/819GW4aelwL._AC_SL1500_.jpg',
          features: ['21MP - Full frame CMOS Sensor', 'ISO 100 - 6400( expands to 50 - 25600)'],
          video_url: 'https://www.youtube.com/embed/y_34mvEZGx0',
          is_available: true
        }
      ];

      const { error: equipmentError } = await supabase
        .from('rental_gear')
        .upsert(equipmentData, { onConflict: 'name', ignoreDuplicates: false });

      if (equipmentError) throw equipmentError;
      // --- END RENTAL EQUIPMENT SEEDING ---


      // --- TEAM & JOB POSITIONS SEEDING ---

      const jobTeamsData = [
        { name: "Strategy & Planning Team", image_url: "https://images.pexels.com/photos/7490890/pexels-photo-7490890.jpeg" },
        { name: "Technology and Innovation Team", image_url: "https://images.pexels.com/photos/5239811/pexels-photo-5239811.jpeg" },
        { name: "Marketing Team", image_url: "https://images.pexels.com/photos/7691715/pexels-photo-7691715.jpeg" },
        { name: "Content & Production Team", image_url: "https://images.pexels.com/photos/12249084/pexels-photo-12249084.jpeg" }
      ];

      // 1. Upsert Teams
      const { data: teams, error: teamsError } = await supabase
        .from('job_teams')
        .upsert(jobTeamsData, { onConflict: 'name' }) 
        .select('id, name');

      if (teamsError) throw teamsError;
      if (!teams) throw new Error("Failed to retrieve upserted teams.");

      const teamMap = new Map(teams.map(t => [t.name, t.id]));
      
      // 2. Define Positions (Used by Careers Page)
      const positionsData = [
          // Strategy & Planning Team
          { name: "Brand Strategist", description: "Lead strategic initiatives and provide expert consultation to drive business growth and innovation.", team_name: "Strategy & Planning Team" },
          { name: "Advertising Specialist", description: "Analyze business processes and requirements to identify opportunities for improvement and optimization.", team_name: "Strategy & Planning Team" },
          { name: "Product Innovator", description: "Analyze business processes and requirements to identify opportunities for improvement and optimization.", team_name: "Strategy & Planning Team" },
          
          // Technology Team
          { name: "Software Developer/Engineer", description: "Build and maintain web applications using modern technologies and best practices.", team_name: "Technology and Innovation Team" },
          { name: "Cloud Architect/DevOps Engineer", description: "Create intuitive and engaging user experiences through thoughtful design and user research.", team_name: "Technology and Innovation Team" },
          { name: "Artificial Intelligence Specialist", description: "Focus on exploring, prototyping, and integrating cutting-edge technologies relevant to their clients' needs.", team_name: "Technology and Innovation Team" },
          
          // Marketing Team
          { name: "Digital Marketer", description: "Drive digital marketing campaigns and strategies to increase brand awareness and customer acquisition.", team_name: "Marketing Team" },
          { name: "Influencer / Brand Ambassador", description: "Builds visibility for clients by creating content that amplifies clients' brand campaigns and engages target audiences.", team_name: "Marketing Team" },
          { name: "Content Creator", description: "Produce engaging content across various platforms to connect with our audience and tell our story.", team_name: "Marketing Team" },
          
          // Content & Production Team
          { name: "Video Editor / Videographer", description: "Produces, edits and enhances video content to deliver polished, high-impact campaigns.", team_name: "Content & Production Team" },
          { name: "Photographer", description: "Product, lifestyle, and brand photography.", team_name: "Content & Production Team" },
          { name: "Graphic Designer", description: "Develop visual concepts and designs that communicate ideas and inspire audiences.", team_name: "Content & Production Team" },
          { name: "Motion Graphics Designer", description: "Produces animations and visuals for ads, social media and brand storytelling.", team_name: "Content & Production Team" }
      ];

      const positionsForUpsert = positionsData
        .map(p => ({
          team_id: teamMap.get(p.team_name),
          name: p.name,
          description: p.description
        }))
        .filter(p => p.team_id);

      const { error: positionsError } = await supabase
          .from('job_positions')
          .upsert(positionsForUpsert, { onConflict: 'team_id, name', ignoreDuplicates: false }); 
      
      if (positionsError) throw positionsError;
      // --- END JOB POSITIONS SEEDING ---


      // --- TEAM MEMBERS SEEDING (16 Members) ---
      // This data will populate the 'members' table and link to the 'teams' table.
      const membersData = [
          // Strategy & Planning Team (ID required for linking)
          { full_name: "Kwame Agyemang", email: "kwame.a@solvex.com", role_title: "Head of Strategy", team_name: "Strategy & Planning Team" },
          { full_name: "Ama Mensah", email: "ama.m@solvex.com", role_title: "Brand Consultant", team_name: "Strategy & Planning Team" },
          { full_name: "Nii Kojo", email: "nii.k@solvex.com", role_title: "Market Analyst", team_name: "Strategy & Planning Team" },

          // Technology and Innovation Team
          { full_name: "Kofi Boateng", email: "kofi.b@solvex.com", role_title: "Senior Software Engineer", team_name: "Technology and Innovation Team" },
          { full_name: "Yaa Nkrumah", email: "yaa.n@solvex.com", role_title: "Cloud Architect", team_name: "Technology and Innovation Team" },
          { full_name: "Aisha Iddrisu", email: "aisha.i@solvex.com", role_title: "AI Specialist", team_name: "Technology and Innovation Team" },
          { full_name: "Esi Akonnor", email: "esi.a@solvex.com", role_title: "Junior Developer", team_name: "Technology and Innovation Team" },

          // Marketing Team
          { full_name: "Michael Ansah", email: "michael.a@solvex.com", role_title: "Chief Marketing Officer", team_name: "Marketing Team" },
          { full_name: "Jessica Osei", email: "jessica.o@solvex.com", role_title: "Digital Campaign Manager", team_name: "Marketing Team" },
          { full_name: "Daniel Obeng", email: "daniel.o@solvex.com", role_title: "Influencer Liaison", team_name: "Marketing Team" },
          { full_name: "Gloria Adjei", email: "gloria.a@solvex.com", role_title: "Content Writer", team_name: "Marketing Team" },

          // Content & Production Team
          { full_name: "Yaw Asante", email: "yaw.a@solvex.com", role_title: "Creative Director", team_name: "Content & Production Team" },
          { full_name: "Esther Darko", email: "esther.d@solvex.com", role_title: "Senior Videographer", team_name: "Content & Production Team" },
          { full_name: "Isaac Odoom", email: "isaac.o@solvex.com", role_title: "Lead Graphic Designer", team_name: "Content & Production Team" },
          { full_name: "Linda Owusu", email: "linda.o@solvex.com", role_title: "Motion Designer", team_name: "Content & Production Team" },
          
          // Unassigned (total 16 members)
          { full_name: "New Hire Trainee", email: "trainee@solvex.com", role_title: "Trainee", team_name: "Unassigned" }, 
      ];
      
      const teamIdMap = new Map(teams.map(t => [t.name, t.id]));
      
      // Prepare members for upsert, linking them to the teams table
      const membersForUpsert = membersData.map(m => ({
          ...m,
          team_id: teamIdMap.get(m.team_name) || null, // Link to team ID or null for 'Unassigned'
          // Since 'profile_id' is a foreign key, we need a UUID here.
          // For mock data, we generate deterministic IDs to avoid conflicts.
          profile_id: m.email.substring(0, 8).padEnd(36, '0'), // Mock UUID based on email prefix
      }));

      const { error: membersError } = await supabase
          .from('members')
          // Assuming the unique constraint is on (team_id, profile_id) for safe upsert
          .upsert(membersForUpsert, { onConflict: 'team_id, profile_id', ignoreDuplicates: false }); 
      
      if (membersError) throw membersError;
      // --- END TEAM MEMBERS SEEDING ---


      setSyncStatus('success');
      setSyncMessage('Database successfully synced with fresh data! (16 Team Members Loaded)');
    } catch (error) {
      console.error('Database sync error:', error);
      setSyncStatus('error');
      setSyncMessage(`Sync failed: ${(error as Error).message}. Ensure all required RLS and tables are active.`);
    } finally {
      setIsSyncing(false);
      setTimeout(() => {
        setSyncStatus('idle');
        setSyncMessage('');
      }, 5000);
    }
  };

  return (
    <div className="space-y-6">
      <Card title="Database Management">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-semibold text-gray-900">Sync Database</h3>
              <p className="text-sm text-gray-600">Update database with latest equipment and job data (including 16 members)</p>
            </div>
            <button
              onClick={handleDatabaseSync}
              disabled={isSyncing}
              className="flex items-center gap-2 bg-[#FF5722] text-white px-4 py-2 rounded-lg hover:bg-[#E64A19] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </button>
          </div>
          
          {syncStatus !== 'idle' && (
            <div className={`flex items-center gap-2 p-3 rounded-lg ${
              syncStatus === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {syncStatus === 'success' ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span className="text-sm">{syncMessage}</span>
            </div>
          )}
        </div>
      </Card>
      {/* ... (Rest of the Settings Tab content remains the same) ... */}
    </div>
  );
};

export default SettingsTab;