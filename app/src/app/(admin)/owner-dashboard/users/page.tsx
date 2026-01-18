"use client"

import { useState, useEffect } from "react"
import { CheckCircle, XCircle, Clock, Users, Search, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

interface User {
  _id: string
  name: string
  email: string
  studentId?: string
  accountStatus: 'pending' | 'approved' | 'rejected'
  rejectionReason?: string
  createdAt: string
  approvedAt?: string
}

interface Counts {
  pending: number
  approved: number
  rejected: number
  total: number
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [counts, setCounts] = useState<Counts>({ pending: 0, approved: 0, rejected: 0, total: 0 })
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("pending")
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch users
  const fetchUsers = async (status?: string) => {
    setLoading(true)
    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token")
      const url = status ? `/api/admin/users?status=${status}` : `/api/admin/users`
      
      const res = await fetch(url, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      
      if (!res.ok) throw new Error("Failed to fetch users")
      
      const data = await res.json()
      setUsers(data.users)
      setCounts(data.counts)
    } catch (error) {
      console.error("Failed to fetch users", error)
      toast.error("Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers(statusFilter === "all" ? undefined : statusFilter)
  }, [statusFilter])

  // Handle user action (approve/reject)
  const handleUserAction = async () => {
    if (!selectedUser || !actionType) return
    
    setIsSubmitting(true)
    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token")
      
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: selectedUser._id,
          action: actionType,
          rejectionReason: actionType === 'reject' ? rejectionReason : undefined
        })
      })

      if (!res.ok) throw new Error("Failed to update user")

      toast.success(`User ${actionType === 'approve' ? 'approved' : 'rejected'} successfully`)
      setIsDialogOpen(false)
      setRejectionReason("")
      fetchUsers(statusFilter === "all" ? undefined : statusFilter)
    } catch (error) {
      toast.error("Failed to update user status")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle user deletion
  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token")
      
      const res = await fetch(`/api/admin/users?userId=${user._id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (!res.ok) throw new Error("Failed to delete user")

      toast.success("User deleted successfully")
      fetchUsers(statusFilter === "all" ? undefined : statusFilter)
    } catch (error) {
      toast.error("Failed to delete user")
    }
  }

  // Open confirmation dialog
  const openActionDialog = (user: User, action: 'approve' | 'reject') => {
    setSelectedUser(user)
    setActionType(action)
    setIsDialogOpen(true)
  }

  // Filter users by search query
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.studentId && user.studentId.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="p-8 space-y-6 bg-gray-50/50 min-h-screen">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">User Management</h2>
        <p className="text-gray-500 mt-1">Manage student registration approvals</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-orange-600">{counts.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Approved</p>
                <p className="text-2xl font-bold text-emerald-600">{counts.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{counts.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{counts.total}</p>
              </div>
              <Users className="h-8 w-8 text-gray-900" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by name, email, or student ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Info */}
      <div className="text-sm text-gray-500">
        Showing {filteredUsers.length} of {users.length} users
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading users...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No users found</p>
        </div>
      ) : (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Student ID</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Registered</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.studentId || '-'}</td>
                      <td className="px-6 py-4">
                        <Badge 
                          className={
                            user.accountStatus === 'approved' 
                              ? 'bg-emerald-500' 
                              : user.accountStatus === 'rejected'
                              ? 'bg-red-500'
                              : 'bg-orange-500'
                          }
                        >
                          {user.accountStatus}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        {user.accountStatus === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700"
                              onClick={() => openActionDialog(user, 'approve')}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => openActionDialog(user, 'reject')}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                        {user.accountStatus === 'rejected' && user.rejectionReason && (
                          <p className="text-xs text-red-600 mb-2">Reason: {user.rejectionReason}</p>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteUser(user)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve User' : 'Reject User'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve' 
                ? `Are you sure you want to approve ${selectedUser?.name}? They will be able to login immediately.`
                : `Are you sure you want to reject ${selectedUser?.name}? Please provide a reason.`
              }
            </DialogDescription>
          </DialogHeader>
          
          {actionType === 'reject' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Rejection Reason</label>
              <Textarea
                placeholder="Enter reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
              />
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsDialogOpen(false)
                setRejectionReason("")
              }}
            >
              Cancel
            </Button>
            <Button
              className={actionType === 'approve' ? 'bg-emerald-600' : ''}
              variant={actionType === 'reject' ? 'destructive' : 'default'}
              onClick={handleUserAction}
              disabled={isSubmitting || (actionType === 'reject' && !rejectionReason)}
            >
              {isSubmitting ? 'Processing...' : actionType === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
