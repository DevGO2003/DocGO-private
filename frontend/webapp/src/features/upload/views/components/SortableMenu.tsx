import React, { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { GripVertical, Save } from 'lucide-react'

export interface MenuItem {
  id: string
  label: string
  icon?: React.ReactNode
}

interface SortableMenuProps {
  items: MenuItem[]
  onSave: (items: MenuItem[]) => Promise<void>
  onItemClick?: (item: MenuItem) => void
}

export default function SortableMenu({ items, onSave, onItemClick }: SortableMenuProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(items)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setMenuItems(items)
  }, [items])

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result

    if (!destination) return
    if (source.index === destination.index) return

    const newItems = Array.from(menuItems)
    const [movedItem] = newItems.splice(source.index, 1)
    newItems.splice(destination.index, 0, movedItem)

    setMenuItems(newItems)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(menuItems)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to save menu order:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Menu</h3>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <GripVertical className="w-4 h-4" />
          {isEditing ? 'Done' : 'Sort'}
        </button>
      </div>

      {isEditing ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="menu-items">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`space-y-2 p-3 rounded-lg border-2 ${
                  snapshot.isDraggingOver ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-gray-50'
                }`}
              >
                {menuItems.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`flex items-center gap-3 p-3 bg-white rounded-lg border transition-all ${
                          snapshot.isDragging ? 'border-blue-500 shadow-lg' : 'border-gray-200'
                        }`}
                      >
                        <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                        <span className="text-sm text-gray-700 flex-1">{item.label}</span>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
        <div className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onItemClick?.(item)}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
              <span className="flex-1 text-left">{item.label}</span>
            </button>
          ))}
        </div>
      )}

      {isEditing && (
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full mt-3 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Save Order'}
        </button>
      )}
    </div>
  )
}
