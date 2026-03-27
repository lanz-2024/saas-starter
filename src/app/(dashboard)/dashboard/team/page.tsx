'use client';

import { trpc } from '@/lib/trpc/client';
import { Eye, Shield, User as UserIcon, UserPlus, X } from 'lucide-react';
import { useState } from 'react';

const DEMO_ORG_ID = '00000000-0000-0000-0000-000000000001';

const roleIcons: Record<string, React.ElementType> = {
  owner: Shield,
  admin: Shield,
  member: UserIcon,
  viewer: Eye,
};

const roleColors: Record<string, string> = {
  owner: 'bg-purple-100 text-purple-700',
  admin: 'bg-indigo-100 text-indigo-700',
  member: 'bg-green-100 text-green-700',
  viewer: 'bg-gray-100 text-gray-600',
};

export default function TeamPage() {
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member' | 'viewer'>('member');
  const [inviteStatus, setInviteStatus] = useState<string | null>(null);

  const { data: members, isLoading } = trpc.teams.listMembers.useQuery({ orgId: DEMO_ORG_ID });
  const inviteMutation = trpc.teams.invite.useMutation({
    onSuccess: (result) => {
      setInviteStatus(result.message);
      setInviteEmail('');
      setShowInviteForm(false);
    },
    onError: (err) => setInviteStatus(`Error: ${err.message}`),
  });
  const removeMutation = trpc.teams.removeMember.useMutation();

  function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviteStatus(null);
    inviteMutation.mutate({ orgId: DEMO_ORG_ID, email: inviteEmail, role: inviteRole });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Team</h1>
        <button
          type="button"
          onClick={() => setShowInviteForm(!showInviteForm)}
          className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          <UserPlus className="h-4 w-4" />
          Invite member
        </button>
      </div>

      {inviteStatus && (
        <div className="rounded-md bg-green-50 border border-green-200 p-4 text-sm text-green-700 flex items-center justify-between">
          {inviteStatus}
          <button type="button" onClick={() => setInviteStatus(null)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {showInviteForm && (
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Invite a team member</h3>
          <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@company.com"
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as 'admin' | 'member' | 'viewer')}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="admin">Admin</option>
              <option value="member">Member</option>
              <option value="viewer">Viewer</option>
            </select>
            <button
              type="submit"
              disabled={inviteMutation.isPending}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {inviteMutation.isPending ? 'Sending…' : 'Send invite'}
            </button>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, i) => `skeleton-${i}`).map((id) => (
            <div
              key={id}
              className="h-16 rounded-lg border border-gray-200 bg-white animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {members && members.length > 0 ? (
                members.map((member) => {
                  const RoleIcon = roleIcons[member.role] ?? UserIcon;
                  return (
                    <tr key={member.id}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                            {member.user_id.charAt(0).toUpperCase()}
                          </div>
                          <p className="text-sm font-medium text-gray-900 font-mono">
                            {member.user_id.slice(0, 12)}…
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${roleColors[member.role] ?? 'bg-gray-100 text-gray-600'}`}
                        >
                          <RoleIcon className="h-3 w-3" />
                          {member.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(member.joined_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {member.role !== 'owner' && (
                          <button
                            type="button"
                            onClick={() =>
                              removeMutation.mutate({
                                orgId: DEMO_ORG_ID,
                                userId: member.user_id,
                              })
                            }
                            disabled={removeMutation.isPending}
                            className="text-xs text-red-600 hover:text-red-800 disabled:opacity-50"
                          >
                            Remove
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-500">
                    No members yet. Invite someone to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
