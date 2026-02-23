import { FormEvent, useEffect, useState } from "react";
import { CustomModal } from "@/components";
import toast from "react-hot-toast";
import { useAppContentStore } from "@/store/useAppContentStore";

type EditPlaylistModalProps = {
  isOpen: boolean;
  onClose: () => void;
  playlistId: string;
  playlistName: string;
};

export function EditPlaylistModal({
  isOpen,
  onClose,
  playlistId,
  playlistName,
}: EditPlaylistModalProps) {
  const [name, setName] = useState(playlistName ?? "");

  const editPlaylistName = useAppContentStore((s) => s.editPlaylistName);

  useEffect(() => {
    if (isOpen) {
      setName(playlistName ?? "");
    }
  }, [isOpen, playlistName]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Enter a playlist name");
      return;
    }
    await editPlaylistName(playlistId, trimmed);
    onClose();
  };

  const handleClose = () => {
    setName(playlistName ?? "");
    onClose();
  };

  return (
    <CustomModal isOpen={isOpen} onClose={handleClose} title="Edit playlist">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-white/70">Name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My playlist"
            autoFocus
            className="rounded-md bg-white/5 px-3 py-2 text-sm outline-none
              focus:ring-2 focus:ring-white/40 border border-white/10"
          />
        </label>
        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-md px-3 py-2 text-sm bg-white/5 hover:bg-white/10
              transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-md px-3 py-2 text-sm bg-white/10 hover:bg-white/20
              font-medium transition-colors"
          >
            Save
          </button>
        </div>
      </form>
    </CustomModal>
  );
}

