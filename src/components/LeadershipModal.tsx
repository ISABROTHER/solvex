import React from "react";
import { X, Linkedin, Mail } from "lucide-react";
import { Leader } from "../types/index";

interface LeadershipModalProps {
  leader: Leader;
  onClose: () => void;
}

const LeadershipModal: React.FC<LeadershipModalProps> = ({
  leader,
  onClose,
}) => {
  if (!leader) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-800"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="p-8 md:p-12">
          <div className="text-center">
            <img
              src={leader.imageUrl}
              alt={`Headshot of ${leader.name}`}
              className="w-40 h-40 rounded-full mx-auto object-cover shadow-lg"
            />
            <h3 className="text-2xl font-bold mt-6 text-gray-900">
              {leader.name}
            </h3>
            <p className="text-lg text-[#FF5722] font-semibold">
              {leader.role}
            </p>
          </div>
          <p className="text-gray-600 mt-6 text-center">{leader.fullBio}</p>
          <div className="mt-6 flex justify-center items-center gap-4">
            {leader.linkedinUrl && (
              <a
                href={leader.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-[#FF5722]"
              >
                <Linkedin className="w-6 h-6" />
              </a>
            )}
            {leader.email && (
              <a
                href={`mailto:${leader.email}`}
                className="text-gray-500 hover:text-[#FF5722]"
              >
                <Mail className="w-6 h-6" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadershipModal;
