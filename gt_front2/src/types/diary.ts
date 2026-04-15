export type DiaryStatus = "unread" | "edited" | "read"

export interface IDiary {
    id: string;
    entry: string;
    date: string;
    tags: IDiaryTag[];
    status: DiaryStatus;
}

export interface IDiaryTag {
    id: string;
    text: string;
    sort_no: number;
}