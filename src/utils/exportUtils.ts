import { format } from 'date-fns';
import { MeetingWithActions } from '@/services/meetingService';
import { ActionItem } from '@/services/actionItemService';

export const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes in CSV
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      }).join(',')
    )
  ].join('\n');

  downloadFile(csvContent, filename, 'text/csv');
};

export const exportMeetingsToCSV = (meetings: MeetingWithActions[]) => {
  const data = meetings.map(meeting => ({
    title: meeting.title,
    date: format(new Date(meeting.date), 'yyyy-MM-dd HH:mm'),
    description: meeting.description || '',
    status: meeting.status,
    actionItemsCount: meeting.actionItemsCount || 0,
    completedItemsCount: meeting.completedItemsCount || 0,
    createdAt: meeting.created_at ? format(new Date(meeting.created_at), 'yyyy-MM-dd HH:mm') : '',
  }));

  exportToCSV(data, `meetings-${format(new Date(), 'yyyy-MM-dd')}.csv`);
};

export const exportActionItemsToCSV = (actionItems: ActionItem[]) => {
  const data = actionItems.map(item => ({
    title: item.title,
    description: item.description || '',
    assignedTo: item.assigned_to || '',
    dueDate: item.due_date ? format(new Date(item.due_date), 'yyyy-MM-dd') : '',
    status: item.status,
    createdAt: item.created_at ? format(new Date(item.created_at), 'yyyy-MM-dd HH:mm') : '',
  }));

  exportToCSV(data, `action-items-${format(new Date(), 'yyyy-MM-dd')}.csv`);
};

export const exportMeetingReport = (
  meeting: MeetingWithActions, 
  actionItems: ActionItem[]
) => {
  const content = `
MEETING REPORT
==============

Title: ${meeting.title}
Date: ${format(new Date(meeting.date), 'PPPP')}
Status: ${meeting.status}
${meeting.description ? `\nDescription:\n${meeting.description}` : ''}

ACTION ITEMS (${actionItems.length})
============

${actionItems.length === 0 ? 'No action items for this meeting.' : 
  actionItems.map((item, index) => `
${index + 1}. ${item.title}
   Status: ${item.status}
   ${item.assigned_to ? `Assigned to: ${item.assigned_to}` : ''}
   ${item.due_date ? `Due: ${format(new Date(item.due_date), 'PPP')}` : ''}
   ${item.description ? `Description: ${item.description}` : ''}
`).join('\n')
}

Generated on: ${format(new Date(), 'PPPp')}
  `.trim();

  downloadFile(content, `meeting-report-${meeting.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${format(new Date(), 'yyyy-MM-dd')}.txt`, 'text/plain');
};

const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
