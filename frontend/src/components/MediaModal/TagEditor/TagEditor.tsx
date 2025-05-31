import React, { useState } from "react";
import { MediaFile, Tag } from "@/types";
import { mediaApi } from "@/services/api";
import { useTags } from "@/hooks/useMedia";
import { TagList } from "@/components/ui/Tag";
import { AvailableTags } from "./components/AvailableTags";
import { CreateTagForm } from "./components/CreateTagForm";

interface TagEditorProps {
  media: MediaFile;
  onMediaUpdate: (media: MediaFile) => void;
}

export function TagEditor({ media, onMediaUpdate }: TagEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showCreateTag, setShowCreateTag] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const tagsQuery = useTags();
  const allTags = tagsQuery.data?.success ? tagsQuery.data.data : [];

  const handleAddTag = async (tagId: string) => {
    setLoading(true);
    try {
      const response = await mediaApi.addTags(media.id, [tagId]);
      if (response.success && response.data) {
        onMediaUpdate(response.data);
      }
    } catch (error) {
      console.error("Failed to add tag:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTag = async (tagId: string) => {
    setLoading(true);
    try {
      const response = await mediaApi.removeTags(media.id, [tagId]);
      if (response.success && response.data) {
        onMediaUpdate(response.data);
      }
    } catch (error) {
      console.error("Failed to remove tag:", error);
    } finally {
      setLoading(false);
    }
  };

  const availableTags = Array.isArray(allTags)
    ? allTags.filter((tag: Tag) => {
        const matchesSearch =
          searchTerm === "" ||
          tag.name.toLowerCase().includes(searchTerm.toLowerCase());
        const notAlreadyAdded = !media.tags.some(
          (mediaTag) => mediaTag.id === tag.id
        );
        return matchesSearch && notAlreadyAdded;
      })
    : [];

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setSearchTerm("");
      setShowCreateTag(false);
    }
  };

  return (
    <div className="p-5 transition-all duration-300 border rounded-xl bg-gradient-to-br from-card/80 to-card/60 border-border/50 hover:border-border/80 hover:from-card/90 hover:to-card/70 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <svg
              className="w-4 h-4 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-foreground">Tags</h3>
          <div className="px-2 py-0.5 text-xs font-medium rounded-full bg-muted/50 text-muted-foreground">
            {media.tags.length}
          </div>
        </div>
        <button
          onClick={handleEditToggle}
          className={`px-3 py-1.5 text-xs font-medium transition-all duration-200 rounded-lg border ${
            isEditing
              ? "bg-primary text-primary-foreground border-primary/20 hover:bg-primary/90"
              : "bg-secondary/50 text-secondary-foreground border-secondary/20 hover:bg-secondary hover:border-secondary/40"
          } focus:outline-none focus:ring-2 focus:ring-primary/20`}
        >
          {isEditing ? (
            <div className="flex items-center gap-1.5">
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Done
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit
            </div>
          )}
        </button>
      </div>

      {/* Current Tags */}
      <div className="mb-4">
        {media.tags.length > 0 ? (
          <TagList
            tags={media.tags}
            removable={isEditing}
            onRemove={handleRemoveTag}
            loading={loading}
          />
        ) : (
          <div className="flex items-center justify-center p-6 border border-dashed rounded-lg bg-muted/20 border-border/50">
            <div className="text-center">
              <svg
                className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
              <p className="text-sm text-muted-foreground">No tags assigned</p>
              <p className="text-xs text-muted-foreground/70 mt-0.5">
                Click "Edit" to add tags
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Tag Editor */}
      {isEditing && (
        <div className="pt-4 space-y-4 border-t border-border/30">
          {/* Search and Available Tags */}
          <div className="space-y-3">
            <div className="relative">
              <svg
                className="absolute w-4 h-4 transform -translate-y-1/2 left-3 top-1/2 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search existing tags..."
                className="w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg border-border/50 bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-200"
              />
            </div>

            <AvailableTags
              availableTags={availableTags}
              onAddTag={handleAddTag}
              loading={loading}
            />
          </div>

          {/* Create New Tag */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium tracking-wider uppercase text-muted-foreground">
                Create New Tag
              </p>
              {!showCreateTag && (
                <button
                  onClick={() => setShowCreateTag(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-all duration-200 rounded-lg border border-dashed border-primary/40 text-primary hover:border-primary hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  New Tag
                </button>
              )}
            </div>

            {showCreateTag && (
              <CreateTagForm
                onTagCreated={handleAddTag}
                onCancel={() => setShowCreateTag(false)}
                loading={loading}
                setLoading={setLoading}
                onRefreshTags={tagsQuery.refetch}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
