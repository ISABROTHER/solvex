import React from "react";
import Card from "../components/Card";

const ProjectsTab: React.FC = () => {
  const projects = [
    { title: "UCC Graduation Campaign", client: "UCC Alumni", status: "In Progress", start: "2025-09-15", due: "2025-10-10", owner: "PM-01", progress: 78 },
    { title: "SolveX Rentals Launch", client: "Internal", status: "Review", start: "2025-09-02", due: "2025-10-05", owner: "PM-02", progress: 91 },
  ];

  return (
    <div className="space-y-6">
      <Card title="Projects • List" right={<button className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50">New Project</button>}>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="px-2 py-2">Title</th><th className="px-2 py-2">Client</th><th className="px-2 py-2">Status</th><th className="px-2 py-2">Start/Due</th><th className="px-2 py-2">Owner</th><th className="px-2 py-2">Progress</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.title} className="border-t">
                  <td className="px-2 py-2">{p.title}</td>
                  <td className="px-2 py-2">{p.client}</td>
                  <td className="px-2 py-2">{p.status}</td>
                  <td className="px-2 py-2">{p.start} → {p.due}</td>
                  <td className="px-2 py-2">{p.owner}</td>
                  <td className="px-2 py-2">
                    <div className="h-2 w-28 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-2 bg-gray-900 rounded-full" style={{ width: `${p.progress}%` }} />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{p.progress}%</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Board (Kanban) — Planned • In Progress • Review • Completed">
        <div className="grid gap-3 md:grid-cols-4">
          {["Planned","In Progress","Review","Completed"].map(col=>(
            <div key={col} className="rounded-lg border p-3">
              <div className="text-sm font-semibold">{col}</div>
              <div className="mt-2 h-40 rounded-md bg-gray-50" />
            </div>
          ))}
        </div>
      </Card>

      <Card title="Timeline (Gantt) — milestones & dependencies"><div className="h-40 rounded-md bg-gray-100" /></Card>

      <Card title="Detail View — Brief • Tasks • Assignments • Equipment • Files • Chat • Milestones • Activity">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border p-3 text-sm">Brief, Tasks, Milestones</div>
          <div className="rounded-lg border p-3 text-sm">Assignments (Teams/Members/Partners), Equipment, Files, Chat</div>
        </div>
      </Card>

      <Card title="Assign a Project (Unified Flow)">
        <ol className="text-sm list-decimal pl-5 space-y-1">
          <li>Pick/Create Project</li><li>Role Type: Team • Member • Partner</li><li>Scope & Deliverables (milestones, dates, approvals)</li>
          <li>Capacity & Conflicts (availability + equipment clashes)</li><li>Agreement & Terms (NDA/SLA/MoU if Partner)</li>
          <li>Permissions (brief/files/chat/calendar/invoices visibility)</li><li>Notify & Kickoff (emails, calendar invites, shared drive)</li>
        </ol>
        <div className="mt-3 text-xs text-gray-600">Automations: double-booking block, reminders, handoff checklist, revoke access on completion.</div>
      </Card>
    </div>
  );
};

export default ProjectsTab;
