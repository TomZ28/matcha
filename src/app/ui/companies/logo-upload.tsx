'use client'
import React, { useEffect, useState } from 'react'
import { createClient } from '@/app/utils/supabase/client'
import Image from 'next/image'
import { BuildingOffice2Icon, CameraIcon } from '@heroicons/react/24/outline'

export default function LogoUpload({
  companyId,
  url,
  size,
  onUpload,
}: {
  companyId: string | null
  url: string | null
  size: number
  onUpload: (url: string) => void
}) {
  const supabase = createClient()
  const [logoUrl, setLogoUrl] = useState<string | null>(url)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    async function downloadImage(path: string) {
      try {
        const { data, error } = await supabase.storage.from('logos').download(path)
        if (error) {
          throw error
        }

        const url = URL.createObjectURL(data)
        setLogoUrl(url)
      } catch (error) {
        console.log('Error downloading image: ', error)
      }
    }

    if (url) downloadImage(url)
  }, [url, supabase])

  const uploadLogo: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
    try {
      setUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const filePath = `${companyId || 'new'}-${Math.random()}.${fileExt}`

      const { error: uploadError } = await supabase.storage.from('logos').upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      onUpload(filePath)
    } catch (error) {
      alert('Error uploading logo!')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      {logoUrl ? (
        <Image
          width={size}
          height={size}
          src={logoUrl}
          alt="Company Logo"
          className="rounded-lg border border-gray-200 object-cover"
          style={{ height: size, width: size }}
        />
      ) : (
        <div 
          className="flex items-center justify-center rounded-lg bg-[#f0f5f1] border border-gray-200 text-[#44624a]" 
          style={{ height: size, width: size }}
        >
          <BuildingOffice2Icon className="h-3/4 w-3/4" />
        </div>
      )}
      <div style={{ width: size }}>
        <label className="mt-2 flex justify-center items-center cursor-pointer bg-[#44624a] hover:bg-[#3a553f] text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors" htmlFor="company-logo">
          {uploading ? (
            <span>Uploading...</span>
          ) : (
            <>
              <CameraIcon className="h-4 w-4 mr-1.5" />
              <span>Upload</span>
            </>
          )}
        </label>
        <input
          style={{
            visibility: 'hidden',
            position: 'absolute',
          }}
          type="file"
          id="company-logo"
          accept="image/*"
          onChange={uploadLogo}
          disabled={uploading}
        />
      </div>
    </div>
  )
} 