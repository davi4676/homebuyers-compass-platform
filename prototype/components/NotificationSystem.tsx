'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, TrendingUp, Award, Sparkles, CheckCircle } from 'lucide-react'

export type NotificationType = 'level-up' | 'badge-unlock' | 'xp-earned' | 'streak' | 'achievement'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  icon?: React.ReactNode
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface NotificationSystemProps {
  notifications: Notification[]
  onRemove: (id: string) => void
}

export function NotificationSystem({ notifications, onRemove }: NotificationSystemProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      <AnimatePresence>
        {notifications.map((notification) => (
          <NotificationToast
            key={notification.id}
            notification={notification}
            onRemove={onRemove}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

function NotificationToast({
  notification,
  onRemove,
}: {
  notification: Notification
  onRemove: (id: string) => void
}) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const duration = notification.duration || 5000
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onRemove(notification.id), 300)
    }, duration)

    return () => clearTimeout(timer)
  }, [notification.id, notification.duration, onRemove])

  const getIcon = () => {
    if (notification.icon) return notification.icon

    switch (notification.type) {
      case 'level-up':
        return <TrendingUp className="w-6 h-6" />
      case 'badge-unlock':
        return <Award className="w-6 h-6" />
      case 'xp-earned':
        return <Sparkles className="w-6 h-6" />
      case 'streak':
        return <CheckCircle className="w-6 h-6" />
      default:
        return <Sparkles className="w-6 h-6" />
    }
  }

  const getBgColor = () => {
    switch (notification.type) {
      case 'level-up':
        return 'bg-gradient-to-r from-[#06b6d4] to-[#0891b2]'
      case 'badge-unlock':
        return 'bg-gradient-to-r from-yellow-500 to-orange-500'
      case 'xp-earned':
        return 'bg-gradient-to-r from-purple-500 to-pink-500'
      case 'streak':
        return 'bg-gradient-to-r from-orange-500 to-red-500'
      default:
        return 'bg-gray-800'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`${getBgColor()} rounded-lg shadow-xl p-4 min-w-[320px] max-w-md pointer-events-auto`}
    >
      <div className="flex items-start gap-3">
        <div className="text-white flex-shrink-0 mt-0.5">{getIcon()}</div>
        <div className="flex-1">
          <h3 className="font-bold text-white mb-1">{notification.title}</h3>
          <p className="text-white/90 text-sm">{notification.message}</p>
          {notification.action && (
            <button
              onClick={notification.action.onClick}
              className="mt-2 text-white/90 hover:text-white text-sm font-semibold underline"
            >
              {notification.action.label}
            </button>
          )}
        </div>
        <button
          onClick={() => {
            setIsVisible(false)
            setTimeout(() => onRemove(notification.id), 300)
          }}
          className="text-white/80 hover:text-white transition-colors flex-shrink-0"
        >
          <X size={18} />
        </button>
      </div>
    </motion.div>
  )
}

// Hook for managing notifications
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = `notification-${Date.now()}-${Math.random()}`
    setNotifications((prev) => [...prev, { ...notification, id }])
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const showLevelUp = useCallback((level: number) => {
    addNotification({
      type: 'level-up',
      title: 'Level Up!',
      message: `Congratulations! You've reached Level ${level}`,
      duration: 6000,
      action: {
        label: 'View Progress',
        onClick: () => window.location.href = '/customized-journey',
      },
    })
  }, [addNotification])

  const showBadgeUnlock = useCallback((badgeName: string) => {
    addNotification({
      type: 'badge-unlock',
      title: 'Badge Unlocked!',
      message: `You've earned the "${badgeName}" badge!`,
      duration: 6000,
      action: {
        label: 'View Badge',
        onClick: () => window.location.href = '/customized-journey',
      },
    })
  }, [addNotification])

  const showXpEarned = useCallback((xp: number, reason?: string) => {
    addNotification({
      type: 'xp-earned',
      title: `+${xp} XP Earned`,
      message: reason || 'Keep up the great work!',
      duration: 4000,
    })
  }, [addNotification])

  const showStreak = useCallback((days: number) => {
    addNotification({
      type: 'streak',
      title: 'Streak!',
      message: `${days} day streak! Keep it going! 🔥`,
      duration: 5000,
    })
  }, [addNotification])

  return {
    notifications,
    addNotification,
    removeNotification,
    showLevelUp,
    showBadgeUnlock,
    showXpEarned,
    showStreak,
  }
}
