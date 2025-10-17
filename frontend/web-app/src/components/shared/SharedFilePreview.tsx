'use client'

import React from 'react'

type Props = {
	fileUrl: string
	fileName: string
	fileType?: string
	fileSize?: number
	className?: string
}

function isType(type: string | undefined, prefix: string): boolean {
	return !!type && type.toLowerCase().startsWith(prefix)
}

function getExtension(name: string): string {
	const parts = name.split('.')
	return parts.length > 1 ? parts.pop()!.toLowerCase() : ''
}

export default function SharedFilePreview({ fileUrl, fileName, fileType, fileSize, className }: Props) {
	const ext = getExtension(fileName)

	return (
		<div className={`w-full h-full flex flex-col bg-white ${className || ''}`}>
			{/* Header */}
			<div className="px-4 py-2 border-b border-gray-200 text-sm text-gray-700 flex items-center justify-between">
				<span className="font-medium truncate">{fileName}</span>
				{typeof fileSize === 'number' && (
					<span className="text-gray-500">{Math.round(fileSize / 1024)} KB</span>
				)}
			</div>

			{/* Body */}
			<div className="flex-1 min-h-0">
				{(isType(fileType, 'application/pdf') || ext === 'pdf') && (
					<iframe src={fileUrl} title={fileName} className="w-full h-full border-0" />
				)}

				{(isType(fileType, 'image/') || ['jpg','jpeg','png','gif','bmp','webp','svg','ico'].includes(ext)) && (
					<div className="w-full h-full flex items-center justify-center bg-gray-50">
						<img src={fileUrl} alt={fileName} className="max-w-full max-h-full object-contain" />
					</div>
				)}

				{(isType(fileType, 'video/') || ['mp4','avi','mov','wmv','flv','webm','mkv'].includes(ext)) && (
					<video src={fileUrl} controls className="w-full h-full bg-black object-contain" />
				)}

				{(isType(fileType, 'audio/') || ['mp3','wav','ogg','aac','flac','m4a'].includes(ext)) && (
					<div className="w-full h-full flex items-center justify-center">
						<audio src={fileUrl} controls className="w-full max-w-xl" />
					</div>
				)}

				{(isType(fileType, 'text/') || ['txt','log','csv'].includes(ext)) && (
					<iframe src={fileUrl} title={fileName} className="w-full h-full border-0 bg-white" />
				)}

				{/* Fallback */}
				{!fileType && ext === '' && (
					<div className="h-full flex items-center justify-center text-sm text-gray-600">
						Không hỗ trợ xem trước. <a href={fileUrl} className="ml-2 text-indigo-600 underline">Tải xuống</a>
					</div>
				)}
			</div>
		</div>
	)
}


