// ... (omitting lines 1-402 which are correctly defined in the full component)

      {/* --- Job Position Add/Edit Modal --- */}
      <AnimatePresence>
        {isAddingPosition && (
          <div className="fixed inset-0 z-50">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40"
              onClick={() => {
                setIsAddingPosition(false);
                setEditingPosition(null);
                resetFormState();
              }}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-xl flex flex-col"
            >
              {/* Modal Content for Position Editing... */}
              <div className="flex-shrink-0 p-6 flex items-center justify-between border-b">
                <h3 className="text-xl font-semibold">{editingPosition ? 'Edit Position' : 'Add New Position'}</h3>
                <button
                  className="p-2 rounded-full hover:bg-gray-100"
                  onClick={() => {
                    setIsAddingPosition(false);
                    setEditingPosition(null);
                    resetFormState();
                  }}
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 overflow-auto flex-1 space-y-4">
                {/* ... (form inputs for position) ... */}
              </div>
              <div className="flex-shrink-0 p-6 border-t flex gap-3 bg-gray-50">
                {/* ... (buttons) ... */}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- NEW Team Edit Modal --- */}
      {editingTeam && (
        <TeamEditModal
          isOpen={isTeamModalOpen}
          onClose={() => setIsTeamModalOpen(false)}
          team={editingTeam}
          onSave={handleSaveTeam}
        />
      )}
      {/* ... (Application Detail Modal) ... */}
    </div>
  );
};

export default TeamsTab;