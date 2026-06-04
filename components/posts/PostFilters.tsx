'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, X, Plus, CircleDot, Package } from 'lucide-react'
import { CATEGORIES } from '@/lib/constants'

interface PostFiltersProps {
  onFilterChange: (filters: {
    type?: 'lost' | 'found'
    category?: string
    search?: string
  }) => void
}

export default function PostFilters({ onFilterChange }: PostFiltersProps) {
  const [activeType, setActiveType] = useState<'all' | 'lost' | 'found'>('all')
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [showCreateMenu, setShowCreateMenu] = useState(false)

  const handleTypeChange = (type: 'all' | 'lost' | 'found') => {
    setActiveType(type)
    onFilterChange({
      type: type === 'all' ? undefined : type,
      category: activeCategory === 'All' ? undefined : activeCategory,
      search: searchQuery || undefined,
    })
  }

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category)
    onFilterChange({
      type: activeType === 'all' ? undefined : activeType,
      category: category === 'All' ? undefined : category,
      search: searchQuery || undefined,
    })
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    onFilterChange({
      type: activeType === 'all' ? undefined : activeType,
      category: activeCategory === 'All' ? undefined : activeCategory,
      search: query || undefined,
    })
  }

  return (
    <div className="feed-filter-wrap">
      <div className="container">
        <div className="feed-filter-row">
          <div className="feed-filter-type">
            {(['all', 'lost', 'found'] as const).map((type) => (
              <button
                key={type}
                onClick={() => handleTypeChange(type)}
                className={`filter-pill ${activeType === type ? 'active' : ''}`}
              >
                {type === 'all' ? 'All' : type === 'lost' ? 'Lost' : 'Found'}
              </button>
            ))}
          </div>

          <div className="feed-filter-actions">
            <div className="feed-create-wrap">
              <button
                type="button"
                onClick={() => setShowCreateMenu((prev) => !prev)}
                className="btn btn-sm search-toggle create-toggle"
                aria-label={showCreateMenu ? 'Close create menu' : 'Open create menu'}
              >
                <Plus size={16} />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowSearch(!showSearch)}
              className="btn btn-ghost btn-sm search-toggle"
              aria-label={showSearch ? 'Hide search' : 'Show search'}
            >
              {showSearch ? <X size={16} /> : <Search size={16} />}
            </button>
          </div>
        </div>

        {showCreateMenu && (
          <div className="feed-create-inline-row animate-scale-in">
            <Link href="/post/new?type=lost" className="feed-create-action" onClick={() => setShowCreateMenu(false)}>
              <CircleDot size={14} />
              New Lost
            </Link>
            <Link href="/post/new?type=found" className="feed-create-action" onClick={() => setShowCreateMenu(false)}>
              <Package size={14} />
              New Found
            </Link>
          </div>
        )}

        {showSearch && (
          <div className="animate-slide-up" style={{ marginBottom: 8 }}>
            <input
              type="text"
              className="input"
              placeholder="Search for items..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              autoFocus
            />
          </div>
        )}

        <div className="feed-category-row">
          <button
            onClick={() => handleCategoryChange('All')}
            className={`chip-btn ${activeCategory === 'All' ? 'active' : ''}`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => handleCategoryChange(cat.value)}
              className={`chip-btn ${activeCategory === cat.value ? 'active' : ''}`}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
