'use client'

import React from 'react'
import { cn } from '../../lib/utils'
import anime from 'animejs/lib/anime.es.js';
import { useEffect } from 'react';

interface LoadingSkeletonProps {
  className?: string
  children?: React.ReactNode
}

export function LoadingSkeleton({ className, children }: LoadingSkeletonProps) {
  useEffect(() => {
    const elements = document.querySelectorAll('.skeleton-element');
    anime({
      targets: elements,
      scale: [0.95, 1.05],
      duration: 2000,
      loop: true,
      easing: 'easeInOutQuad',
      direction: 'alternate'
    });
  }, []);

  return (
    <div className={cn('bg-gray-200 rounded relative overflow-hidden', className)}>
      <div className="animate-pulse absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform -translate-x-full" style={{ animation: 'shimmer 1.5s infinite' }} />
      {children}
    </div>
  )
}

// Card skeleton component
interface CardSkeletonProps {
  className?: string
  showAvatar?: boolean
  lines?: number
}

export function CardSkeleton({ 
  className, 
  showAvatar = false, 
  lines = 3 
}: CardSkeletonProps) {
  useEffect(() => {
    const skeletonLines = document.querySelectorAll('.card-skeleton-line');
    anime.timeline({
      easing: 'easeOutExpo',
      duration: 600
    })
    .add({
      targets: '.card-avatar',
      scale: [0, 1],
      duration: 400,
      offset: 0
    })
    .add({
      targets: skeletonLines,
      translateY: [-20, 0],
      opacity: [0, 1],
      delay: anime.stagger(100),
      duration: 400
    }, '-=200');
  }, [lines]);

  return (
    <div className={cn('bg-white rounded-lg p-6 shadow-sm border border-gray-200 relative overflow-hidden', className)}>
      <div className="animate-pulse">
        {showAvatar && (
          <div className="flex items-center space-x-4 mb-4">
            <div className="card-avatar bg-gray-200 h-10 w-10 rounded-full skeleton-element"></div>
            <div className="flex-1">
              <div className="bg-gray-200 h-4 w-3/4 rounded mb-2 skeleton-element"></div>
              <div className="bg-gray-200 h-3 w-1/2 rounded skeleton-element"></div>
            </div>
          </div>
        )}
        
        <div className="space-y-3">
          {Array.from({ length: lines }).map((_, i) => (
            <div 
              key={i} 
              className="card-skeleton-line bg-gray-200 h-4 rounded skeleton-element" 
              style={{ 
                width: i === lines - 1 ? '60%' : '100%' 
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Table skeleton component
interface TableSkeletonProps {
  rows?: number
  columns?: number
  className?: string
}

export function TableSkeleton({ 
  rows = 5, 
  columns = 4, 
  className 
}: TableSkeletonProps) {
  useEffect(() => {
    const headerCells = document.querySelectorAll('.table-header-cell');
    const rowCells = document.querySelectorAll('.table-row-cell');
    
    anime({
      targets: headerCells,
      translateX: [-30, 0],
      opacity: [0, 1],
      duration: 600,
      delay: anime.stagger(100)
    });

    anime({
      targets: rowCells,
      translateX: [-30, 0],
      opacity: [0, 1],
      duration: 600,
      delay: anime.stagger(50),
      loop: true,
      direction: 'alternate'
    });
  }, [rows, columns]);

  return (
    <div className={cn('overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg', className)}>
      <div className="bg-gray-50 px-6 py-3">
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="table-header-cell bg-gray-200 h-4 rounded skeleton-element"></div>
          ))}
        </div>
      </div>
      <div className="bg-white divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4">
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div key={colIndex} className="table-row-cell bg-gray-200 h-4 rounded skeleton-element"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// List skeleton component
interface ListSkeletonProps {
  items?: number
  className?: string
}

export function ListSkeleton({ items = 5, className }: ListSkeletonProps) {
  useEffect(() => {
    const listItems = document.querySelectorAll('.list-skeleton-item');
    anime({
      targets: listItems,
      scaleY: [0, 1],
      opacity: [0, 1],
      delay: anime.stagger(150),
      duration: 500,
      easing: 'easeOutQuart'
    });
  }, [items]);

  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="list-skeleton-item flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-200">
          <div className="bg-gray-200 h-10 w-10 rounded-full skeleton-element"></div>
          <div className="flex-1">
            <div className="bg-gray-200 h-4 w-3/4 rounded mb-2 skeleton-element"></div>
            <div className="bg-gray-200 h-3 w-1/2 rounded skeleton-element"></div>
          </div>
          <div className="bg-gray-200 h-3 w-16 rounded skeleton-element"></div>
        </div>
      ))}
    </div>
  )
}

// Stats skeleton component
interface StatsSkeletonProps {
  cards?: number
  className?: string
}

export function StatsSkeleton({ cards = 4, className }: StatsSkeletonProps) {
  useEffect(() => {
    const statCards = document.querySelectorAll('.stat-skeleton-card');
    anime({
      targets: statCards,
      rotateY: [90, 0],
      opacity: [0, 1],
      duration: 800,
      delay: anime.stagger(200),
      easing: 'easeOutBack'
    });
  }, [cards]);

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6', className)}>
      {Array.from({ length: cards }).map((_, i) => (
        <div key={i} className="stat-skeleton-card bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="animate-pulse">
            <div className="bg-gray-200 h-4 w-20 rounded mb-2 skeleton-element"></div>
            <div className="bg-gray-200 h-8 w-16 rounded mb-2 skeleton-element"></div>
            <div className="bg-gray-200 h-3 w-24 rounded skeleton-element"></div>
          </div>
        </div>
      ))}
    </div>
  )
}
