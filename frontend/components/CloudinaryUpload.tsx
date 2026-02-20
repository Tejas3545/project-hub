'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

interface CloudinaryUploadProps {
    onUploadSuccess: (urls: string[]) => void;
    onError?: (error: string) => void;
    multiple?: boolean;
    maxFiles?: number;
    existingImages?: string[];
}

export default function CloudinaryUpload({
    onUploadSuccess,
    onError,
    multiple = true,
    maxFiles = 5,
    existingImages = []
}: CloudinaryUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [uploadedUrls, setUploadedUrls] = useState<string[]>(existingImages);
    const [previewUrls, setPreviewUrls] = useState<string[]>(existingImages);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFiles = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

        if (!cloudName || !uploadPreset) {
            const error = 'Cloudinary not configured. Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET in environment variables.';
            console.error(error);
            onError?.(error);
            return;
        }

        const filesToUpload = Array.from(files).slice(0, maxFiles - uploadedUrls.length);
        
        if (filesToUpload.length === 0) {
            onError?.(`Maximum ${maxFiles} images allowed`);
            return;
        }

        setUploading(true);
        const newUrls: string[] = [];
        const newPreviews: string[] = [];

        try {
            for (const file of filesToUpload) {
                // Validate file type
                if (!file.type.startsWith('image/')) {
                    console.error(`File ${file.name} is not an image`);
                    continue;
                }

                // Create preview
                const previewUrl = URL.createObjectURL(file);
                newPreviews.push(previewUrl);

                // Upload to Cloudinary
                const formData = new FormData();
                formData.append('file', file);
                formData.append('upload_preset', uploadPreset);
                formData.append('folder', 'project-screenshots');

                const response = await fetch(
                    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                    {
                        method: 'POST',
                        body: formData,
                    }
                );

                if (!response.ok) {
                    throw new Error(`Upload failed for ${file.name}`);
                }

                const data = await response.json();
                newUrls.push(data.secure_url);
            }

            const allUrls = [...uploadedUrls, ...newUrls];
            setUploadedUrls(allUrls);
            setPreviewUrls([...previewUrls, ...newPreviews]);
            onUploadSuccess(allUrls);
        } catch (error) {
            console.error('Upload error:', error);
            onError?.(error instanceof Error ? error.message : 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const removeImage = (index: number) => {
        const newUrls = uploadedUrls.filter((_, i) => i !== index);
        const newPreviews = previewUrls.filter((_, i) => i !== index);
        setUploadedUrls(newUrls);
        setPreviewUrls(newPreviews);
        onUploadSuccess(newUrls);
    };

    const openFilePicker = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="space-y-4">
            {/* Upload Area */}
            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={openFilePicker}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                    dragActive
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/30 hover:bg-secondary'
                } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple={multiple}
                    accept="image/*"
                    onChange={(e) => handleFiles(e.target.files)}
                    className="hidden"
                    aria-label="Upload images"
                    disabled={uploading || uploadedUrls.length >= maxFiles}
                />

                <div className="flex flex-col items-center gap-3">
                    {uploading ? (
                        <>
                            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                            <p className="text-muted-foreground">Uploading...</p>
                        </>
                    ) : (
                        <>
                            <svg className="w-12 h-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <div>
                                <p className="text-foreground font-medium mb-1">
                                    Click to upload or drag and drop
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    PNG, JPG, GIF up to 10MB ({uploadedUrls.length}/{maxFiles} images)
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Preview Grid */}
            {previewUrls.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {previewUrls.map((url, index) => (
                        <div key={index} className="relative group aspect-video rounded-lg overflow-hidden border border-border">
                            <Image
                                src={url}
                                alt={`Screenshot ${index + 1}`}
                                fill
                                className="object-cover"
                            />
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeImage(index);
                                }}
                                className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Remove image"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
