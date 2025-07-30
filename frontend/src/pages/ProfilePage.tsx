import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CameraIcon, QrCodeIcon } from '@heroicons/react/24/outline'
import { authService } from '../services/auth.service'
import { fileService } from '../services/file.service'
import { useAuthStore } from '../store/auth.store'
import TwoFactorModal from '../components/TwoFactorModal'

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore()
  const [isTwoFactorModalOpen, setIsTwoFactorModalOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  const { data: profileData } = useQuery({
    queryKey: ['profile'],
    queryFn: authService.getProfile,
  })

  const uploadAvatarMutation = useMutation({
    mutationFn: fileService.uploadAvatar,
    onSuccess: (data) => {
      updateUser({ avatarUrl: data.avatarUrl })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })

  const disable2FAMutation = useMutation({
    mutationFn: authService.disable2FA,
    onSuccess: () => {
      updateUser({ twoFactorEnabled: false })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB
        alert('File size must be less than 5MB')
        return
      }
      
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }
      
      uploadAvatarMutation.mutate(file)
    }
  }

  const handleDisable2FA = async () => {
    if (window.confirm('Are you sure you want to disable 2FA? This will make your account less secure.')) {
      disable2FAMutation.mutate()
    }
  }

  const currentUser = profileData?.user || user

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Profile Information
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Manage your account settings and preferences.
            </p>
          </div>
          
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Profile Picture</dt>
                <dd className="mt-1 sm:col-span-2 sm:mt-0">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      {currentUser?.avatarUrl ? (
                        <img
                          className="h-20 w-20 rounded-full object-cover"
                          src={currentUser.avatarUrl}
                          alt="Profile"
                        />
                      ) : (
                        <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-2xl text-gray-500">
                            {currentUser?.firstName?.charAt(0) || currentUser?.email?.charAt(0) || '?'}
                          </span>
                        </div>
                      )}
                      
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadAvatarMutation.isPending}
                        className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-primary-600 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
                      >
                        <CameraIcon className="h-4 w-4 mx-auto" />
                      </button>
                    </div>
                    
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                      
                      {uploadAvatarMutation.isPending && (
                        <p className="text-sm text-gray-500">Uploading...</p>
                      )}
                      
                      {uploadAvatarMutation.error && (
                        <p className="text-sm text-red-600">
                          Failed to upload image
                        </p>
                      )}
                    </div>
                  </div>
                </dd>
              </div>
              
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Email address</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  {currentUser?.email}
                </dd>
              </div>
              
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">First name</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  {currentUser?.firstName || 'Not provided'}
                </dd>
              </div>
              
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Last name</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  {currentUser?.lastName || 'Not provided'}
                </dd>
              </div>
              
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Phone number</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  {currentUser?.phone || 'Not provided'}
                </dd>
              </div>
              
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Two-Factor Authentication</dt>
                <dd className="mt-1 sm:col-span-2 sm:mt-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-900">
                        {currentUser?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {currentUser?.twoFactorEnabled 
                          ? 'Your account is protected with 2FA'
                          : 'Add an extra layer of security to your account'
                        }
                      </p>
                    </div>
                    
                    <div className="flex space-x-2">
                      {currentUser?.twoFactorEnabled ? (
                        <button
                          onClick={handleDisable2FA}
                          disabled={disable2FAMutation.isPending}
                          className="btn-secondary text-sm"
                        >
                          {disable2FAMutation.isPending ? 'Disabling...' : 'Disable'}
                        </button>
                      ) : (
                        <button
                          onClick={() => setIsTwoFactorModalOpen(true)}
                          className="btn-primary text-sm inline-flex items-center"
                        >
                          <QrCodeIcon className="h-4 w-4 mr-2" />
                          Enable 2FA
                        </button>
                      )}
                    </div>
                  </div>
                </dd>
              </div>
              
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Account status</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    currentUser?.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {currentUser?.isActive ? 'Active' : 'Inactive'}
                  </span>
                </dd>
              </div>
              
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Member since</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  {currentUser?.createdAt 
                    ? new Date(currentUser.createdAt).toLocaleDateString()
                    : 'Unknown'
                  }
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <TwoFactorModal
        isOpen={isTwoFactorModalOpen}
        onClose={() => setIsTwoFactorModalOpen(false)}
      />
    </div>
  )
}