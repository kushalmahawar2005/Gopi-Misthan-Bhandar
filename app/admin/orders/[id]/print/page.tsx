'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface Order {
    _id: string;
    orderNumber: string;
    items: any[];
    shipping: any;
    subtotal: number;
    shippingCost: number;
    total: number;
    paymentMethod: string;
    createdAt: string;
}

export default function OrderPrint() {
    const params = useParams();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrder();
    }, [params.id]);

    const fetchOrder = async () => {
        try {
            const response = await fetch(`/api/orders/${params.id}`);
            const data = await response.json();
            if (data.success) {
                setOrder(data.data);
            }
        } catch (error) {
            console.error('Error fetching order:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (order) {
            setTimeout(() => {
                window.print();
            }, 500);
        }
    }, [order]);

    if (loading) return <div>Loading receipt...</div>;
    if (!order) return <div>Order not found</div>;

    return (
        <div className="bg-white p-8 max-w-2xl mx-auto text-black font-mono text-sm leading-relaxed receipt-container">
            <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .receipt-container, .receipt-container * {
            visibility: visible;
          }
          .receipt-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 10px;
          }
          @page {
            margin: 0;
            size: auto;
          }
        }
      `}</style>

            {/* Header */}
            <div className="text-center mb-6 border-b pb-4 border-dashed border-gray-400">
                <h1 className="text-2xl font-bold uppercase mb-1">Gopi Misthan Bhandar</h1>
                <p>Neemuch, Madhya Pradesh</p>
                <p>Phone: +91 77468 83645</p>
                <p className="mt-2 text-xs">GSTIN: 23ABCDE1234F1Z5</p>
            </div>

            {/* Order Info */}
            <div className="mb-4">
                <div className="flex justify-between">
                    <span>Order #:</span>
                    <span className="font-bold">{order.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{new Date(order.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                    <span>Payment:</span>
                    <span className="uppercase">{order.paymentMethod}</span>
                </div>
            </div>

            <div className="border-b border-dashed border-gray-400 my-2"></div>

            {/* Customer Info */}
            <div className="mb-4">
                <p className="font-bold mb-1">Customer:</p>
                <p>{order.shipping.name}</p>
                <p>{order.shipping.phone}</p>
                <p>{order.shipping.street}, {order.shipping.city} - {order.shipping.zipCode}</p>
            </div>

            <div className="border-b border-dashed border-gray-400 my-2"></div>

            {/* Items */}
            <table className="w-full text-left mb-4">
                <thead>
                    <tr className="border-b border-gray-300">
                        <th className="py-1 w-1/2">Item</th>
                        <th className="py-1 text-center">Qty</th>
                        <th className="py-1 text-right">Price</th>
                    </tr>
                </thead>
                <tbody>
                    {order.items.map((item, idx) => (
                        <tr key={idx}>
                            <td className="py-1 pr-2 align-top">
                                <div className="font-medium">{item.name}</div>
                                {item.weight && <div className="text-xs text-gray-500">{item.weight}</div>}
                            </td>
                            <td className="py-1 text-center align-top">{item.quantity}</td>
                            <td className="py-1 text-right align-top">₹{(item.price * item.quantity).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="border-b border-dashed border-gray-400 my-2"></div>

            {/* Totals */}
            <div className="space-y-1 text-right">
                <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{order.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span>₹{order.shippingCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-dashed border-gray-400 pt-2 mt-2">
                    <span>Total:</span>
                    <span>₹{order.total.toLocaleString()}</span>
                </div>
            </div>

            <div className="text-center mt-8 text-xs">
                <p>*** Thank You for Visiting! ***</p>
                <p>Visit us at www.gopimisthanbhandar.com</p>
            </div>
        </div>
    );
}
