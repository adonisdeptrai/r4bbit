/**
 * Status Display Utility
 * Converts database status values to user-friendly display text
 */

export const statusDisplayMap: Record<string, { label: string; color: string }> = {
    pending: {
        label: 'Pending',
        color: 'yellow'
    },
    pending_verification: {
        label: 'Pending Verification',
        color: 'orange'
    },
    processing: {
        label: 'Processing',
        color: 'blue'
    },
    paid: {
        label: 'Paid',
        color: 'green'
    },
    completed: {
        label: 'Completed',
        color: 'green'
    },
    refunded: {
        label: 'Refunded',
        color: 'gray'
    },
    failed: {
        label: 'Failed',
        color: 'red'
    }
};

/**
 * Get display text for order status
 */
export function getStatusDisplay(status: string): string {
    return statusDisplayMap[status]?.label || status;
}

/**
 * Get color for order status badge
 */
export function getStatusColor(status: string): string {
    return statusDisplayMap[status]?.color || 'gray';
}
