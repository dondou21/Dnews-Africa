"use client";

import { useState, useCallback } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import CoverImageUpload from "./CoverImageUpload";

export interface FeaturedImageData {
  url: string;
  alt: string;
  mediaId?: string;
  caption?: string;
  credit?: string;
  source?: string;
  description?: string;
  copyright?: string;
  location?: string;
  dateTaken?: string;
}

interface FeaturedImageEditorProps {
  initialUrl?: string;
  initialAlt?: string;
  initialCaption?: string;
  initialCredit?: string;
  initialSource?: string;
  initialDescription?: string;
  initialCopyright?: string;
  initialLocation?: string;
  initialDateTaken?: string;
  onChange: (data: FeaturedImageData) => void;
}

export default function FeaturedImageEditor({
  initialUrl,
  initialAlt,
  initialCaption,
  initialCredit,
  initialSource,
  initialDescription,
  initialCopyright,
  initialLocation,
  initialDateTaken,
  onChange,
}: FeaturedImageEditorProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mediaUrl, setMediaUrl] = useState(initialUrl ?? "");
  const [mediaId, setMediaId] = useState("");
  const [alt, setAlt] = useState(initialAlt ?? "");
  const [caption, setCaption] = useState(initialCaption ?? "");
  const [credit, setCredit] = useState(initialCredit ?? "");
  const [source, setSource] = useState(initialSource ?? "");
  const [description, setDescription] = useState(initialDescription ?? "");
  const [copyright, setCopyright] = useState(initialCopyright ?? "");
  const [location, setLocation] = useState(initialLocation ?? "");
  const [dateTaken, setDateTaken] = useState(initialDateTaken ?? "");

  const emitChange = useCallback(
    (overrides?: Partial<FeaturedImageData>) => {
      onChange({
        url: mediaUrl,
        alt,
        mediaId,
        caption,
        credit,
        source,
        description,
        copyright,
        location,
        dateTaken,
        ...overrides,
      });
    },
    [mediaUrl, alt, mediaId, caption, credit, source, description, copyright, location, dateTaken, onChange],
  );

  const handleImageChange = useCallback(
    (url: string, newAlt: string, newMediaId?: string) => {
      setMediaUrl(url);
      setMediaId(newMediaId ?? "");
      setAlt(newAlt);
      if (!url) {
        setCaption("");
        setCredit("");
        setSource("");
        setDescription("");
        setCopyright("");
        setLocation("");
        setDateTaken("");
      }
      emitChange({ url, alt: newAlt, mediaId: newMediaId });
    },
    [emitChange],
  );

  const handleAltChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setAlt(val);
      emitChange({ alt: val });
    },
    [emitChange],
  );

  const handleFieldChange = useCallback(
    (field: string, value: string) => {
      const setters: Record<string, (v: string) => void> = {
        caption: setCaption,
        credit: setCredit,
        source: setSource,
        description: setDescription,
        copyright: setCopyright,
        location: setLocation,
        dateTaken: setDateTaken,
      };
      setters[field]?.(value);
      emitChange({ [field]: value } as Partial<FeaturedImageData>);
    },
    [emitChange],
  );

  const hasImage = !!mediaUrl;

  return (
    <div className="space-y-3">
      <CoverImageUpload
        initialUrl={initialUrl}
        initialAlt={initialAlt}
        onImageChange={handleImageChange}
      />

      {hasImage && (
        <div className="space-y-3 rounded-sm border border-dnews-border p-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">
              Alt Text
            </label>
            <input
              type="text"
              value={alt}
              onChange={handleAltChange}
              placeholder="Describe the image for accessibility"
              className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark placeholder-dnews-muted outline-none transition-colors focus:border-dnews-accent"
            />
          </div>

          <div>
            <div
              className="flex items-center justify-between cursor-pointer select-none py-1"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-dnews-gray">
                Advanced
              </span>
              {showAdvanced ? (
                <ChevronDown size={14} className="text-dnews-muted" />
              ) : (
                <ChevronRight size={14} className="text-dnews-muted" />
              )}
            </div>

            {showAdvanced && (
              <div className="mt-2 space-y-3 border-t border-dnews-border pt-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">
                      Caption
                    </label>
                    <input
                      type="text"
                      value={caption}
                      onChange={(e) => handleFieldChange("caption", e.target.value)}
                      placeholder="Image caption"
                      className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark placeholder-dnews-muted outline-none transition-colors focus:border-dnews-accent"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">
                      Credit
                    </label>
                    <input
                      type="text"
                      value={credit}
                      onChange={(e) => handleFieldChange("credit", e.target.value)}
                      placeholder="Photographer name"
                      className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark placeholder-dnews-muted outline-none transition-colors focus:border-dnews-accent"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">
                      Source
                    </label>
                    <input
                      type="text"
                      value={source}
                      onChange={(e) => handleFieldChange("source", e.target.value)}
                      placeholder="e.g. Reuters, AFP"
                      className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark placeholder-dnews-muted outline-none transition-colors focus:border-dnews-accent"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">
                      Copyright
                    </label>
                    <input
                      type="text"
                      value={copyright}
                      onChange={(e) => handleFieldChange("copyright", e.target.value)}
                      placeholder="© 2026"
                      className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark placeholder-dnews-muted outline-none transition-colors focus:border-dnews-accent"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => handleFieldChange("description", e.target.value)}
                    placeholder="Longer description of the image"
                    rows={2}
                    className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark placeholder-dnews-muted outline-none transition-colors focus:border-dnews-accent"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">
                      Location
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => handleFieldChange("location", e.target.value)}
                      placeholder="e.g. Nairobi, Kenya"
                      className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark placeholder-dnews-muted outline-none transition-colors focus:border-dnews-accent"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">
                      Date Taken
                    </label>
                    <input
                      type="date"
                      value={dateTaken}
                      onChange={(e) => handleFieldChange("dateTaken", e.target.value)}
                      className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark outline-none transition-colors focus:border-dnews-accent"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
