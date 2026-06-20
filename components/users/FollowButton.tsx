'use client'

import { useState } from 'react'
import { toggleFollow } from '@/lib/actions/users'
import { UserPlus, UserMinus, Loader2 } from 'lucide-react'

export default function FollowButton({ 
  targetUserId, 
  initialIsFollowing 
}: { 
  targetUserId: string
  initialIsFollowing: boolean 
}) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    setLoading(true)
    const result = await toggleFollow(targetUserId)
    if (result.success) {
      setIsFollowing(result.isFollowing!)
    } else {
      console.error(result.error)
      alert(result.error || 'Something went wrong')
    }
    setLoading(false)
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`btn btn-sm ${isFollowing ? 'btn-secondary' : 'btn-primary'}`}
      style={{ minWidth: 120 }}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : isFollowing ? (
        <>
          <UserMinus size={16} />
          Unfollow
        </>
      ) : (
        <>
          <UserPlus size={16} />
          Follow
        </>
      )}
    </button>
  )
}
