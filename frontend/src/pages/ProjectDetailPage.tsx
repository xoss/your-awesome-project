import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeftIcon, PencilIcon } from '@heroicons/react/24/outline'
import { projectService } from '../services/project.service'
import { UpdateProjectDetailsData } from '../types/project'

const updateDetailsSchema = z.object({
  firstName: z.string().min(1).max(50).optional().or(z.literal('')),
  lastName: z.string().min(1).max(50).optional().or(z.literal('')),
  birthday: z.string().optional().or(z.literal('')),
  street: z.string().min(1).max(100).optional().or(z.literal('')),
  houseNumber: z.string().min(1).max(20).optional().or(z.literal('')),
  zipCode: z.string().min(1).max(20).optional().or(z.literal('')),
  city: z.string().min(1).max(50).optional().or(z.literal('')),
  country: z.string().min(1).max(50).optional().or(z.literal('')),
})

type UpdateDetailsFormData = z.infer<typeof updateDetailsSchema>

const statusColors = {
  ACTIVE: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
  PAUSED: 'bg-yellow-100 text-yellow-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)

  const { data, isLoading, error } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectService.getProject(id!),
    enabled: !!id,
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm<UpdateDetailsFormData>({
    resolver: zodResolver(updateDetailsSchema),
  })

  const updateDetailsMutation = useMutation({
    mutationFn: (data: UpdateProjectDetailsData) => 
      projectService.updateProjectDetails(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] })
      setIsEditing(false)
    },
    onError: (error: any) => {
      setError('root', {
        message: error.response?.data?.error || 'Failed to update project details',
      })
    },
  })

  const project = data?.project

  const handleEdit = () => {
    if (project?.details) {
      reset({
        firstName: project.details.firstName || '',
        lastName: project.details.lastName || '',
        birthday: project.details.birthday ? project.details.birthday.split('T')[0] : '',
        street: project.details.street || '',
        houseNumber: project.details.houseNumber || '',
        zipCode: project.details.zipCode || '',
        city: project.details.city || '',
        country: project.details.country || '',
      })
    }
    setIsEditing(true)
  }

  const onSubmit = (data: UpdateDetailsFormData) => {
    const cleanData: UpdateProjectDetailsData = {}
    
    Object.entries(data).forEach(([key, value]) => {
      if (value && value.trim() !== '') {
        if (key === 'birthday') {
          cleanData[key as keyof UpdateProjectDetailsData] = new Date(value).toISOString()
        } else {
          cleanData[key as keyof UpdateProjectDetailsData] = value.trim()
        }
      }
    })
    
    updateDetailsMutation.mutate(cleanData)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="text-center text-red-600 p-4">
        Project not found or failed to load.
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to Projects
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {project.name}
              </h3>
              {project.description && (
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  {project.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${statusColors[project.status]}`}>
                {project.status.toLowerCase()}
              </span>
              <button
                onClick={handleEdit}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit Details
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Created</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {new Date(project.createdAt).toLocaleDateString()}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {new Date(project.updatedAt).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Project Details
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Personal information and contact details for this project.
          </p>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit(onSubmit)} className="border-t border-gray-200">
            <div className="px-4 py-5 sm:px-6 space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    {...register('firstName')}
                    type="text"
                    className="input-field"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <input
                    {...register('lastName')}
                    type="text"
                    className="input-field"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Birthday
                  </label>
                  <input
                    {...register('birthday')}
                    type="date"
                    className="input-field"
                  />
                  {errors.birthday && (
                    <p className="mt-1 text-sm text-red-600">{errors.birthday.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Street
                  </label>
                  <input
                    {...register('street')}
                    type="text"
                    className="input-field"
                  />
                  {errors.street && (
                    <p className="mt-1 text-sm text-red-600">{errors.street.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    House Number
                  </label>
                  <input
                    {...register('houseNumber')}
                    type="text"
                    className="input-field"
                  />
                  {errors.houseNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.houseNumber.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    ZIP Code
                  </label>
                  <input
                    {...register('zipCode')}
                    type="text"
                    className="input-field"
                  />
                  {errors.zipCode && (
                    <p className="mt-1 text-sm text-red-600">{errors.zipCode.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    City
                  </label>
                  <input
                    {...register('city')}
                    type="text"
                    className="input-field"
                  />
                  {errors.city && (
                    <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Country
                  </label>
                  <input
                    {...register('country')}
                    type="text"
                    className="input-field"
                  />
                  {errors.country && (
                    <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>
                  )}
                </div>
              </div>

              {errors.root && (
                <div className="text-red-600 text-sm">
                  {errors.root.message}
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateDetailsMutation.isPending}
                  className="btn-primary"
                >
                  {updateDetailsMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">First Name</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  {project.details?.firstName || 'Not provided'}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Last Name</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  {project.details?.lastName || 'Not provided'}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Birthday</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  {project.details?.birthday 
                    ? new Date(project.details.birthday).toLocaleDateString()
                    : 'Not provided'
                  }
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Address</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  {[
                    project.details?.street,
                    project.details?.houseNumber,
                    project.details?.zipCode,
                    project.details?.city,
                    project.details?.country
                  ].filter(Boolean).join(', ') || 'Not provided'}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </div>
  )
}