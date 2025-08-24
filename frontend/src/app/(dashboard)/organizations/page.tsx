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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
          <p className="text-muted-foreground">
            Manage organizations and their configurations.
          </p>
        </div>
        <Button asChild>
          <Link href="/organizations/create">
            <Plus className="mr-2 h-4 w-4" />
            Add Organization
          </Link>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Organizations</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockOrganizations.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockOrganizations.reduce((sum, org) => sum + org._count.users, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Chatbots</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockOrganizations.reduce((sum, org) => sum + org._count.chatBots, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Users/Org</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(mockOrganizations.reduce((sum, org) => sum + org._count.users, 0) / mockOrganizations.length)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search organizations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Organizations Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredOrganizations.map((org) => (
          <Card key={org.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  <CardTitle className="text-lg">{org.name}</CardTitle>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
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
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{org._count.users} users</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-muted-foreground" />
                    <span>{org._count.chatBots} chatbots</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
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