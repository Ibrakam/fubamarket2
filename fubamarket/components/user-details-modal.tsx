"use client"

import { Modal } from "@/components/ui/modal"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Mail, Phone, Calendar, User, Shield } from "lucide-react"

interface UserDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  user: any
}

export function UserDetailsModal({ isOpen, onClose, user }: UserDetailsModalProps) {
  if (!user) return null

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'superadmin': return 'bg-red-100 text-red-800'
      case 'vendor': return 'bg-blue-100 text-blue-800'
      case 'ops': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getVerificationColor = (verified: boolean) => {
    return verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="User Details" size="lg">
      <div className="space-y-6">
        {/* User Header */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold text-xl">
                {user.first_name?.charAt(0)?.toUpperCase() || user.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="text-xl font-semibold">
                {user.first_name && user.last_name 
                  ? `${user.first_name} ${user.last_name}`
                  : user.username
                }
              </h3>
              <p className="text-gray-600">@{user.username}</p>
              <div className="flex space-x-2 mt-2">
                <Badge className={getRoleColor(user.role)}>
                  {user.role}
                </Badge>
                <Badge className={getVerificationColor(user.is_verified)}>
                  {user.is_verified ? 'Verified' : 'Unverified'}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* User Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-lg">Contact Information</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="font-medium">{user.email || 'No email provided'}</p>
                  <p className="text-sm text-gray-600">Email address</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="font-medium">{user.phone || 'No phone provided'}</p>
                  <p className="text-sm text-gray-600">Phone number</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-lg">Account Information</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="font-medium">
                    {new Date(user.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">Member since</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Shield className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="font-medium">
                    {user.is_staff ? 'Staff Member' : 'Regular User'}
                  </p>
                  <p className="text-sm text-gray-600">Account type</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="space-y-4">
          <h4 className="font-medium text-lg">Additional Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Balance</p>
              <p className="font-semibold text-lg">
                ${(parseFloat(user.balance || '0') / 100).toFixed(2)}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Referral Code</p>
              <p className="font-semibold">{user.referral_code}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">User ID</p>
              <p className="font-semibold">#{user.id}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <User className="w-4 h-4 mr-2" />
            Edit User
          </Button>
        </div>
      </div>
    </Modal>
  )
}
