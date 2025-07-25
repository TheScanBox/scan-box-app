import { formatDistanceToNow, format, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';

export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();

    const daysDiff = differenceInDays(now, date);

    // If less than 7 days ago → use "x time ago"
    if (daysDiff < 7) {
        return formatDistanceToNow(date, { addSuffix: true, locale: fr });
    }

    // If older than 7 days → use "May 21, 2023"
    return format(date, 'MMMM d, yyyy');
}
