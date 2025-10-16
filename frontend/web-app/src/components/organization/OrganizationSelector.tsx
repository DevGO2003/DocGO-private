'use client'

import { useState, useEffect } from 'react'
import { organizationAPI } from '@/lib/apis/organization-api'
import { Organization } from '@/types/organization'
import { ChevronDownIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline'

interface OrganizationSelectorProps {
  onOrganizationChange?: (organization: Organization | null) => void
  className?: string
}

export default function OrganizationSelector({ onOrganizationChange, className = '' }: OrganizationSelectorProps) {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrganizations()
    loadSelectedOrganization()
  }, [])

  const loadOrganizations = async () => {
    try {
      setLoading(true)
      const response = await organizationAPI.getAllOrganizations({
        page: 0,
        size: 100,
        sortBy: 'createdAt',
        sortDirection: 'DESC'
      })
      
      if (response.data?.data?.content) {
        setOrganizations(response.data.data.content)
      }
    } catch (error) {
      console.error('Error loading organizations:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadSelectedOrganization = () => {
    try {
      const savedOrgId = localStorage.getItem('selected_organization_id')
      if (savedOrgId) {
        // Find organization from the list or load it separately
        const savedOrg = organizations.find(org => org.id === savedOrgId)
        if (savedOrg) {
          setSelectedOrganization(savedOrg)
        }
      }
    } catch (error) {
      console.error('Error loading selected organization:', error)
    }
  }

  useEffect(() => {
    if (organizations.length > 0) {
      loadSelectedOrganization()
    }
  }, [organizations])

  const handleOrganizationSelect = (organization: Organization) => {
    setSelectedOrganization(organization)
    setIsOpen(false)
    
    // Save to localStorage
    localStorage.setItem('selected_organization_id', organization.id)
    localStorage.setItem('selected_organization_name', organization.name)
    
    // Notify parent component
    onOrganizationChange?.(organization)
  }

  const handleClearSelection = () => {
    setSelectedOrganization(null)
    setIsOpen(false)
    
    // Clear from localStorage
    localStorage.removeItem('selected_organization_id')
    localStorage.removeItem('selected_organization_name')
    
    // Notify parent component
    onOrganizationChange?.(null)
  }

  if (loading) {
    return (
      <div className={`relative ${className}`}>
        <div className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
          <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
          <span className="text-sm text-gray-500">Đang tải...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
      >
        <div className="flex items-center">
          <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mr-2" />
          <span className="block truncate">
            {selectedOrganization ? selectedOrganization.name : 'Chọn tổ chức'}
          </span>
        </div>
        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <ChevronDownIcon className="h-5 w-5 text-gray-400" />
        </span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute z-20 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
            {organizations.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">
                Không có tổ chức nào
              </div>
            ) : (
              <>
                {organizations.map((org) => (
                  <button
                    key={org.id}
                    onClick={() => handleOrganizationSelect(org)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${
                      selectedOrganization?.id === org.id ? 'bg-primary-50 text-primary-600' : 'text-gray-900'
                    }`}
                  >
                    <div className="flex items-center">
                      <BuildingOfficeIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <div className="font-medium">{org.name}</div>
                        {org.description && (
                          <div className="text-xs text-gray-500 truncate">{org.description}</div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
                
                {selectedOrganization && (
                  <>
                    <div className="border-t border-gray-100 my-1" />
                    <button
                      onClick={handleClearSelection}
                      className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:bg-gray-100"
                    >
                      Bỏ chọn tổ chức
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}

