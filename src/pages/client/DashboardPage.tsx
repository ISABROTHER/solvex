// Inside the return statement of DashboardPage component:

      <motion.header variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Left side: Greeting */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Hey {userName}</h1>
          <p className="text-sm text-gray-600 mt-1">Here's what's happening with your projects and requests.</p>
        </div>

        {/* Right side: Buttons */}
        <div className="flex gap-3">
          {/* New Request Button */}
          <Link
            to="/client/new"
            className="inline-flex items-center gap-2 bg-[#FF5722] text-white px-4 py-2 rounded-lg shadow hover:scale-[1.02] transition-transform duration-200"
          >
            <FilePlus size={16} />
            New Request
          </Link>
          {/* Profile Button - Already here in the top-right group */}
          <Link
            to="/client/profile"
            className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow border border-gray-100 hover:scale-[1.02] transition-transform duration-200"
          >
            <User size={16} />
            Profile
          </Link>
        </div>
      </motion.header>