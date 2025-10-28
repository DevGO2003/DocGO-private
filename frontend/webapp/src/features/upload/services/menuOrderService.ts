import axios from 'axios'
import { MenuItem } from '../components/SortableMenu'

// Use Vite environment variables for frontend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

/**
 * Save menu order to User Management Service
 */
export async function saveMenuOrder(items: MenuItem[]): Promise<void> {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/v1/user-preferences/menu-order`,
      {
        menuItems: items.map((item, index) => ({
          id: item.id,
          label: item.label,
          order: index,
        })),
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (response.status !== 200 && response.status !== 201) {
      throw new Error(`Failed to save menu order: ${response.statusText}`)
    }

    console.log('[MenuOrderService] Menu order saved successfully')
  } catch (error) {
    console.error('[MenuOrderService] Error saving menu order:', error)
    throw error
  }
}

/**
 * Get menu order from User Management Service
 */
export async function getMenuOrder(): Promise<MenuItem[]> {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/v1/user-preferences/menu-order`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (response.status !== 200) {
      throw new Error(`Failed to get menu order: ${response.statusText}`)
    }

    return response.data.menuItems || []
  } catch (error) {
    console.error('[MenuOrderService] Error getting menu order:', error)
    return []
  }
}
