"use client"

import { useState } from "react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, CheckCircle, XCircle, DollarSign, User, Calendar } from "lucide-react"

interface WithdrawalProcessModalProps {
  isOpen: boolean
  onClose: () => void
  withdrawal: any
  onProcess: (withdrawalId: number, status: string, notes?: string) => Promise<void>
}

export function WithdrawalProcessModal({ isOpen, onClose, withdrawal, onProcess }: WithdrawalProcessModalProps) {
  const [selectedAction, setSelectedAction] = useState<'approved' | 'rejected' | ''>('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const handleProcess = async () => {
    if (!withdrawal || !selectedAction) return

    setLoading(true)
    try {
      await onProcess(withdrawal.id, selectedAction, notes)
      onClose()
      setSelectedAction('')
      setNotes('')
    } catch (error) {
      console.error("Error processing withdrawal:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Process Withdrawal Request" size="lg">
      <div className="space-y-6">
        {/* Withdrawal Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  ${withdrawal ? (parseFloat(withdrawal.amount) / 100).toFixed(2) : '0.00'}
                </h3>
                <p className="text-sm text-gray-600">Withdrawal Request #{withdrawal?.id}</p>
              </div>
            </div>
            <Badge className={getStatusColor(withdrawal?.status)}>
              {withdrawal?.status}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-gray-400" />
              <div>
                <p className="font-medium">
                  {withdrawal?.user_first_name} {withdrawal?.user_last_name}
                </p>
                <p className="text-sm text-gray-600">@{withdrawal?.user_name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <div>
                <p className="font-medium">
                  {withdrawal ? new Date(withdrawal.created_at).toLocaleDateString() : 'N/A'}
                </p>
                <p className="text-sm text-gray-600">Request Date</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bank Details */}
        <div>
          <h4 className="font-medium mb-2">Bank Details</h4>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm">{withdrawal?.bank_details || 'No bank details provided'}</p>
          </div>
        </div>

        {/* Current Notes */}
        {withdrawal?.notes && (
          <div>
            <h4 className="font-medium mb-2">Request Notes</h4>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm">{withdrawal.notes}</p>
            </div>
          </div>
        )}

        {/* Action Selection */}
        <div>
          <Label className="text-base font-medium">Action *</Label>
          <div className="mt-3 space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="action"
                value="approved"
                checked={selectedAction === 'approved'}
                onChange={(e) => setSelectedAction(e.target.value as 'approved')}
                className="text-green-600 focus:ring-green-500"
              />
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-600">Approve Withdrawal</span>
              </div>
            </label>
            
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="action"
                value="rejected"
                checked={selectedAction === 'rejected'}
                onChange={(e) => setSelectedAction(e.target.value as 'rejected')}
                className="text-red-600 focus:ring-red-500"
              />
              <div className="flex items-center space-x-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="font-medium text-red-600">Reject Withdrawal</span>
              </div>
            </label>
          </div>
        </div>

        {/* Processing Notes */}
        <div>
          <Label htmlFor="notes">Processing Notes (Optional)</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about this decision..."
            rows={3}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleProcess}
            disabled={loading || !selectedAction}
            className={selectedAction === 'approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {selectedAction === 'approved' ? 'Approve' : selectedAction === 'rejected' ? 'Reject' : 'Process'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
