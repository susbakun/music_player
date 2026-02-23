import { useState, FormEvent } from "react";
import { CustomModal } from "@/components";
import toast from "react-hot-toast";
import { useAppContentStore } from "@/store/useAppContentStore";
import { useNavigate } from "react-router-dom";

type CreatePlaylistModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function CreatePlaylistModal({ isOpen, onClose }: CreatePlaylistModalProps) {
  const [name, setName] = useState("");

  const navigate = useNavigate()
  
  const createPlaylist = useAppContentStore((s) => s.createPlaylist)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Enter a playlist name");
      return;
    }
    const playlistId = await createPlaylist(trimmed)
    setName("");
    navigate(`playlist/${playlistId}`)
    onClose();
  };

  const handleClose = () => {
    setName("");
    onClose();
  };

  return (
    <CustomModal isOpen={isOpen} onClose={handleClose} title="New playlist">
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
            Create
          </button>
        </div>
      </form>
    </CustomModal>
  );
}
