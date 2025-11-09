'use client';

import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiMapPin, FiTruck, FiSave, FiX } from 'react-icons/fi';

interface DeliveryZone {
  _id?: string;
  name: string;
  pincodes: string[] | string;
  zone: 'local' | 'nearby' | 'distant' | 'remote';
  baseCharge: number;
  minOrderForFree: number;
  estimatedDays: number;
  isActive: boolean;
}

export default function DeliveryManagementPage() {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);
  const [formData, setFormData] = useState<DeliveryZone>({
    name: '',
    pincodes: [],
    zone: 'local',
    baseCharge: 0,
    minOrderForFree: 500,
    estimatedDays: 1,
    isActive: true,
  });
  const [pincodeInput, setPincodeInput] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadZones();
  }, []);

  const loadZones = async () => {
    try {
      // For now, we'll use the default zones from lib/delivery.ts
      // In production, you'd fetch from API
      const defaultZones: DeliveryZone[] = [
        {
          name: 'Local (Neemuch)',
          pincodes: ['458441', '458001', '458002', '458003'],
          zone: 'local',
          baseCharge: 0,
          minOrderForFree: 500,
          estimatedDays: 1,
          isActive: true,
        },
        {
          name: 'Nearby Areas',
          pincodes: ['458004', '458005', '458010', '458020', '458030'],
          zone: 'nearby',
          baseCharge: 30,
          minOrderForFree: 1000,
          estimatedDays: 2,
          isActive: true,
        },
        {
          name: 'Distant Areas',
          pincodes: '450001-450050',
          zone: 'distant',
          baseCharge: 80,
          minOrderForFree: 2000,
          estimatedDays: 3,
          isActive: true,
        },
        {
          name: 'Remote Areas',
          pincodes: 'all',
          zone: 'remote',
          baseCharge: 150,
          minOrderForFree: 5000,
          estimatedDays: 5,
          isActive: true,
        },
      ];
      setZones(defaultZones);
    } catch (error) {
      console.error('Error loading zones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPincode = () => {
    if (!pincodeInput.trim() || !/^\d{6}$/.test(pincodeInput.trim())) {
      setMessage({ type: 'error', text: 'Please enter a valid 6-digit pincode' });
      return;
    }

    const pincodes = Array.isArray(formData.pincodes) ? formData.pincodes : [];
    if (!pincodes.includes(pincodeInput.trim())) {
      setFormData({
        ...formData,
        pincodes: [...pincodes, pincodeInput.trim()],
      });
      setPincodeInput('');
    }
  };

  const handleRemovePincode = (pincode: string) => {
    if (Array.isArray(formData.pincodes)) {
      setFormData({
        ...formData,
        pincodes: formData.pincodes.filter(p => p !== pincode),
      });
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.zone) {
      setMessage({ type: 'error', text: 'Please fill all required fields' });
      return;
    }

    try {
      // In production, save to API
      // For now, update local state
      if (editingZone) {
        setZones(zones.map(z => z._id === editingZone._id ? { ...formData, _id: editingZone._id } : z));
        setMessage({ type: 'success', text: 'Delivery zone updated successfully!' });
      } else {
        setZones([...zones, { ...formData, _id: Date.now().toString() }]);
        setMessage({ type: 'success', text: 'Delivery zone added successfully!' });
      }
      
      setShowForm(false);
      setEditingZone(null);
      setFormData({
        name: '',
        pincodes: [],
        zone: 'local',
        baseCharge: 0,
        minOrderForFree: 500,
        estimatedDays: 1,
        isActive: true,
      });
      setPincodeInput('');
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Error saving zone' });
    }
  };

  const handleEdit = (zone: DeliveryZone) => {
    setEditingZone(zone);
    setFormData(zone);
    setShowForm(true);
  };

  const handleDelete = (zoneId: string | undefined) => {
    if (!zoneId) return;
    if (confirm('Are you sure you want to delete this delivery zone?')) {
      setZones(zones.filter(z => z._id !== zoneId));
      setMessage({ type: 'success', text: 'Delivery zone deleted successfully!' });
    }
  };

  const getZoneColor = (zone: string) => {
    switch (zone) {
      case 'local':
        return 'bg-green-100 text-green-800';
      case 'nearby':
        return 'bg-blue-100 text-blue-800';
      case 'distant':
        return 'bg-yellow-100 text-yellow-800';
      case 'remote':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-red mx-auto mb-4"></div>
          <p className="text-gray-600">Loading delivery zones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-brown font-serif">Delivery Management</h1>
          <p className="text-gray-600 mt-1">Manage delivery zones and charges</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingZone(null);
            setFormData({
              name: '',
              pincodes: [],
              zone: 'local',
              baseCharge: 0,
              minOrderForFree: 500,
              estimatedDays: 1,
              isActive: true,
            });
          }}
          className="flex items-center gap-2 px-6 py-3 bg-primary-red text-white rounded-lg font-bold hover:bg-primary-darkRed transition-colors"
        >
          <FiPlus size={18} />
          Add Delivery Zone
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold font-serif">
              {editingZone ? 'Edit Delivery Zone' : 'Add New Delivery Zone'}
            </h2>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingZone(null);
                setFormData({
                  name: '',
                  pincodes: [],
                  zone: 'local',
                  baseCharge: 0,
                  minOrderForFree: 500,
                  estimatedDays: 1,
                  isActive: true,
                });
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <FiX size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zone Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
                placeholder="e.g., Local (Neemuch)"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zone Type *
                </label>
                <select
                  value={formData.zone}
                  onChange={(e) => setFormData({ ...formData, zone: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
                >
                  <option value="local">Local</option>
                  <option value="nearby">Nearby</option>
                  <option value="distant">Distant</option>
                  <option value="remote">Remote</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Base Delivery Charge (₹) *
                </label>
                <input
                  type="number"
                  value={formData.baseCharge}
                  onChange={(e) => setFormData({ ...formData, baseCharge: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
                  min="0"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Free Delivery Above (₹) *
                </label>
                <input
                  type="number"
                  value={formData.minOrderForFree}
                  onChange={(e) => setFormData({ ...formData, minOrderForFree: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Delivery Days *
                </label>
                <input
                  type="number"
                  value={formData.estimatedDays}
                  onChange={(e) => setFormData({ ...formData, estimatedDays: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
                  min="1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pincodes
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={pincodeInput}
                  onChange={(e) => setPincodeInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddPincode()}
                  placeholder="Enter 6-digit pincode"
                  maxLength={6}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
                />
                <button
                  onClick={handleAddPincode}
                  className="px-4 py-2 bg-primary-red text-white rounded-lg hover:bg-primary-darkRed transition-colors"
                >
                  Add
                </button>
              </div>
              
              {Array.isArray(formData.pincodes) && formData.pincodes.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.pincodes.map((pincode) => (
                    <span
                      key={pincode}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm"
                    >
                      {pincode}
                      <button
                        onClick={() => handleRemovePincode(pincode)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FiX size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={formData.pincodes === 'all'}
                    onChange={() => setFormData({ ...formData, pincodes: 'all' })}
                    className="w-4 h-4 text-primary-red"
                  />
                  <span className="text-sm text-gray-700">All Pincodes (Default for unmatched)</span>
                </label>
                <label className="flex items-center gap-2 mt-2">
                  <input
                    type="radio"
                    checked={formData.pincodes !== 'all' && Array.isArray(formData.pincodes)}
                    onChange={() => setFormData({ ...formData, pincodes: [] })}
                    className="w-4 h-4 text-primary-red"
                  />
                  <span className="text-sm text-gray-700">Specific Pincodes</span>
                </label>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-primary-red rounded"
              />
              <label className="text-sm text-gray-700">Active</label>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-2 bg-primary-red text-white rounded-lg font-bold hover:bg-primary-darkRed transition-colors"
              >
                <FiSave size={18} />
                {editingZone ? 'Update Zone' : 'Save Zone'}
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingZone(null);
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Zones List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Zone Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pincodes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Base Charge</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Free Above</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Est. Days</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {zones.map((zone, index) => (
                <tr key={zone._id || index} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-primary-brown">{zone.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full capitalize ${getZoneColor(zone.zone)}`}>
                      {zone.zone}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">
                      {zone.pincodes === 'all' ? (
                        <span className="text-gray-500">All Pincodes</span>
                      ) : Array.isArray(zone.pincodes) ? (
                        <div className="flex flex-wrap gap-1">
                          {zone.pincodes.slice(0, 3).map((p) => (
                            <span key={p} className="px-2 py-1 bg-gray-100 rounded text-xs">{p}</span>
                          ))}
                          {zone.pincodes.length > 3 && (
                            <span className="text-xs text-gray-500">+{zone.pincodes.length - 3} more</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs">{zone.pincodes}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold">₹{zone.baseCharge}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm">₹{zone.minOrderForFree.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm">{zone.estimatedDays} day(s)</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      zone.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {zone.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(zone)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <FiEdit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(zone._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-bold font-serif mb-3 flex items-center gap-2">
          <FiMapPin className="text-blue-600" />
          Delivery Zone Information
        </h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p><strong>Local:</strong> Same city/town - Fastest delivery, lowest charges</p>
          <p><strong>Nearby:</strong> Adjacent areas - Moderate delivery time and charges</p>
          <p><strong>Distant:</strong> Far areas - Longer delivery time, higher charges</p>
          <p><strong>Remote:</strong> Very far areas - Longest delivery time, highest charges</p>
        </div>
      </div>
    </div>
  );
}

