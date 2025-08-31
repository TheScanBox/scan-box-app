
export type HeartbeatResponse = {
    success: boolean;
    timeout: boolean;
}

export type UserType = {
    id: number;
    name: string;
    avatar?: string;
};

export type CommentType = {
    id: string;
    scanId?: string;
    user: UserType;
    date: string;
    content: string;
    repliesCount?: number;
    likesCount?: number;
    dislikesCount?: number;
    isLiked?: boolean;
    isDisliked?: boolean;
    isReply?: boolean
    parentId?: string | null;
    chapterNumber?: number
    createdAt?: string;
    updatedAt?: string
    replies?: CommentType[];
    scan?: {
        id: string;
        title: string;
        scanId: string;
        scanParentId?: string;
        imgUrl: string;
        scanPath: string;
    }
};

export type FavoriteScan = {
    id: string;
    scanId: string;
    scanParentId: string;
    scanPath: string;
    title: string;
    stars: number;
    imgUrl: string;
    userId: string;
    createdAt: string;
}

export type BookmarkScan = FavoriteScan;

export type RecentScan = {
    lastReadAt: string;
    chapterNumber: number;
    chapterName: string;
} & FavoriteScan;

export type UserScansData = {
    favourites: FavoriteScan[];
    bookmarks: BookmarkScan[];
    recents: RecentScan[];
};

export type SubscriptionStatus = "active" | "inactive";

export type Subscription = {
    id: string;
    userId: string;
    scanId: string;
    status: SubscriptionStatus;
    createdAt: Date;
    updatedAt: Date;
    scan?: {
        id: string;
        title: string;
        imgUrl: string;
        scanParentId: string;
        scanId: string;
        scanPath: string;
        latestChapter: string;
        lastChapterAt: string;
    };
}