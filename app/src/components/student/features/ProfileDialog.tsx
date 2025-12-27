import type * as React from "react"
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
import { UserCircle, Mail, Phone, Calendar, Upload, History, Edit } from "lucide-react"
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
        <div className="space-y-6">
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
        </div>
      </DialogContent>
    </Dialog>
  )
}
