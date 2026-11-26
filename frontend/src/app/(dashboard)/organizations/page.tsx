'use client'

import { useState } from 'react'
import {
  Bot,
  Building,
  Edit,
  MoreVertical,
  Plus,
  Trash2,
  Users,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ListRow,
  PageContainer,
  PageHeader,
  PrimaryActionButton,
  SearchField,
  StatsStrip,
  type StatItem,
} from '@/components/page-kits'
import {
  IconTile,
  TableShell,
  TableToolbar,
  menuContentClass,
  toolbarBtnClass,
} from '@/components/tables/table-kits'

const mockOrganizations = [
  {
    id: '1',
    name: 'Acme Corporation',
    subdomain: 'acme',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T15:30:00Z',
    _count: { users: 15, chatBots: 5 }
  },
  {
    id: '2',
    name: 'TechStart Inc',
    subdomain: 'techstart',
    createdAt: '2024-01-16T11:00:00Z',
    updatedAt: '2024-01-21T16:30:00Z',
    _count: { users: 8, chatBots: 3 }
  },
  {
    id: '3',
    name: 'Global Solutions Ltd',
    subdomain: 'globalsolutions',
    createdAt: '2024-01-17T12:00:00Z',
    updatedAt: '2024-01-22T17:30:00Z',
    _count: { users: 22, chatBots: 8 }
  }
]

export default function OrganizationsPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredOrganizations = mockOrganizations.filter(org =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.subdomain.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalUsers = mockOrganizations.reduce((sum, org) => sum + org._count.users, 0)
  const totalChatBots = mockOrganizations.reduce((sum, org) => sum + org._count.chatBots, 0)

  const statItems: StatItem[] = [
    {
      label: 'Total Organizations',
      value: mockOrganizations.length,
      icon: Building,
      iconClass: 'text-primary',
    },
    {
      label: 'Total Users',
      value: totalUsers,
      icon: Users,
      iconClass: 'text-chart-2',
    },
    {
      label: 'Total Chatbots',
      value: totalChatBots,
      icon: Bot,
      iconClass: 'text-chart-3',
    },
    {
      label: 'Avg Users/Org',
      value: Math.round(totalUsers / mockOrganizations.length),
      icon: Users,
      iconClass: 'text-chart-4',
    },
  ]

  return (
    <PageContainer>
      <PageHeader
        title="Organizations"
        description="Manage organizations and their configurations."
        actions={
          <PrimaryActionButton href="/organizations/create" icon={Plus}>
            Add Organization
          </PrimaryActionButton>
        }
      />

      <StatsStrip items={statItems} />

      <TableShell>
        <TableToolbar>
          <SearchField
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search organizations"
          />
        </TableToolbar>

        <ul>
          {filteredOrganizations.map((org) => (
            <ListRow
              key={org.id}
              icon={
                <IconTile>
                  <Building className="size-4 shrink-0" />
                </IconTile>
              }
              title={org.name}
              subtitle={`${org.subdomain}.clientsync.com`}
              badge={
                <div className="flex items-center gap-2">
                  <div className="hidden items-center gap-3 text-xs text-muted-foreground sm:flex">
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="size-3.5 shrink-0" />
                      {org._count.users} users
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Bot className="size-3.5 shrink-0" />
                      {org._count.chatBots} chatbots
                    </span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className={toolbarBtnClass}
                        aria-label={`Actions for ${org.name}`}
                      >
                        <MoreVertical className="size-4 shrink-0" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className={menuContentClass}>
                      <DropdownMenuItem>
                        <Edit className="mr-2 size-4 shrink-0" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 size-4 shrink-0" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              }
              meta={new Date(org.createdAt).toLocaleDateString()}
            />
          ))}
        </ul>
      </TableShell>
    </PageContainer>
  )
}
