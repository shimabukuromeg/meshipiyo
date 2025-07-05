'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Heart, User } from 'lucide-react'
import Image from 'next/image'

interface UserProfileProps {
  user: {
    id: string
    name: string
    displayName: string
    email: string
    iconImageURL?: string | null
    description?: string | null
  }
  likeCount: number
}

export const UserProfile = ({ user, likeCount }: UserProfileProps) => {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <Avatar className="w-20 h-20">
            {user.iconImageURL ? (
              <Image
                src={user.iconImageURL}
                alt={`${user.displayName}のアイコン`}
                width={80}
                height={80}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-gray-500" />
              </div>
            )}
          </Avatar>
        </div>
        <h1 className="text-2xl font-bold">{user.displayName}</h1>
        <p className="text-gray-600">{user.email}</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {user.description && (
          <div>
            <h3 className="font-semibold mb-2">自己紹介</h3>
            <p className="text-gray-700">{user.description}</p>
          </div>
        )}
        
        <div className="flex items-center justify-center gap-2 p-4 bg-red-50 rounded-lg">
          <Heart className="w-6 h-6 text-red-500 fill-red-500" />
          <div className="text-center">
            <p className="text-2xl font-bold text-red-500">{likeCount}</p>
            <p className="text-sm text-gray-600">いいね</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}