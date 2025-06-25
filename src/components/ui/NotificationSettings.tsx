// @ts-nocheck
import React from 'react'
import { notificationService } from '@/services/shared/notification.service'
import { Switch } from './switch'
import { Label } from './label'

export const NotificationSettings: React.FC = () => {
  const soundEnabled = notificationService.isSoundEnabled()

  const handleSoundToggle = (checked: boolean) => {
    // TODO: Implement setSoundEnabled in notificationService
    console.log('Sound toggle:', checked)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="sound-toggle">Sound Notifications</Label>
        <Switch
          id="sound-toggle"
          checked={soundEnabled}
          onCheckedChange={handleSoundToggle}
        />
      </div>
    </div>
  )
}
