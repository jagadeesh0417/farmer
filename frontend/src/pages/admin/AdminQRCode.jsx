import { useState, useEffect, useRef } from 'react'
import { api } from '../../lib/api'
import { toast } from 'react-toastify'

export default function AdminQRCode() {
  const [qrs, setQrs] = useState([])
  const [farmers, setFarmers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showGenerate, setShowGenerate] = useState(false)
  const [selectedFarmer, setSelectedFarmer] = useState('')
  const [label, setLabel] = useState('')
  const [generating, setGenerating] = useState(false)
  const canvasRef = useRef(null)

  const load = async () => {
    setLoading(true)
    try {
      const [qrData, farmerData] = await Promise.all([
        api.getQRCodes(),
        api.getAllFarmers({ limit: 200 }),
      ])
      setQrs(Array.isArray(qrData) ? qrData : [])
      setFarmers(farmerData.data || farmerData || [])
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleGenerate = async () => {
    if (!selectedFarmer) return toast.error('Select a farmer')
    setGenerating(true)
    try {
      await api.createQRCode({ farmerId: selectedFarmer, label })
      toast.success('QR code generated')
      setShowGenerate(false)
      setSelectedFarmer('')
      setLabel('')
      load()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setGenerating(false)
    }
  }

  const handleToggle = async (id, current) => {
    try {
      await api.updateQRCode(id, { isActive: !current })
      toast.success('QR toggled')
      load()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleRepoint = async (id) => {
    const farmerId = prompt('Enter new farmer ID to repoint this QR:')
    if (!farmerId) return
    try {
      await api.updateQRCode(id, { farmerId })
      toast.success('QR repointed')
      load()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this QR code? This cannot be undone.')) return
    try {
      await api.deleteQRCode(id)
      toast.success('QR deleted')
      load()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const downloadPNG = (qrImage, filename) => {
    const link = document.createElement('a')
    link.href = qrImage
    link.download = filename || 'qr-code.png'
    link.click()
  }

  const getFarmerName = (farmer) => {
    if (!farmer) return 'Unknown'
    return farmer.name || farmer._id || 'Unknown'
  }

  if (loading && qrs.length === 0) {
    return <div className="flex min-h-screen items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" /></div>
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">QR Codes</h1>
          <p className="text-sm text-slate-500 mt-1">Generate and manage traceability QR codes for farmer packaging</p>
        </div>
        <button onClick={() => setShowGenerate(true)} className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-700 transition">+ Generate QR</button>
      </div>

      {showGenerate && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm mb-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Generate New QR Code</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <select value={selectedFarmer} onChange={e => setSelectedFarmer(e.target.value)}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500">
              <option value="">Select a farmer...</option>
              {farmers.map(f => (
                <option key={f._id} value={f._id}>{f.name} — {f.village || f.district || ''}</option>
              ))}
            </select>
            <input value={label} onChange={e => setLabel(e.target.value)} placeholder="Label (e.g. Batch A – Turmeric 2025)"
              className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500" />
            <button onClick={handleGenerate} disabled={generating || !selectedFarmer}
              className="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-50">
              {generating ? 'Generating...' : 'Generate'}
            </button>
            <button onClick={() => setShowGenerate(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs text-slate-500 uppercase">
              <th className="p-3 font-medium">Code</th>
              <th className="p-3 font-medium">Farmer</th>
              <th className="p-3 font-medium">Label</th>
              <th className="p-3 font-medium">Scans</th>
              <th className="p-3 font-medium">Active</th>
              <th className="p-3 font-medium">Created</th>
              <th className="p-3 font-medium">QR</th>
              <th className="p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {qrs.map(qr => (
              <tr key={qr._id} className="border-b border-slate-50 hover:bg-slate-50/50">
                <td className="p-3 font-mono text-xs text-slate-700">{qr.code}</td>
                <td className="p-3 font-medium text-slate-900">{getFarmerName(qr.farmer)}</td>
                <td className="p-3 text-slate-600">{qr.label || '-'}</td>
                <td className="p-3 text-slate-600">{qr.scanCount || 0}</td>
                <td className="p-3">
                  <button onClick={() => handleToggle(qr._id, qr.isActive)}
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${qr.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {qr.isActive ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="p-3 text-slate-500 text-xs">{qr.createdAt ? new Date(qr.createdAt).toLocaleDateString() : '-'}</td>
                <td className="p-3">
                  {qr.qrImage && (
                    <div className="flex gap-1">
                      <button onClick={() => downloadPNG(qr.qrImage, `qr-${qr.code}.png`)}
                        className="text-xs font-semibold text-brand-600 hover:text-brand-700">PNG</button>
                    </div>
                  )}
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button onClick={() => handleRepoint(qr._id)} className="text-xs font-semibold text-blue-600 hover:text-blue-700">Repoint</button>
                    <button onClick={() => handleDelete(qr._id)} className="text-xs font-semibold text-red-600 hover:text-red-700">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {qrs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-lg font-medium text-slate-400 mb-1">No QR codes yet</p>
            <p className="text-sm text-slate-400">Click "Generate QR" to create the first one</p>
          </div>
        )}
      </div>
    </div>
  )
}
