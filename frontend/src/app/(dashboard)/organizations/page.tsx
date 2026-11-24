'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Building, 
  Plus, 
  Search, 
  Users,
  Bot,
  Calendar,
  Edit,
  MoreVertical,
  Trash2
} from 'lucide-react'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

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

  return (
    <div className="page stack">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Organizations</h1>
          <p className="page-subtitle">
            Manage organizations and their configurations.
          </p>
        </div>
        <Button asChild>
          <Link href="/organizations/create">
            <Plus className="ico space-r-2" />
            Add Organization
          </Link>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid-4">
        <Card>
          <CardHeader className="row-between pad-y-2">
            <CardTitle className="t-sm t-medium">Total Organizations</CardTitle>
            <Building className="ico t-muted" />
          </CardHeader>
          <CardContent>
            <div className="t-2xl t-bold">{mockOrganizations.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="row-between pad-y-2">
            <CardTitle className="t-sm t-medium">Total Users</CardTitle>
            <Users className="ico t-muted" />
          </CardHeader>
          <CardContent>
            <div className="t-2xl t-bold">
              {mockOrganizations.reduce((sum, org) => sum + org._count.users, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="row-between pad-y-2">
            <CardTitle className="t-sm t-medium">Total Chatbots</CardTitle>
            <Bot className="ico t-muted" />
          </CardHeader>
          <CardContent>
            <div className="t-2xl t-bold">
              {mockOrganizations.reduce((sum, org) => sum + org._count.chatBots, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="row-between pad-y-2">
            <CardTitle className="t-sm t-medium">Avg Users/Org</CardTitle>
            <Users className="ico t-muted" />
          </CardHeader>
          <CardContent>
            <div className="t-2xl t-bold">
              {Math.round(mockOrganizations.reduce((sum, org) => sum + org._count.users, 0) / mockOrganizations.length)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="row g-4">
        <div className="pos-rel toolbar-search">
          <Search className="search-icon" />
          <Input
            placeholder="Search organizations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Organizations Grid */}
      <div className="grid-3">
        {filteredOrganizations.map((org) => (
          <Card key={org.id} className="card-hover">
            <CardHeader>
              <div className="row-between">
                <div className="row g-2">
                  <Building className="ico-lg" />
                  <CardTitle className="t-lg">{org.name}</CardTitle>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="ico" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit className="ico space-r-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="t-danger">
                      <Trash2 className="ico space-r-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardDescription>
                <Badge variant="outline">{org.subdomain}.clientsync.com</Badge>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="stack">
                <div className="grid-2 t-sm">
                  <div className="row g-2">
                    <Users className="ico t-muted" />
                    <span>{org._count.users} users</span>
                  </div>
                  <div className="row g-2">
                    <Bot className="ico t-muted" />
                    <span>{org._count.chatBots} chatbots</span>
                  </div>
                </div>
                <div className="row g-2 t-sm t-muted">
                  <Calendar className="ico" />
                  <span>Created {new Date(org.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
