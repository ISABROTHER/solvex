import React, { useState, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ApplicationFormModal from '../components/forms/ApplicationFormModal';
import { careerTeamsData, type CareerTeam, type CareerRole } from '../data/forms/career-roles.data';

const CareerPod: React.FC<{ team: CareerTeam, onClick: (team: CareerTeam) => void, isTouchDevice: boolean }> = ({ team, onClick, isTouchDevice }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <motion.div variants={cardVariants}>
      <motion.div
        layoutId={`card-${team.title}`}
        onClick={() => onClick(team)}
        className="relative p-6 rounded-3xl bg-white/60 backdrop-blur-sm border border-gray-200/80 cursor-pointer overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 h-full flex flex-col"
        whileHover={!isTouchDevice ? { y: -5 } : {}}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        <div className="flex-grow">
          <img src={team.imageUrl} alt={team.title} className="w-full h-48 object-cover rounded-2xl mb-4" />
          <h2 className="text-xl font-bold text-[#C10100]">{team.title}</h2>
          <div className="inline-flex items-center mt-2 px-3 py-1 rounded-full bg-[#FF5722]">
            <span className="w-2 h-2 mr-2 bg-white rounded-full animate-pulse"></span>
            <p className="text-sm text-white"><span className="font-semibold">{team.roles.length}</span> Open Position{team.roles.length !== 1 && 's'}</p>
          </div>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onClick(team); }} className="self-end mt-4 font-semibold text-[#FF5722] hover:underline focus:outline-none">
          View Roles
        </button>
      </motion.div>
    </motion.div>
  );
};

const CareersPage: React.FC = () => {
  const [selectedTeam, setSelectedTeam] = useState<CareerTeam | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [anchorId, setAnchorId] = useState<string | null>(null);

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window);
  }, []);

  const handleApplyClick = (team: CareerTeam) => {
    setAnchorId(`card-${team.title}`);
    setSelectedTeam(null);
    setTimeout(() => setIsModalOpen(true), 50);
  };

  const allAvailableRoles = useMemo(() => careerTeamsData.flatMap(team => team.roles), []);
  const rolesForModal = selectedTeam?.roles || allAvailableRoles;

  return (
    <>
      <section className="pt-20 pb-12 bg-white">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tighter" style={{ fontFamily: '"Inter Tight","Manrope",system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif' }}>
            FIND YOUR TEAM
          </h1>
          <p className="text-gray-600 mt-6 max-w-2xl mx-auto text-lg">
            At SolveX Studios, our dedicated team works side by side to build top brands, products and services. We are shaping the future of media, marketing and innovation. There is a place here for you. Join our team today!
          </p>
        </div>
      </section>

      <section id="career-grid-section" className="pb-16 md:pb-24 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            transition={{ staggerChildren: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
          >
            {careerTeamsData.map((team) => (
              <CareerPod key={team.title} team={team} onClick={setSelectedTeam} isTouchDevice={isTouchDevice} />
            ))}
          </motion.div>
        </div>

        <AnimatePresence>
          {selectedTeam && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div className="absolute inset-0 bg-black/30 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedTeam(null)} />
              <motion.div layoutId={`card-${selectedTeam.title}`} className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col">
                <div className="flex-shrink-0 p-6 flex justify-between items-center border-b">
                  <h2 className="text-2xl font-bold text-[#C10100]">{selectedTeam.title}</h2>
                  <motion.button onClick={() => setSelectedTeam(null)} className="p-2 rounded-full hover:bg-gray-200/80"><X size={20} /></motion.button>
                </div>
                <div className="p-8 overflow-y-auto">
                  <motion.ul className="space-y-6" variants={{ open: { transition: { staggerChildren: 0.07 } } }} initial="closed" animate="open" exit="closed">
                    {selectedTeam.roles.map((role, index) => (
                      <motion.li key={index} variants={{ open: { opacity: 1, y: 0 }, closed: { opacity: 0, y: 10 } }}>
                        <p className="font-semibold text-lg text-gray-900">{role.name}</p>
                        <p className="text-base text-gray-600 mt-1">{role.description}</p>
                      </motion.li>
                    ))}
                  </motion.ul>
                </div>
                <div className="flex-shrink-0 p-6 border-t mt-auto bg-gray-50/50 rounded-b-3xl">
                  <motion.button onClick={() => handleApplyClick(selectedTeam)} className="w-full bg-[#FF5722] hover:bg-[#E64A19] text-white font-bold py-3 px-6 rounded-lg text-base">
                    Apply to this Team
                  </motion.button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </section>

      <ApplicationFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        availableRoles={rolesForModal}
        anchorId={anchorId}
      />
    </>
  );
};

export default CareersPage;
