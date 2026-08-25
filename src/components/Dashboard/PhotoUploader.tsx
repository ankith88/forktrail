'use client';

import React, { useState, useRef } from 'react';
import { parsePhotoEXIF } from '@/lib/exif';
import { PhotoEXIFData, AIProcessedPhotoGroup } from '@/types';
import { UploadCloud, Sparkles, X, MapPin, Calendar, Check, Loader2, Image as ImageIcon, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

import { uploadImageToStorage } from '@/lib/firebase/storageUpload';

interface PhotoUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  onImportChapters: (chapters: AIProcessedPhotoGroup[]) => void;
  userId?: string;
}

export function PhotoUploader({ isOpen, onClose, onImportChapters, userId }: PhotoUploaderProps) {
  const [fileList, setFileList] = useState<File[]>([]);
  const [exifDataList, setExifDataList] = useState<PhotoEXIFData[]>([]);
  const [isProcessingEXIF, setIsProcessingEXIF] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [aiResultChapters, setAiResultChapters] = useState<AIProcessedPhotoGroup[] | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const selectedFiles = Array.from(e.target.files);
    setFileList(selectedFiles);
    setIsProcessingEXIF(true);

    const parsedResults: PhotoEXIFData[] = [];
    for (const file of selectedFiles) {
      const data = await parsePhotoEXIF(file);
      if (userId) {
        try {
          const storageUrl = await uploadImageToStorage(file, userId, 'exif_photos');
          data.previewUrl = storageUrl;
        } catch (err) {
          console.warn('Could not upload EXIF photo to Firebase Storage:', err);
        }
      }
      parsedResults.push(data);
    }

    setExifDataList(parsedResults);
    setIsProcessingEXIF(false);
  };

  const handleRunAIPipeline = async () => {
    if (!exifDataList.length) return;
    setIsProcessingAI(true);

    try {
      const res = await fetch('/api/process-photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photos: exifDataList }),
      });

      const data = await res.json();
      if (data.success && data.chapters) {
        setAiResultChapters(data.chapters);
      }
    } catch (err) {
      console.error('Error executing AI photo pipeline:', err);
    } finally {
      setIsProcessingAI(false);
    }
  };

  const handleCommitImport = () => {
    if (aiResultChapters) {
      onImportChapters(aiResultChapters);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl border border-[#025259]/20 bg-[#FFFFFF] p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#025259]/15 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ff947a] text-[#025259] shadow-md">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#025259]">Smart EXIF & AI Timeline Generator</h2>
              <p className="text-xs text-stone-600">
                Upload food photos. We extract GPS geotags & timestamps, cluster by day, and auto-tag dishes.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-stone-400 hover:bg-[#FDF8F0] hover:text-[#025259] transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step 1: Upload Zone */}
        {!aiResultChapters && (
          <div className="space-y-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="group cursor-pointer rounded-2xl border-2 border-dashed border-[#025259]/25 bg-[#FAF3E7] p-8 text-center hover:border-[#ff947a] hover:bg-[#FDF8F0] transition duration-200"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <UploadCloud className="mx-auto h-12 w-12 text-[#025259]/50 group-hover:text-[#ff947a] transition" />
              <p className="mt-3 text-sm font-bold text-[#025259]">
                Click or drag & drop food photos here
              </p>
              <p className="text-xs text-stone-500 mt-1">
                Supports JPG, PNG, WEBP with camera EXIF GPS & metadata
              </p>
            </div>

            {/* EXIF Parsed Files Preview */}
            {isProcessingEXIF && (
              <div className="flex items-center justify-center gap-2 py-4 text-xs font-bold text-[#025259]">
                <Loader2 className="h-4 w-4 animate-spin text-[#ff947a]" />
                <span>Extracting EXIF GPS coordinates & timestamps...</span>
              </div>
            )}

            {exifDataList.length > 0 && !isProcessingEXIF && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-[#025259]">
                  <span className="font-bold">{exifDataList.length} Photos Extracted & Geotagged</span>
                  <button
                    onClick={handleRunAIPipeline}
                    disabled={isProcessingAI}
                    className="flex items-center gap-2 rounded-lg bg-[#ff947a] px-4 py-2 text-xs font-bold text-[#025259] hover:bg-[#f08368] shadow-md transition disabled:opacity-50"
                  >
                    {isProcessingAI ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Clustering with Gemini AI...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Run AI Timeline Pipeline
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-56 overflow-y-auto p-1">
                  {exifDataList.map((item, idx) => (
                    <div key={idx} className="relative rounded-xl border border-[#025259]/15 bg-[#FDF8F0] p-2 space-y-1.5 shadow-sm">
                      <div className="h-20 w-full rounded-lg overflow-hidden border border-stone-200">
                        <img src={item.previewUrl} alt={item.fileName} className="h-full w-full object-cover" />
                      </div>
                      <p className="text-[11px] font-bold text-[#025259] truncate">{item.fileName}</p>
                      <div className="flex items-center justify-between text-[10px] text-stone-600">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-[#ff947a]" />
                          {item.lat ? `${item.lat.toFixed(2)}, ${item.lng?.toFixed(2)}` : 'Geotagged'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: AI Clustering Preview & Confirmation */}
        {aiResultChapters && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-[#FDF8F0] border border-[#ff947a]/50 p-3 rounded-xl text-xs text-[#025259]">
              <span className="flex items-center gap-2 font-bold">
                <Check className="h-4 w-4 text-[#ff947a]" />
                AI Pipeline created {aiResultChapters.length} daily chapters and auto-tagged dishes!
              </span>
              <button
                onClick={() => setAiResultChapters(null)}
                className="text-stone-500 hover:text-[#025259] underline text-[11px]"
              >
                Re-upload
              </button>
            </div>

            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
              {aiResultChapters.map((chap, idx) => (
                <div key={idx} className="rounded-xl border border-[#025259]/15 bg-[#FDF8F0] p-4 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between border-b border-[#025259]/15 pb-2">
                    <h4 className="font-bold text-sm text-[#025259]">{chap.suggestedChapterTitle}</h4>
                    <span className="text-xs text-[#025259] font-mono font-bold">{chap.date}</span>
                  </div>

                  <div className="space-y-2">
                    {chap.places.map((place, pIdx) => (
                      <div key={pIdx} className="flex items-center justify-between bg-[#FFFFFF] p-2.5 rounded-lg border border-[#025259]/15 text-xs shadow-sm">
                        <div>
                          <p className="font-bold text-[#025259]">{place.suggestedVenueName}</p>
                          <p className="text-[11px] text-stone-600 mt-0.5">{place.suggestedTastingNotes}</p>
                          <div className="flex items-center gap-1 mt-1">
                            {place.detectedDishes.map((dish, dIdx) => (
                              <span key={dIdx} className="text-[10px] bg-[#FAF3E7] text-[#025259] px-1.5 py-0.5 rounded font-medium border border-[#025259]/10">
                                #{dish}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-[#E3A857]">{place.suggestedRating} ★</span>
                          <span className="block text-[10px] text-stone-500">{place.suggestedCategory}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#025259]/15">
              <button
                onClick={onClose}
                className="rounded-lg border border-[#025259]/20 px-4 py-2 text-xs font-semibold text-[#025259] hover:bg-[#FDF8F0] transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCommitImport}
                className="flex items-center gap-2 rounded-lg bg-[#ff947a] px-5 py-2 text-xs font-bold text-[#025259] hover:bg-[#f08368] transition shadow-md"
              >
                <Check className="h-4 w-4" />
                Add to Trip Timeline
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
