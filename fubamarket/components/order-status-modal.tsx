"use client"

import { useState } from "react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { formatUzsWithSpaces } from "@/lib/currency"

interface OrderStatusModalProps {
  isOpen: boolean
  onClose: () => void
  order: any
  onStatusUpdate: (orderId: number, newStatus: string) => Promise<void>
}

export function OrderStatusModal({ isOpen, onClose, order, onStatusUpdate }: OrderStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState(order?.status || "")
  const [loading, setLoading] = useState(false)

  const statusOptions = [
    { value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-800" },
    { value: "processing", label: "Processing", color: "bg-blue-100 text-blue-800" },
    { value: "shipped", label: "Shipped", color: "bg-purple-100 text-purple-800" },
    { value: "delivered", label: "Delivered", color: "bg-green-100 text-green-800" },
    { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-800" }
  ]

  const handleUpdateStatus = async () => {
    if (!order || selectedStatus === order.status) return

    setLoading(true)
    try {
      await onStatusUpdate(order.id, selectedStatus)
      onClose()
    } catch (error) {
      console.error("Error updating order status:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Update Order Status" size="md">
      <div className="space-y-6">
        {/* Order Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium mb-2">Order #{order?.public_id}</h3>
          <p className="text-sm text-gray-600">{order?.customer_name}</p>
          <p className="text-sm text-gray-600">{order ? formatUzsWithSpaces(parseFloat(order.total_amount)) : "0 so'm"}</p>
        </div>

        {/* Current Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Status
          </label>
          <Badge className="bg-gray-100 text-gray-800">
            {order?.status || "Unknown"}
          </Badge>
        </div>

        {/* New Status Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            New Status
          </label>
          <div className="space-y-2">
            {statusOptions.map((status) => (
              <label key={status.value} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value={status.value}
                  checked={selectedStatus === status.value}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <Badge className={status.color}>
                  {status.label}
                </Badge>
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateStatus}
            disabled={loading || selectedStatus === order?.status}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Update Status
          </Button>
        </div>
      </div>
    </Modal>
  )
}
