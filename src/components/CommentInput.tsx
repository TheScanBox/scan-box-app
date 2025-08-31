import React, { useState } from "react";
import { FiSend } from "react-icons/fi";
import { useParams } from "react-router-dom";
import { CommentParamsType } from "@/pages/Comments";
import useUser from "@/hooks/useUser";
import Loading from "./Loading";
import { useAddComment } from "@/hooks/comments/useAddComment";
import { useUpdateComment } from "@/hooks/comments/useUpdateComment";
import { IoMdClose } from "react-icons/io";
import { useSafeArea } from "@/context/SafeAreaContext";

type CommentInputProps = {
    isEdit?: boolean,
    commentId?: string
    editCommentId?: string | null;
    isReply?: boolean,
    authorName?: string
    comment: string;
    setComment: React.Dispatch<React.SetStateAction<string>>;
    setEditCommentId?: React.Dispatch<React.SetStateAction<string | null>>;
    placeholder?: string
    fromProfile?: boolean
    chapterNumber?: number
    scanId?: string;
    onCommentAdded?: () => void;
    onCommentUpdated?: () => void;
}

const CommentInput = ({ isEdit = false, commentId, editCommentId, setEditCommentId, isReply = false, authorName, comment, setComment, placeholder, fromProfile = false, chapterNumber, scanId, onCommentAdded, onCommentUpdated }: CommentInputProps) => {
    const { bottom } = useSafeArea()
    const params = useParams() as CommentParamsType
    const user = useUser()
    const { mutateAsync, isPending } = useAddComment(params.scanId, params.chapterNumber)
    const { mutateAsync: updateComment, isPending: isEditing } = useUpdateComment(params.scanId, params.chapterNumber);

    const [isFocused, setIsFocused] = useState(false);

    const handleSend = async () => {
        try {
            if (comment.trim()) {
                if (isEdit && editCommentId) {
                    // Update existing comment
                    await updateComment({
                        commentId: editCommentId,
                        content: comment,
                        userId: user?.id || 0,
                        fromProfile: fromProfile
                    });

                    if (onCommentUpdated) {
                        onCommentUpdated();
                    }

                    setComment("");
                    return;
                }

                await mutateAsync({
                    content: comment,
                    parentId: commentId || null,
                    userId: user?.id,
                    chapterNumber: parseInt(params.chapterNumber) || chapterNumber,
                    scanId: params?.scanId || scanId,
                    fromProfile: fromProfile
                })

                if (onCommentAdded) {
                    onCommentAdded();
                }

                setComment("");
            }
        } catch (error) {
            console.error(error)
            alert("An error occurred while sending the comment. Please try again later.");
        }
    };

    return (
        <div
            className="fixed bottom-0 z-20 w-full md:max-w-[700px] flex flex-col  px-4 py-3 bg-slate-950"
            style={{ paddingBottom: isFocused ? "1rem" : bottom ? bottom : "1rem" }}
        >
            {isReply && <p className="text-slate-300 text-xs mb-2">Replying to {authorName}</p>}
            <div className="w-full flex justify-between gap-3.5 items-center">
                <input
                    type="text"
                    className="w-full text-xs sm:text-sm rounded-full px-3 py-2 bg-gray-800 text-white outline-none"
                    placeholder={placeholder || "Type a comment..."}
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                />
                <div className="flex items-center gap-2">
                    <button
                        className="text-white p-1 hover:bg-slate-700 rounded-full cursor-pointer"
                        onClick={() => {
                            setComment("");
                            setEditCommentId?.(null);
                        }}
                        hidden={!editCommentId}
                    >
                        <IoMdClose />
                    </button>

                    <button
                        className={`${comment ? "bg-blue-600 hover:bg-blue-700" : "bg-slate-600 hover:bg-slate-500"} text-white p-2 rounded-full  flex items-center justify-center cursor-pointer transition-colors duration-200`}
                        onClick={handleSend}
                    >
                        {!isPending && !isEditing ? <FiSend size={20} /> : <Loading className="w-4 h-4 text-white" />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CommentInput;