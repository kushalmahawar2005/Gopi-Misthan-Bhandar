'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { FiEye, FiPrinter } from 'react-icons/fi';
import Link from 'next/link';

interface Order {
  _id: string;
  orderNumber: string;
  userId?: string;
  items: any[];
  shipping: any;
  total: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  awbNumber?: string;
  courierName?: string;
  shipmentStatus?: string;
  trackingUrl?: string;
}

import { FiTruck, FiRefreshCw, FiCopy, FiX, FiTrash2 } from 'react-icons/fi';
import Pagination from '@/components/admin/Pagination';
import TableSkeleton from '@/components/admin/TableSkeleton';

const ITEMS_PER_PAGE = 10;

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  // Tracking Modal State
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [trackingInfo, setTrackingInfo] = useState<any>(null);
  const [loadingTracking, setLoadingTracking] = useState(false);

  const [autoPrintEnabled, setAutoPrintEnabled] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState(Date.now());
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);



  const handleTrackOrder = async (awb: string) => {
    setLoadingTracking(true);
    setShowTrackModal(true);
    setTrackingInfo(null);
    try {
      const resp = await fetch(`/api/delivery/track?awb=${awb}`);
      const data = await resp.json();
      if (data.success) {
        setTrackingInfo(data.data);
      } else {
        alert(data.message);
        setShowTrackModal(false);
      }
    } catch (e) {
      console.error(e);
      alert('Failed to fetch tracking info');
      setShowTrackModal(false);
    } finally {
      setLoadingTracking(false);
    }
  };

  const handleCancelShipment = async (orderId: string) => {
    if (!confirm('Are you sure you want to CANCEL this shipment? This cannot be undone.')) return;
    setIsProcessing(orderId);
    try {
      const resp = await fetch('/api/delivery/cancel-shipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      });
      const data = await resp.json();
      if (data.success) {
        alert('Shipment cancelled successfully');
        fetchOrders();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (e) {
      console.error(e);
      alert('Failed to cancel shipment');
    } finally {
      setIsProcessing(null);
    }
  };

  useEffect(() => {
    // Initialize audio
    audioRef.current = new Audio('/notification.mp3'); // You'll need to add this file

    fetchOrders();

    // Poll for new orders every 30 seconds
    const interval = setInterval(() => {
      checkForNewOrders();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const checkForNewOrders = async () => {
    try {
      // Fetch only orders created after last check
      const response = await fetch(`/api/orders?status=pending`);
      const data = await response.json();

      if (data.success && data.data.length > 0) {
        const newOrders = data.data.filter((o: Order) => new Date(o.createdAt).getTime() > lastCheckTime);

        if (newOrders.length > 0) {
          // Play sound
          if (audioRef.current) {
            audioRef.current.play().catch(() => {});
          }

          // Update list
          fetchOrders();
          setLastCheckTime(Date.now());

          // Auto print if enabled
          if (autoPrintEnabled) {
            newOrders.forEach((order: Order) => {
              window.open(`/admin/orders/${order._id}/print`, '_blank');
            });
          }
        }
      }
    } catch (error) {
      console.error('Error polling orders:', error);
    }
  };

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  // Fetch orders when page or filter changes
  const fetchOrders = useCallback(async () => {
    try {
      setPageLoading(true);
      const params = new URLSearchParams();
      params.set('page', String(currentPage));
      params.set('limit', String(ITEMS_PER_PAGE));
      if (statusFilter !== 'all') {
        params.set('status', statusFilter);
      }

      const response = await fetch(`/api/orders?${params.toString()}`);
      const data = await response.json();
      if (data.success) {
        setOrders(data.data);
        setTotalOrders(data.totalOrders || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
      setPageLoading(false);
    }
  }, [currentPage, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Scroll to top of table on page change
  useEffect(() => {
    if (!loading && tableRef.current) {
      tableRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();
      if (data.success) fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';

      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-primary-red border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-red mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" ref={tableRef}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-brown font-general-sansal-sansal-sans">
            Orders
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Manage customer orders
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Auto-print Toggle */}
          <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 border rounded-lg hover:bg-gray-50 transition-colors">
            <input
              type="checkbox"
              checked={autoPrintEnabled}
              onChange={(e) => setAutoPrintEnabled(e.target.checked)}
              className="w-4 h-4 text-primary-red rounded focus:ring-primary-red"
            />
            <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <FiPrinter className={autoPrintEnabled ? "text-green-600" : "text-gray-400"} />
              <span className="hidden sm:inline">Auto-Print Orders</span>
              <span className="sm:hidden">Auto-Print</span>
            </span>
          </label>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red bg-white text-sm w-full sm:w-auto"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed (Paid)</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>

          </select>
        </div>
      </div>

      {/* Loading Skeleton for page transitions */}
      {pageLoading ? (
        <TableSkeleton columns={8} rows={ITEMS_PER_PAGE} />
      ) : (
        <>
          {/* Orders Table - Desktop */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Order Number
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">
                      Payment
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Shipping Info
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        No orders found
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr
                        key={order._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-primary-brown">
                            {order.orderNumber}
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-primary-brown">
                              {order.shipping.name}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-500">
                              {order.shipping.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-primary-brown">
                            {order.items.length} items
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-primary-brown">
                            ₹{order.total.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          <select
                            value={order.status}
                            onChange={(e) =>
                              updateOrderStatus(order._id, e.target.value)
                            }
                            className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                              order.status
                            )} focus:outline-none focus:ring-2 focus:ring-primary-red`}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                          <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase ${
                            order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                            order.paymentStatus === 'failed' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {order.paymentStatus || 'pending'}
                          </span>
                        </td>

                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          {!order.awbNumber && (
                            <div className="text-[10px] text-gray-400 italic">
                              Manage via Delivery Section
                            </div>
                          )}
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          <Link
                            href={`/admin/orders/${order._id}`}
                            className="p-2 text-primary-red hover:bg-red-50 rounded transition-colors inline-block"
                            title="View Order"
                          >
                            <FiEye size={16} />
                          </Link>
                          <Link
                            href={`/admin/orders/${order._id}/print`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-[#F88E0C] hover:bg-orange-50 rounded transition-colors inline-block ml-2"
                            title="Print Receipt"
                          >
                            <FiPrinter size={16} />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div> {/* ✅ desktop wrapper properly closed */}

          {/* Orders Cards - Mobile */}
          <div className="block md:hidden w-full min-h-[200px]">
            {orders.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200 w-full">
                <p className="text-gray-500">No orders found</p>
              </div>
            ) : (
              <div className="space-y-4 w-full">
                {orders.map((order) => (
                  <div
                    key={order._id}
                    className="bg-white rounded-lg border border-gray-200 p-4 w-full"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-primary-brown truncate">
                          {order.orderNumber}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {order.shipping.name}
                        </p>
                        <p className="text-xs text-gray-400 mt-1 truncate">
                          {order.shipping.email}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/orders/${order._id}`}
                          className="p-2 text-[#F88E0C] hover:bg-orange-50 rounded transition-colors flex-shrink-0"
                          title="View Order"
                        >
                          <FiEye size={18} />
                        </Link>
                        <Link
                          href={`/admin/orders/${order._id}/print`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                          title="Print Receipt"
                        >
                          <FiPrinter size={18} />
                        </Link>
                      </div>
                    </div>
                    <div className="space-y-2 pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Items:</span>
                        <span className="font-medium text-primary-brown">
                          {order.items.length} items
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Total:</span>
                        <span className="font-medium text-primary-brown">
                          ₹{order.total.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Payment:</span>
                        <span className="text-gray-700 uppercase">
                          {order.paymentMethod}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Date:</span>
                        <span className="text-gray-700">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="pt-2">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            updateOrderStatus(order._id, e.target.value)
                          }
                          className={`w-full px-3 py-2 rounded-lg text-xs font-medium border ${getStatusColor(
                            order.status
                          )} focus:outline-none focus:ring-2 focus:ring-primary-red`}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>

                      {order.awbNumber && (
                        <div className="pt-2">
                           <button 
                            onClick={() => handleCancelShipment(order._id)}
                            disabled={isProcessing === order._id}
                            className="w-full py-2 border border-red-200 text-red-600 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-red-50"
                          >
                            <FiTrash2 size={14} /> {isProcessing === order._id ? 'Processing...' : 'Cancel Shipment'}
                          </button>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm py-1">
                        <span className="text-gray-600">Payment Status:</span>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                          order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                          order.paymentStatus === 'failed' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {order.paymentStatus || 'pending'}
                        </span>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Pagination */}
      {totalOrders > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalOrders}
          limit={ITEMS_PER_PAGE}
          itemLabel="orders"
          onPageChange={handlePageChange}
        />
      )}

      {/* Tracking Modal */}
      {showTrackModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-xl font-bold text-primary-brown">Shipment Tracking</h3>
              <button onClick={() => setShowTrackModal(false)} className="text-gray-400 hover:text-gray-600"><FiX size={24} /></button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {loadingTracking ? (
                <div className="flex flex-col items-center justify-center py-12">
                   <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-red mb-4"></div>
                   <p className="text-gray-500 font-medium">Fetching live status...</p>
                </div>
              ) : trackingInfo ? (
                <div className="space-y-6">
                  {/* Current Status */}
                  <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl border border-green-100">
                    <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white">
                      <FiTruck size={24} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-green-600 uppercase">Current Status</p>
                      <h4 className="text-lg font-black text-green-900">{trackingInfo.currentStatus}</h4>
                      {trackingInfo.estimatedDelivery && <p className="text-xs text-green-700">Estimated Delivery: {trackingInfo.estimatedDelivery}</p>}
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="space-y-4">
                     <h5 className="text-sm font-bold text-gray-700 uppercase tracking-widest">Tracking Timeline</h5>
                     <div className="relative pl-6 space-y-6">
                        {/* Vertical Line */}
                        <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gray-200"></div>
                        
                        {trackingInfo.timeline.map((event: any, i: number) => (
                           <div key={i} className="relative">
                              {/* Dot */}
                              <div className={`absolute -left-[23px] top-1.5 w-3 h-3 rounded-full border-2 bg-white ${i === 0 ? 'border-primary-red' : 'border-gray-300'}`}></div>
                              <div>
                                 <p className={`text-sm font-bold ${i === 0 ? 'text-primary-brown' : 'text-gray-600'}`}>{event.status}</p>
                                 <p className="text-xs text-gray-500">{event.location}</p>
                                 <p className="text-[10px] text-gray-400 mt-0.5">{event.timestamp}</p>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-500">Tracking information not available.</p>
              )}
            </div>
            <div className="p-6 bg-gray-50 border-t">
              <button onClick={() => setShowTrackModal(false)} className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all">Close</button>
            </div>
          </div>
        </div>
      )}
    </div >
  );
}
