import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, Clock, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { actionItemService, ActionItem } from '@/services/actionItemService';
import { format, isAfter, isBefore, addDays, parseISO } from 'date-fns';

interface NotificationItem {
  id: string;
  type: 'overdue' | 'due-soon' | 'due-today';
  title: string;
  description: string;
  actionItem: ActionItem;
}

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const { data: actionItems = [] } = useQuery({
    queryKey: ['actionItems'],
    queryFn: actionItemService.getActionItems,
  });

  useEffect(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = addDays(today, 1);
    const nextWeek = addDays(today, 7);

    const newNotifications: NotificationItem[] = [];

    actionItems
      .filter(item => item.status !== 'completed' && item.due_date)
      .forEach(item => {
        const dueDate = parseISO(item.due_date!);
        const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());

        if (isBefore(dueDateOnly, today)) {
          // Overdue
          newNotifications.push({
            id: `overdue-${item.id}`,
            type: 'overdue',
            title: 'Overdue Action Item',
            description: `"${item.title}" was due ${format(dueDate, 'MMM dd, yyyy')}`,
            actionItem: item,
          });
        } else if (dueDateOnly.getTime() === today.getTime()) {
          // Due today
          newNotifications.push({
            id: `due-today-${item.id}`,
            type: 'due-today',
            title: 'Due Today',
            description: `"${item.title}" is due today`,
            actionItem: item,
          });
        } else if (isBefore(dueDateOnly, nextWeek)) {
          // Due soon (within a week)
          newNotifications.push({
            id: `due-soon-${item.id}`,
            type: 'due-soon',
            title: 'Due Soon',
            description: `"${item.title}" is due ${format(dueDate, 'MMM dd, yyyy')}`,
            actionItem: item,
          });
        }
      });

    setNotifications(newNotifications);
  }, [actionItems]);

  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'overdue':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'due-today':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'due-soon':
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getNotificationColor = (type: NotificationItem['type']) => {
    switch (type) {
      case 'overdue':
        return 'border-l-red-500 bg-red-50';
      case 'due-today':
        return 'border-l-orange-500 bg-orange-50';
      case 'due-soon':
        return 'border-l-yellow-500 bg-yellow-50';
    }
  };

  const overdueCount = notifications.filter(n => n.type === 'overdue').length;
  const dueTodayCount = notifications.filter(n => n.type === 'due-today').length;
  const totalCount = overdueCount + dueTodayCount;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {totalCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {totalCount > 9 ? '9+' : totalCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Notifications</h4>
            {notifications.length > 0 && (
              <Badge variant="secondary">{notifications.length}</Badge>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No notifications</p>
            </div>
          ) : (
            <ScrollArea className="h-80">
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border-l-4 ${getNotificationColor(notification.type)}`}
                  >
                    <div className="flex items-start gap-3">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {notification.description}
                        </p>
                        {notification.actionItem.assigned_to && (
                          <p className="text-xs text-gray-500 mt-1">
                            Assigned to: {notification.actionItem.assigned_to}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
