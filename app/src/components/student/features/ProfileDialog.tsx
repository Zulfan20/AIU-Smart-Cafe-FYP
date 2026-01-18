import type * as React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserCircle, Mail, Phone, Calendar, Upload, History, Edit, Lock } from "lucide-react"
import type { StudentProfile } from "@/types/dashboard"

interface ProfileDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  profile: StudentProfile
  onProfileChange: (profile: StudentProfile) => void
  onSaveProfile: (profile: Partial<StudentProfile>) => void
  onProfilePicUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  isAuthenticated?: boolean
  isEditing?: boolean
  onEditToggle?: () => void
}

export function ProfileDialog({
  isOpen,
  onOpenChange,
  profile,
  onProfileChange,
  onSaveProfile,
  onProfilePicUpload,
  isAuthenticated = true,
  isEditing = false,
  onEditToggle,
}: ProfileDialogProps) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState("")
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const handleChangePassword = async () => {
    setPasswordError("")
    setPasswordSuccess("")

    // Validate
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All fields are required")
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match")
      return
    }

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters")
      return
    }

    setIsChangingPassword(true)

    try {
      const token = localStorage.getItem("studentToken") || localStorage.getItem("token")
      const res = await fetch("/api/auth/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to change password")
      }

      setPasswordSuccess("Password changed successfully!")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")

      setTimeout(() => {
        setPasswordSuccess("")
      }, 3000)
    } catch (error: any) {
      setPasswordError(error.message)
    } finally {
      setIsChangingPassword(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Profile Settings</DialogTitle>
              <DialogDescription>Manage your account information and preferences</DialogDescription>
            </div>
            {isAuthenticated && !isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={onEditToggle}
                className="gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Button>
            )}
          </div>
        </DialogHeader>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="password">Change Password</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              {profile.profilePic ? (
                <img
                  src={profile.profilePic || "/placeholder.svg"}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-emerald-100"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center border-4 border-emerald-200">
                  <UserCircle className="w-16 h-16 text-emerald-600" />
                </div>
              )}
              {isEditing && (
                <label
                  htmlFor="profile-pic-upload"
                  className="absolute bottom-0 right-0 bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-full cursor-pointer shadow-lg"
                >
                  <Upload className="w-4 h-4" />
                  <input
                    id="profile-pic-upload"
                    type="file"
                    accept="image/*"
                    onChange={onProfilePicUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <UserCircle className="w-4 h-4" />
                Name
              </Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => onProfileChange({ ...profile, name: e.target.value })}
                placeholder="Enter your name"
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="studentId" className="flex items-center gap-2">
                <UserCircle className="w-4 h-4" />
                Student ID
              </Label>
              <Input
                id="studentId"
                value={profile.studentId}
                onChange={(e) => onProfileChange({ ...profile, studentId: e.target.value })}
                placeholder="Enter your student ID"
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => onProfileChange({ ...profile, email: e.target.value })}
                placeholder="your.email@aiu.edu.my"
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone
              </Label>
              <Input
                id="phone"
                type="tel"
                value={profile.phone}
                onChange={(e) => onProfileChange({ ...profile, phone: e.target.value })}
                placeholder="+60 12-345 6789"
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={profile.gender}
                onValueChange={(value) => onProfileChange({ ...profile, gender: value })}
                disabled={!isEditing}
              >
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthday" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Birthday
              </Label>
              <Input
                id="birthday"
                type="date"
                value={profile.birthday}
                onChange={(e) => onProfileChange({ ...profile, birthday: e.target.value })}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={profile.bio}
              onChange={(e) => onProfileChange({ ...profile, bio: e.target.value })}
              placeholder="Tell us about yourself..."
              className="min-h-[100px]"
              disabled={!isEditing}
            />
          </div>

          {isEditing && (
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => {
                  onSaveProfile(profile)
                  if (onEditToggle) onEditToggle()
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                Save Changes
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  if (onEditToggle) onEditToggle()
                }} 
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          )}
          </TabsContent>

          <TabsContent value="password" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Lock className="w-4 h-4" />
                <span>Change your account password</span>
              </div>

              {passwordError && (
                <div className="p-3 bg-red-100 text-red-600 text-sm rounded">
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="p-3 bg-green-100 text-green-600 text-sm rounded">
                  {passwordSuccess}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 6 characters)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>

              <Button
                onClick={handleChangePassword}
                disabled={isChangingPassword}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                {isChangingPassword ? "Changing Password..." : "Change Password"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
