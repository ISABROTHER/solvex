import React from "react";
import Card from "../components/Card";

const PartnersTab: React.FC = () => {
  const partners = [
    { name: "Venue One", type: "Venue", tier: "Preferred", status: "Active", location: "Cape Coast", next_action_at: "2025-10-02", next_action_note: "Renew MoU" },
    { name: "Media Hub", type: "Media", tier: "Standard", status: "Active", location: "Accra", next_action_at: "2025-10-06", next_action_note: "Pitch collab" },
  ];
  const applicants = [
    { org_name: "Drone Pros", type: "Vendor", category: "Drone", region: "Central", status: "Pending", value_proposition: "Fleet support for events" },
  ];

  return (
    <div className="space-y-6">
      <Card title="Partners">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="px-2 py-2">Name</th><th className="px-2 py-2">Type</th><th className="px-2 py-2">Tier</th><th className="px-2 py-2">Status</th><th className="px-2 py-2">Location</th><th className="px-2 py-2">Next Action</th>
              </tr>
            </thead>
            <tbody>
              {partners.map((p)=>(
                <tr key={p.name} className="border-t">
                  <td className="px-2 py-2">{p.name}</td>
                  <td className="px-2 py-2">{p.type}</td>
                  <td className="px-2 py-2">{p.tier}</td>
                  <td className="px-2 py-2">{p.status}</td>
                  <td className="px-2 py-2">{p.location}</td>
                  <td className="px-2 py-2">{p.next_action_at} — {p.next_action_note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Agreements"><div className="h-28 rounded-md bg-gray-100" /><div className="mt-2 text-xs text-gray-600">MoU / SLA / Reseller / Sponsorship / NDA</div></Card>
      <Card title="Referrals & Collaborations"><div className="h-28 rounded-md bg-gray-100" /><div className="mt-2 text-xs text-gray-600">Track referred projects, revenue & commissions</div></Card>

      <Card title="Partner Applicants">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="px-2 py-2">Org</th><th className="px-2 py-2">Type</th><th className="px-2 py-2">Category</th><th className="px-2 py-2">Region</th><th className="px-2 py-2">Status</th><th className="px-2 py-2">Value</th><th className="px-2 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applicants.map((a)=>(
                <tr key={a.org_name} className="border-t">
                  <td className="px-2 py-2">{a.org_name}</td>
                  <td className="px-2 py-2">{a.type}</td>
                  <td className="px-2 py-2">{a.category}</td>
                  <td className="px-2 py-2">{a.region}</td>
                  <td className="px-2 py-2">{a.status}</td>
                  <td className="px-2 py-2">{a.value_proposition}</td>
                  <td className="px-2 py-2">
                    <div className="flex gap-2">
                      <button className="rounded border px-2 py-1 hover:bg-gray-50">Approve</button>
                      <button className="rounded border px-2 py-1 hover:bg-gray-50">Reject</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-2 text-xs text-gray-600">Public: “Become a Partner” form → Applicants queue.</div>
      </Card>
    </div>
  );
};

export default PartnersTab;
