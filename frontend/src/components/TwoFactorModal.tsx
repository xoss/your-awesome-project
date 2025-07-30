import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, QrCodeIcon } from '@heroicons/react/24/outline'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authService } from '../services/auth.service'
import { useAuthStore } from '../store/auth.store'

const verifySchema = z.object({
  token: z.string().length(6, 'Verification code must be 6 digits'),
})

type VerifyFormData = z.infer<typeof verifySchema>

interface TwoFactorModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function TwoFactorModal({ isOpen, onClose }: TwoFactorModalProps) {
  const [step, setStep] = useState<'setup' | 'verify'>('setup')
  const [secret, setSecret] = useState('')
  const [qrCode, setQrCode] = useState('')
  const { updateUser } = useAuthStore()
  const queryClient = useQueryClient()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm<VerifyFormData>({
    resolver: zodResolver(verifySchema),
  })

  const generateSecretMutation = useMutation({
    mutationFn: authService.generate2FASecret,
    onSuccess: (data) => {
      setSecret(data.secret)
      setQrCode(data.qrCode)
      setStep('verify')
    },
    onError: (error: any) => {
      setError('root', {
        message: error.response?.data?.error || 'Failed to generate 2FA secret',
      })
    },
  })

  const enable2FAMutation = useMutation({
    mutationFn: (data: { secret: string; token: string }) =>
      authService.enable2FA(data.secret, data.token),
    onSuccess: () => {
      updateUser({ twoFactorEnabled: true })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      handleClose()
    },
    onError: (error: any) => {
      setError('root', {
        message: error.response?.data?.error || 'Failed to enable 2FA',
      })
    },
  })

  const onSubmit = (data: VerifyFormData) => {
    enable2FAMutation.mutate({
      secret,
      token: data.token,
    })
  }

  const handleClose = () => {
    setStep('setup')
    setSecret('')
    setQrCode('')
    reset()
    onClose()
  }

  const handleSetup = () => {
    generateSecretMutation.mutate()
  }

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    onClick={handleClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 sm:mx-0 sm:h-10 sm:w-10">
                    <QrCodeIcon className="h-6 w-6 text-primary-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                      {step === 'setup' ? 'Enable Two-Factor Authentication' : 'Verify Your Setup'}
                    </Dialog.Title>
                    
                    {step === 'setup' ? (
                      <div className="mt-4">
                        <p className="text-sm text-gray-500 mb-4">
                          Two-factor authentication adds an extra layer of security to your account. 
                          You'll need an authenticator app like Google Authenticator or Authy.
                        </p>
                        
                        <div className="flex justify-end">
                          <button
                            onClick={handleSetup}
                            disabled={generateSecretMutation.isPending}
                            className="btn-primary"
                          >
                            {generateSecretMutation.isPending ? 'Setting up...' : 'Get Started'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4">
                        <div className="mb-6 text-center">
                          <p className="text-sm text-gray-500 mb-4">
                            1. Scan this QR code with your authenticator app:
                          </p>
                          
                          {qrCode && (
                            <div className="mb-4">
                              <img 
                                src={qrCode} 
                                alt="2FA QR Code" 
                                className="mx-auto border rounded-lg"
                                style={{ maxWidth: '200px' }}
                              />
                            </div>
                          )}
                          
                          <p className="text-sm text-gray-500 mb-4">
                            2. Enter the 6-digit code from your app:
                          </p>
                        </div>
                        
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                          <div>
                            <input
                              {...register('token')}
                              type="text"
                              maxLength={6}
                              className="input-field text-center text-lg tracking-widest"
                              placeholder="000000"
                              autoComplete="one-time-code"
                            />
                            {errors.token && (
                              <p className="mt-1 text-sm text-red-600">{errors.token.message}</p>
                            )}
                          </div>

                          {errors.root && (
                            <div className="text-red-600 text-sm text-center">
                              {errors.root.message}
                            </div>
                          )}

                          <div className="flex justify-end space-x-3">
                            <button
                              type="button"
                              onClick={() => setStep('setup')}
                              className="btn-secondary"
                            >
                              Back
                            </button>
                            <button
                              type="submit"
                              disabled={enable2FAMutation.isPending}
                              className="btn-primary"
                            >
                              {enable2FAMutation.isPending ? 'Verifying...' : 'Enable 2FA'}
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}