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


      // --- TEAM & JOB POSITIONS SEEDING (FIXED LOGIC) ---

      const jobTeamsData = [
        { name: "Strategy & Planning Team", image_url: "https://images.pexels.com/photos/7490890/pexels-photo-7490890.jpeg" },
        { name: "Technology and Innovation Team", image_url: "https://images.pexels.com/photos/5239811/pexels-photo-5239811.jpeg" },
        { name: "Marketing Team", image_url: "https://images.pexels.com/photos/7691715/pexels-photo-7691715.jpeg" },
        { name: "Content & Production Team", image_url: "https://images.pexels.com/photos/12249084/pexels-photo-12249084.jpeg" }
      ];

      // 1. Upsert Teams (using teams table)
      const { data: upsertedTeams, error: teamsError } = await supabase
        .from('teams')
        .upsert(jobTeamsData.map((t, idx) => ({ name: t.name, image_url: t.image_url, display_order: idx + 1 })), { onConflict: 'name' })
        .select('id, name');

      if (teamsError) throw teamsError;

      // Create a map of team name to team id
      const teamMap = new Map((upsertedTeams || []).map(t => [t.name, t.id]));

      // 2. Define Positions
      const positionsData = [
          // Strategy & Planning Team
          { title: "Brand Strategist", description: "Lead strategic initiatives and provide expert consultation to drive business growth and innovation.", team_name: "Strategy & Planning Team", status: "open" },
          { title: "Advertising Specialist", description: "Analyze business processes and requirements to identify opportunities for improvement and optimization.", team_name: "Strategy & Planning Team", status: "open" },
          { title: "Product Innovator", description: "Analyze business processes and requirements to identify opportunities for improvement and optimization.", team_name: "Strategy & Planning Team", status: "open" },

          // Technology Team
          { title: "Software Developer/Engineer", description: "Build and maintain web applications using modern technologies and best practices.", team_name: "Technology and Innovation Team", status: "open" },
          { title: "Cloud Architect/DevOps Engineer", description: "Create intuitive and engaging user experiences through thoughtful design and user research.", team_name: "Technology and Innovation Team", status: "open" },
          { title: "Artificial Intelligence Specialist", description: "Focus on exploring, prototyping, and integrating cutting-edge technologies relevant to their clients' needs.", team_name: "Technology and Innovation Team", status: "open" },

          // Marketing Team
          { title: "Digital Marketer", description: "Drive digital marketing campaigns and strategies to increase brand awareness and customer acquisition.", team_name: "Marketing Team", status: "open" },
          { title: "Influencer / Brand Ambassador", description: "Builds visibility for clients by creating content that amplifies clients' brand campaigns and engages target audiences.", team_name: "Marketing Team", status: "open" },
          { title: "Content Creator", description: "Produce engaging content across various platforms to connect with our audience and tell our story.", team_name: "Marketing Team", status: "open" },

          // Content & Production Team
          { title: "Video Editor / Videographer", description: "Produces, edits and enhances video content to deliver polished, high-impact campaigns.", team_name: "Content & Production Team", status: "open" },
          { title: "Photographer", description: "Product, lifestyle, and brand photography.", team_name: "Content & Production Team", status: "open" },
          { title: "Graphic Designer", description: "Develop visual concepts and designs that communicate ideas and inspire audiences.", team_name: "Content & Production Team", status: "open" },
          { title: "Motion Graphics Designer", description: "Produces animations and visuals for ads, social media and brand storytelling.", team_name: "Content & Production Team", status: "open" }
      ];

      // 3. Upsert Positions with team_id
      const positionsWithTeamId = positionsData.map(p => ({
        ...p,
        team_id: teamMap.get(p.team_name) || null
      }));

      const { error: positionsError } = await supabase
          .from('job_positions')
          .upsert(positionsWithTeamId, { onConflict: 'team_name, title' }); 
      
      if (positionsError) throw positionsError;
      // --- END TEAM & JOB POSITIONS SEEDING ---


      // --- SERVICES SEEDING ---
      const servicesData = [
        {
          title: "Communication and PR",
          summary: "We build resilient reputations through proactive, culturally-intelligent communication. We move beyond traditional PR, employing innovative strategies to protect your brand, manage crises, and build lasting stakeholder trust in a fast-paced digital world.",
          image_url: "https://i.imgur.com/ncbHyV7.jpeg",
          title_color: "text-sky-800",
          description: "Reputation is a company's most valuable asset. In Ghana, businesses and institutions don't fail only because of poor products or services — they fail because their message is unclear, their reputation is unprotected, or their response to crises is too slow.\n\nSolveX Studios' Communication & PR team brings decades of combined expertise in politics, journalism, administration, and business. This matters because public communication in Ghana is not just about press releases — it's about understanding the political environment, navigating communities, and engaging stakeholders with cultural intelligence.",
          sub_services: ["Strategic Communication & Consulting – Set long-term communication goals and design roadmaps that make them achievable.", "Community & Government Relations – Strengthen your reputation with stakeholders and decision-makers. Our advisors bring experience from national politics and business, ensuring your message is heard where it matters.", "Media Training – We prepare leaders and teams to face the media with confidence. Our training emphasizes practical, camera-ready exercises and real-life crisis simulations.", "Crisis Communication – A crisis is not a matter of \"if\" but \"when.\" We help you prepare for the unexpected with playbooks, training, and tools to manage crises without destroying trust."],
          outcome: "Your organization speaks with authority, handles crises with confidence, and builds trust that lasts.",
          status: "published"
        },
        {
          title: "Advertising",
          summary: "Advertising is an investment, not an expense. We combine data-driven strategy with creative innovation to deliver campaigns that capture attention and drive measurable results. Stop boosting posts and start building a powerful, performance-driven advertising engine.",
          image_url: "https://i.imgur.com/4jflSHz.jpeg",
          title_color: "text-emerald-800",
          description: "In today's Ghana, brands are competing for attention on radio, TV, and digital — but most SMEs waste their ad budgets by \"boosting\" random posts or running unfocused campaigns. Advertising without strategy is not just wasteful; it damages credibility.\n\nSolveX fixes that by ensuring every ad spend works harder. We combine data, creative content, and channel expertise to place your brand in front of the right audience at the right time.",
          sub_services: ["Media Strategy – Turn market data into actionable insights. We guide your customer journey and decide the best channel, context, and timing.", "Media Buying & Planning – Spend smartly. We structure campaign plans that align with both your business goals and audience behavior.", "Performance Marketing – We optimize campaigns continuously, ensuring you pay for measurable results — not vanity metrics.", "Social Media Ads – Instagram, Facebook, TikTok, LinkedIn — we design content that works natively and targets precisely.", "Display & Programmatic – Build brand presence and target niche audiences with intelligent placement."],
          outcome: "Your ads stop being expenses. They become investments that return customers, leads, and measurable growth.",
          status: "published"
        },
        {
          title: "Photography & Videography",
          summary: "In a visual-first world, your story's impact is defined by its quality. We produce strategically-aligned visuals—from stunning photography to compelling video—that don't just look beautiful, but are engineered to convert, convince, and build your brand.",
          image_url: "https://i.imgur.com/W3qrVCz.jpeg",
          title_color: "text-violet-800",
          description: "Words explain. Visuals convince. In a world dominated by TikTok, Instagram, and YouTube, a single powerful video can do more for your business than months of talking.\n\nSolveX Studios produces visuals that are not only beautiful but strategically aligned with your business outcomes. Whether you need a portrait that communicates professionalism, a product photo that makes customers click buy, or a campaign video that sparks emotion, our creative team delivers.",
          sub_services: ["Photography – Portraits, product images, branding visuals for websites, campaigns, and ads.", "Video – From short social clips to full-length brand documentaries.", "Drone Filming – Aerial and interior shots that create immersive experiences.", "Editing & Repurposing – One shoot produces multiple assets: reels, banners, ads, website visuals."],
          outcome: "Your story isn't just told — it's seen, remembered, and shared.",
          status: "published"
        },
        {
          title: "Content Marketing",
          summary: "We create content that builds communities and drives inbound growth. By combining SEO, creative storytelling, and strategic distribution, we turn your brand into a trusted authority that attracts, engages, and converts your ideal customers.",
          image_url: "https://i.imgur.com/QMF0hEF.jpeg",
          title_color: "text-rose-800",
          description: "Most businesses in Ghana spend money on ads, but forget that customers don't trust ads alone. They trust useful content, consistent stories, and brands that teach and engage.\n\nContent marketing is the art of building long-term relationships with your audience. Done right, it makes customers seek you out, not the other way around. At SolveX, we create content that is both creative and commercially effective.",
          sub_services: ["Inbound Marketing – We design systems that nurture long-term customer relationships through valuable, relevant content.", "Text Production – Our experienced writers create articles, reports, campaign scripts, and digital copy that showcase your brand voice.", "Photo & Film – We produce engaging visuals that turn complex ideas into clear messages.", "Animation – 2D and 3D motion graphics that explain, excite, and engage audiences.", "Podcasts – We help you conceptualize, record, and produce high-quality audio storytelling — internal or external.", "Search Engine Optimization (SEO) – We ensure your brand is discoverable on Google and ranks for the terms your customers actually search."],
          outcome: "Your brand becomes a magnet. Instead of chasing leads, your content pulls them to you, day and night.",
          status: "published"
        },
        {
          title: "Business Strategy",
          summary: "Clarity is the foundation of growth. We partner with you to develop actionable brand and digital strategies that align your vision with your market, ensuring every decision is focused, every investment is measurable, and every move builds momentum.",
          image_url: "https://i.imgur.com/bRBC06I.jpeg",
          title_color: "text-cyan-800",
          description: "Businesses rarely fail because they lack effort. They fail because they lack clarity. Without a clear strategy, brands waste money on scattered campaigns, confuse their audiences, and struggle to scale.\n\nSolveX exists to bring focus back. We design strategies that align with your values, sharpen your positioning, and turn ambition into a step-by-step plan for growth.",
          sub_services: ["Strategic Communication & Consulting – Long-term goals translated into consistent messaging.", "Customer Journey Mapping – Identify and fix the points where customers drop off.", "Name Development – Create names that are clear, memorable, and available.", "Brand & Design Strategy – Define how your brand looks, feels, and is recognized across all channels.", "Digital Strategy – Harness the power of online platforms for visibility and loyalty.", "Technology & Design Strategy – Make smart tech choices that align with your identity.", "Content Strategy – Decide what content to produce, where to distribute it, and how to measure results.", "Media Strategy – Use insights to craft effective media presence."],
          outcome: "Your brand stops guessing. Every decision is aligned with a focused plan. Every cedi is invested toward measurable outcomes.",
          status: "published"
        },
        {
          title: "Technology and Innovation",
          summary: "Technology is your accelerator. We integrate innovative, scalable tech solutions that drive efficiency and create new market opportunities, transforming your business to be smarter, not just harder.",
          image_url: "https://i.imgur.com/A2FuiH8.jpeg",
          title_color: "text-fuchsia-800",
          description: "Technology should not feel intimidating or expensive. It should feel like an accelerator — helping your business grow smarter, not harder.\n\nSolveX helps businesses integrate affordable, scalable technology that drives growth and efficiency. We don't overwhelm you with tools. We start small, test what works, and then scale.",
          sub_services: ["Digital Transformation Consulting: Helping businesses adopt new technologies for efficiency and growth.", "Product Innovation & Development: Assisting with the conceptualization, design, and launch of new products or services.", "Market Disruption Strategies: Developing strategies to challenge existing market norms and create new opportunities.", "AI/ML Integration for Marketing: Showcasing how advanced analytics and AI can optimize marketing efforts."],
          outcome: "Technology becomes your growth multiplier, not your cost burden.",
          status: "published"
        },
        {
          title: "Event Planning & Coverage",
          summary: "We transform events from simple gatherings into powerful brand assets. By integrating strategic planning with live coverage and post-event storytelling, we create immersive experiences that build community and deliver marketing value long after the day is over.",
          image_url: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJ3aWQiOjU4MDk2fQ",
          title_color: "text-lime-800",
          description: "Events are not just about gathering people. They are about creating moments that echo long after the lights go out. A successful event is not one that ends well — it's one that keeps delivering visibility, credibility, and memories for your brand.\n\nSolveX Studios manages events with professionalism, creativity, and strategic focus.",
          sub_services: ["Event Strategy & Planning – From concept to execution, aligned with your organizational goals.", "Corporate & Public Events – Conferences, launches, programs, and special gatherings tailored to your audience.", "Logistics & Coordination – Venue, setup, vendors, and schedules managed for smooth delivery.", "Media & Live Coverage – Professional photography, videography, livestreaming, and social updates.", "Post-Event Storytelling – Highlight videos, curated albums, press-ready media packages."],
          outcome: "Your event is not just an occasion. It becomes a marketing asset that continues to build your brand long after it ends.",
          status: "published"
        }
      ];

      const { error: servicesError } = await supabase
        .from('services')
        .upsert(servicesData, { onConflict: 'title' });

      if (servicesError) throw servicesError;
      // --- END SERVICES SEEDING ---


      setSyncStatus('success');
      setSyncMessage('Database successfully synced with fresh data! (Equipment, Teams, Job Postings & Services)');
    } catch (error) {
      console.error('Database sync error:', error);
      setSyncStatus('error');
      setSyncMessage(`Sync failed: ${(error as Error).message}. Ensure you ran the required SQL.`);
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
              <p className="text-sm text-gray-600">Update database with all data: equipment, services, teams, and job postings</p>
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
    </div>
  );
};

export default SettingsTab;
