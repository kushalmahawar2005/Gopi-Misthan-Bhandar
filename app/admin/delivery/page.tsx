'use client';

import React, { useState, useEffect } from 'react';
import { 
  FiPackage, 
  FiTruck, 
  FiSearch, 
  FiInfo, 
  FiXCircle, 
  FiExternalLink, 
  FiRefreshCw, 
  FiClock,
  FiMapPin,
  FiCheckCircle,
  FiAlertCircle
} from 'react-icons/fi';
import Link from 'next/link';

interface Shipment {
  _id: string;
  orderNumber: string;
  shipping: {
    name: string;
    city: string;
    zipCode: string;
    phone: string;
  };
  total: number;
  status: string;
  awbNumber: string;
  courierName: string;
  shipmentStatus: string;
  trackingUrl: string;
  createdAt: string;
}

export default function ShippingManagementPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'shipped' | 'delivered'>('all');
  const [trackingLoading, setTrackingLoading] = useState<string | null>(null);
  const [trackingData, setTrackingData] = useState<any | null>(null);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchShipments();
  }, [activeTab]);

  const fetchShipments = async () => {
    setLoading(true);
    try {
      // Fetch orders that have shipments or are ready for shipment
      const res = await fetch('/api/orders');
      const data = await res.json();
      
      if (data.success) {
        // Filter orders based on activeTab
        let filtered = data.data.filter((order: any) => {
          if (activeTab === 'all') return true;
          if (activeTab === 'pending') return !order.awbNumber && (order.status === 'confirmed' || order.status === 'processing');
          if (activeTab === 'shipped') return !!order.awbNumber && order.status === 'shipped';
          if (activeTab === 'delivered') return order.status === 'delivered';
          return true;
        });

        // Sort by date - descending
        filtered.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        setShipments(filtered);
      }
    } catch (error) {
      console.error('Error fetching shipments:', error);
      setMessage({ type: 'error', text: 'Failed to load shipments' });
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = async (awb: string) => {
    setTrackingLoading(awb);
    try {
      const res = await fetch(`/api/delivery/track?awb=${awb}`);
      const data = await res.json();
      if (data.success) {
        setTrackingData(data.data);
        setShowTrackingModal(true);
      } else {
        setMessage({ type: 'error', text: data.message || 'Tracking failed' });
      }
    } catch (error) {
      console.error('Tracking error:', error);
      setMessage({ type: 'error', text: 'Tracking error' });
    } finally {
      setTrackingLoading(null);
    }
  };

  const handleCancel = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this shipment?')) return;
    
    setCancellingId(orderId);
    try {
      const res = await fetch('/api/delivery/cancel-shipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Shipment cancelled successfully' });
        fetchShipments();
      } else {
        setMessage({ type: 'error', text: data.message || 'Cancellation failed' });
      }
    } catch (error) {
      console.error('Cancellation error:', error);
      setMessage({ type: 'error', text: 'Cancellation error' });
    } finally {
      setCancellingId(null);
    }
  };

  const handleCreateShipment = async (orderId: string) => {
    setCancellingId(orderId); // reusing loading state
    try {
      const res = await fetch('/api/delivery/create-shipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Shipment created successfully!' });
        fetchShipments();
      } else {
        setMessage({ type: 'error', text: data.message || 'Creation failed' });
      }
    } catch (error) {
      console.error('Creation error:', error);
      setMessage({ type: 'error', text: 'Creation error' });
    } finally {
      setCancellingId(null);
    }
  };

  const filteredShipments = shipments.filter(s => 
    s.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.shipping.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.awbNumber && s.awbNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary-brown font-geom">Shipping Management</h1>
          <p className="text-gray-600 mt-1 font-geom flex items-center gap-2">
            <FiTruck className="text-primary-red" />
            Powered by NimbusPost
          </p>
        </div>
        <button 
          onClick={fetchShipments}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
        >
          <FiRefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-primary-red'
        }`}>
          {message.type === 'success' ? <FiCheckCircle /> : <FiAlertCircle />}
          <span className="text-sm font-medium">{message.text}</span>
          <button onClick={() => setMessage(null)} className="ml-auto hover:text-gray-500">
            <FiXCircle size={18} />
          </button>
        </div>
      )}

      {/* Filters and Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 w-full md:w-96">
            <FiSearch className="text-gray-400 mr-2" />
            <input 
              type="text" 
              placeholder="Search by Order #, Name or AWB..." 
              className="bg-transparent border-none focus:outline-none text-sm w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex bg-gray-100 p-1 rounded-lg">
            {(['all', 'pending', 'shipped', 'delivered'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-md text-xs font-bold capitalize transition-all ${
                  activeTab === tab 
                    ? 'bg-white text-primary-red shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Order / Date</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Awb / Courier</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-red"></div>
                      <p className="text-sm text-gray-500">Loading shipments...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredShipments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <p className="text-gray-500 italic">No shipments found for this category.</p>
                  </td>
                </tr>
              ) : (
                filteredShipments.map((shipment) => (
                  <tr key={shipment._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-primary-brown text-sm">{shipment.orderNumber}</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        {new Date(shipment.createdAt).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-700">{shipment.shipping.name}</div>
                      <div className="text-xs text-gray-500">{shipment.shipping.city}, {shipment.shipping.zipCode}</div>
                    </td>
                    <td className="px-6 py-4">
                      {shipment.awbNumber ? (
                        <>
                          <div className="text-sm font-mono text-primary-red font-bold font-general-sans">{shipment.awbNumber}</div>
                          <div className="text-xs text-gray-500">{shipment.courierName}</div>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Not Shipped</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-[10px] rounded-full font-bold uppercase tracking-wider ${
                        shipment.status === 'delivered' ? 'bg-green-100 text-green-700' :
                        shipment.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                        shipment.status === 'cancelled' ? 'bg-red-100 text-primary-red' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {shipment.status}
                      </span>
                      {shipment.awbNumber && (
                        <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                           <FiClock size={10} />
                           {shipment.shipmentStatus || 'Manifested'}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {shipment.awbNumber ? (
                          <>
                            <button
                              onClick={() => handleTrack(shipment.awbNumber)}
                              disabled={trackingLoading === shipment.awbNumber}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold"
                              title="Track Shipment"
                            >
                              {trackingLoading === shipment.awbNumber ? <FiRefreshCw className="animate-spin" /> : <FiInfo />}
                              Track
                            </button>
                            <button
                              onClick={() => handleCancel(shipment._id)}
                              disabled={cancellingId === shipment._id}
                              className="p-2 text-primary-red hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold"
                              title="Cancel Shipment"
                            >
                              {cancellingId === shipment._id ? <FiRefreshCw className="animate-spin" /> : <FiXCircle />}
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleCreateShipment(shipment._id)}
                            disabled={cancellingId === shipment._id}
                            className="bg-primary-red text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-primary-darkRed transition-colors flex items-center gap-1"
                          >
                            {cancellingId === shipment._id ? <FiRefreshCw className="animate-spin" /> : <FiPackage />}
                            Create Shipment
                          </button>
                        )}
                        <Link 
                          href={`/admin/orders/${shipment._id}`}
                          className="p-2 text-gray-400 hover:text-primary-brown transition-colors"
                          title="View Order Details"
                        >
                          <FiExternalLink />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tracking Modal */}
      {showTrackingModal && trackingData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-primary-red text-white">
              <div className="flex items-center gap-3">
                <FiTruck size={24} />
                <div>
                  <h3 className="font-bold text-lg font-geom">Tracking Details</h3>
                  <p className="text-xs opacity-80">{trackingData.currentStatus}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowTrackingModal(false)}
                className="p-2 hover:bg-white hover:bg-opacity-10 rounded-full transition-colors"
              >
                <FiXCircle size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400 text-xs">Current Location</p>
                    <p className="font-bold text-primary-brown flex items-center gap-1">
                      <FiMapPin className="text-primary-red" />
                      {trackingData.location || 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Estimated Delivery</p>
                    <p className="font-bold text-primary-brown">
                      {trackingData.estimatedDelivery || '--'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Shipment Journey</h4>
                {trackingData.timeline && trackingData.timeline.length > 0 ? (
                  <div className="space-y-6">
                    {trackingData.timeline.map((event: any, idx: number) => (
                      <div key={idx} className="relative pl-8">
                        {/* Timeline Line */}
                        {idx !== trackingData.timeline.length - 1 && (
                          <div className="absolute left-[11px] top-6 bottom-[-24px] w-0.5 bg-gray-200"></div>
                        )}
                        {/* Timeline Dot */}
                        <div className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center border-2 bg-white z-10 ${
                          idx === 0 ? 'border-primary-red' : 'border-gray-300'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-primary-red' : 'bg-gray-300'}`}></div>
                        </div>
                        
                        <div>
                          <p className={`text-sm font-bold ${idx === 0 ? 'text-primary-brown' : 'text-gray-600'}`}>
                            {event.status}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                             <FiMapPin size={12} /> {event.location}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-1">
                            {event.timestamp}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No detailed timeline available yet.</p>
                )}
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
               <button 
                  onClick={() => setShowTrackingModal(false)}
                  className="w-full bg-primary-brown text-white py-2 rounded-lg font-bold hover:bg-black transition-colors"
               >
                 Close Tracking
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
