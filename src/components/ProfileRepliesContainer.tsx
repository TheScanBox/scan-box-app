import React, { useEffect, useState } from 'react'
import CommentInput from './CommentInput'
import Comment from './Comment'
import { Drawer, DrawerContent, DrawerTitle } from './ui/drawer'
import { IoMdClose } from 'react-icons/io'
import { CommentType } from '@/pages/Comments'
import { BsChatDots } from 'react-icons/bs'
import { useNavigate } from 'react-router-dom'
import { useGetCommentById } from '@/hooks/comments/useGetCommentById'
import useUser from '@/hooks/useUser'
import CommentLoading from './CommentLoading'
import { DialogDescription } from '@radix-ui/react-dialog'
import { useSafeArea } from '@/context/SafeAreaContext'

type ProfileRepliesContainerType = {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    commentId?: string | null;
}

const ProfileRepliesContainer = ({ open, setOpen, commentId }: ProfileRepliesContainerType) => {
    const { bottom } = useSafeArea()
    const user = useUser()
    const navigate = useNavigate()

    const [commentInput, setCommentInput] = useState("");
    const [editCommentId, setEditCommentId] = useState<string | null>(null);
    const [viewAllReplies, setViewAllReplies] = useState(false);

    const { data: comment, error, isLoading, refetch } = useGetCommentById<CommentType>(commentId)

    const handleOpenComment = () => {
        if (isLoading || !comment) return;

        navigate(`/comments/${comment?.scanId}/${comment?.chapterNumber}?source=profile`, {
            state: {
                scan: {
                    title: comment?.scan?.title,
                    scanId: comment?.scan?.scanId,
                    scanParentId: comment?.scan?.scanParentId,
                    imgUrl: comment?.scan?.imgUrl,
                    scanPath: comment?.scan?.scanPath,
                    chap: comment?.chapterNumber
                }
            }
        })
    }

    useEffect(() => {
        if (commentId) {
            setCommentInput("");
            setEditCommentId(null);

            const otherReplies = comment?.replies?.find(reply => reply.user.id != user?.id);
            const myReplies = comment?.replies?.find(reply => reply.user.id == user?.id);
            setViewAllReplies(!otherReplies || !myReplies);
        }
    }, [commentId, comment]);


    return (
        <Drawer open={open} onOpenChange={() => setOpen(false)}>
            <DrawerContent
                className="text-white h-4/5 bg-slate-800 border-0 outline-0"
                style={{ paddingBottom: `calc(${bottom}px + 5.2rem)` }}
                aria-describedby="replies-container"
                aria-description=""
            >
                <DrawerTitle hidden={true} />
                <DialogDescription className="sr-only">
                    Hidden description for screen readers.
                </DialogDescription>

                <div className="flex items-center justify-between px-2 pb-3 text-xl -mt-2">
                    <h1 className="">Replies {comment?.replies && comment.replies.length > 0 ? `(${comment.replies.length})` : ""}</h1>
                    <div className="flex gap-3">
                        <div
                            className={`cursor-pointer hover:text-slate-400 ${(isLoading || !comment) && "text-slate-400 cursor-not-allowed"}`}
                            onClick={handleOpenComment}>
                            <BsChatDots />
                        </div>
                        <div className="cursor-pointer hover:text-slate-400" onClick={() => setOpen(false)}>
                            <IoMdClose />
                        </div>
                    </div>
                </div>
                {isLoading && (
                    <div className="flex flex-col gap-2 overflow-y-auto h-full">
                        <CommentLoading />
                        <CommentLoading isReply={true} />
                        <CommentLoading isReply={true} />
                    </div>
                )}
                {
                    error && (
                        <div className="flex h-full flex-col justify-center items-center text-white">
                            <h1 className="text-sm text-center">
                                Une erreur s'est produite lors du chargement des commentaires.
                            </h1>
                            <button
                                className="bg-red-600 px-3 py-2 rounded-lg mt-2 text-sm cursor-pointer"
                                onClick={() => refetch()}
                            >
                                Réessayer
                            </button>
                        </div>
                    )
                }
                {!isLoading && !error && comment && (
                    <>
                        <div className="flex flex-col overflow-y-auto h-full">
                            <Comment
                                id={comment.id}
                                user={comment.user}
                                date={comment.date}
                                content={comment.content}
                                repliesCount={comment.repliesCount || 0}
                                likesCount={comment.likesCount || 0}
                                dislikesCount={comment.dislikesCount || 0}
                                isLiked={comment.isLiked || false}
                                isDisliked={comment.isDisliked || false}
                                isReply={false}
                                handleEditComment={(id, content) => {
                                    setCommentInput(content);
                                    setEditCommentId(id.toString());
                                }}
                                onDelete={() => setOpen(false)}
                                fromProfile={true}
                            />

                            {!viewAllReplies && <div onClick={() => setViewAllReplies(true)} className='flex justify-center items-center text-xs text-slate-400 px-2 py-1 border-y border-slate-700 cursor-pointer hover:bg-slate-700 transition-colors duration-200'>
                                Afficher les autres réponses
                            </div>}

                            {
                                comment.replies?.filter(reply => viewAllReplies ? reply : reply.user.id == user?.id).map((reply) => (
                                    <Comment
                                        key={reply.id}
                                        id={reply.id}
                                        user={reply.user}
                                        date={reply.date}
                                        content={reply.content}
                                        repliesCount={reply.repliesCount || 0}
                                        likesCount={reply.likesCount || 0}
                                        dislikesCount={reply.dislikesCount || 0}
                                        isLiked={reply.isLiked || false}
                                        isDisliked={reply.isDisliked || false}
                                        isReply={reply.isReply || Boolean(reply.parentId)}
                                        parentId={reply.parentId}
                                        handleEditComment={(id, content) => {
                                            setCommentInput(content);
                                            setEditCommentId(id);
                                        }}
                                        fromProfile={true}
                                    // handleEditComment={handleEditComment}    
                                    />
                                ))
                            }

                            {
                                !comment.replies?.length && (
                                    <div className="flex justify-center items-center py-4">
                                        <p className="text-xs text-slate-300 text-center">Aucun commentaire pour le moment. Soyez le premier à commenter.</p>
                                    </div>
                                )
                            }
                        </div>
                    </>
                )}
                <CommentInput
                    comment={commentInput}
                    setComment={setCommentInput}
                    isEdit={Boolean(editCommentId)}
                    commentId={commentId!}
                    editCommentId={editCommentId!}
                    setEditCommentId={setEditCommentId}
                    placeholder="Répondre.."
                    fromProfile={true}
                    chapterNumber={comment?.chapterNumber}
                    scanId={comment?.scanId}
                />
            </DrawerContent>
        </Drawer>
    )
}

export default ProfileRepliesContainer