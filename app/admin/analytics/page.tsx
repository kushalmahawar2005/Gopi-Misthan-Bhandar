'use client';

import React, { useState, useEffect } from 'react';
import {
  FiTrendingUp,
  FiDollarSign,
  FiShoppingBag,
  FiUsers,
  FiPackage,
  FiCalendar,
} from 'react-icons/fi';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Explicit label props interface to avoid unknown
interface PieLabelProps {
  name?: string;
  percent?: number;
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  value?: number;
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    avgOrderValue: 0,
    todayRevenue: 0,
    todayOrders: 0,
    thisMonthRevenue: 0,
    thisMonthOrders: 0,
  });
  const [revenueData, setRevenueData] = useState<{ date: string; revenue: number; orders: number }[]>([]);
  const [orderData, setOrderData] = useState<{ date: string; revenue: number; orders: number }[]>([]);
  const [categoryData, setCategoryData] = useState<{ name: string; value: number }[]>([]);
  const [paymentMethodData, setPaymentMethodData] = useState<{ name: string; value: number }[]>([]);
  const [topProducts, setTopProducts] = useState<{ name: string; quantity: number; revenue: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30'); // days

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      const [ordersRes, usersRes, productsRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/users'),
        fetch('/api/products'),
      ]);

      const ordersData = await ordersRes.json();
      const usersData = await usersRes.json();
      const productsData = await productsRes.json();

      const orders: any[] = ordersData.data || [];
      const users: any[] = usersData.data || [];
      const products: any[] = productsData.data || [];

      const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
      const today = new Date().toISOString().split('T')[0];
      const todayOrders = orders.filter((o) => o.createdAt?.startsWith(today));
      const todayRevenue = todayOrders.reduce((sum, order) => sum + (order.total || 0), 0);

      const thisMonth = new Date();
      thisMonth.setDate(1);
      const thisMonthOrders = orders.filter((o) => new Date(o.createdAt) >= thisMonth);
      const thisMonthRevenue = thisMonthOrders.reduce((sum, order) => sum + (order.total || 0), 0);

      // Chart data init
      const days = parseInt(timeRange);
      const chartData: Record<string, { date: string; revenue: number; orders: number }> = {};
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const key = date.toISOString().split('T')[0];
        chartData[key] = {
          date: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
          revenue: 0,
          orders: 0,
        };
      }

      orders.forEach((order) => {
        const key = new Date(order.createdAt).toISOString().split('T')[0];
        if (chartData[key]) {
          chartData[key].revenue += order.total || 0;
          chartData[key].orders += 1;
        }
      });

      const revenueChartData = Object.values(chartData);
      const orderChartData = Object.values(chartData);

      // Category revenue
      const categoryRevenue: Record<string, number> = {};
      orders.forEach((order) =>
        order.items?.forEach((item: any) => {
          const cat = item.category || 'Unknown';
            // Ensure price & quantity numbers
          const price = Number(item.price) || 0;
          const qty = Number(item.quantity) || 0;
          categoryRevenue[cat] = (categoryRevenue[cat] || 0) + price * qty;
        })
      );
      const categoryChartData = Object.entries(categoryRevenue).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value: Math.round(value),
      }));

      // Payment methods
      const paymentMethods: Record<string, number> = {};
      orders.forEach((order) => {
        const method = (order.paymentMethod || 'COD').toUpperCase();
        paymentMethods[method] = (paymentMethods[method] || 0) + 1;
      });
      const paymentChartData = Object.entries(paymentMethods).map(([name, value]) => ({ name, value }));

      // Top products
      const productSales: Record<
        string,
        { name: string; quantity: number; revenue: number }
      > = {};
      orders.forEach((order) =>
        order.items?.forEach((item: any) => {
          const id = item.productId || item._id || item.name;
          if (!productSales[id]) {
            productSales[id] = { name: item.name, quantity: 0, revenue: 0 };
          }
          const price = Number(item.price) || 0;
          const qty = Number(item.quantity) || 0;
          productSales[id].quantity += qty;
          productSales[id].revenue += price * qty;
        })
      );
      const topProductsData = Object.values(productSales)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 10);

      setRevenueData(revenueChartData);
      setOrderData(orderChartData);
      setCategoryData(categoryChartData);
      setPaymentMethodData(paymentChartData);
      setTopProducts(topProductsData);
      setStats({
        totalRevenue,
        totalOrders: orders.length,
        totalUsers: users.length,
        totalProducts: products.length,
        avgOrderValue: orders.length ? totalRevenue / orders.length : 0,
        todayRevenue,
        todayOrders: todayOrders.length,
        thisMonthRevenue,
        thisMonthOrders: thisMonthOrders.length,
      });
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-red mx-auto mb-4" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: FiDollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Total Orders',
      value: stats.totalOrders.toLocaleString(),
      icon: FiShoppingBag,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: FiUsers,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Total Products',
      value: stats.totalProducts.toLocaleString(),
      icon: FiPackage,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      label: 'Avg Order Value',
      value: `₹${Math.round(stats.avgOrderValue).toLocaleString()}`,
      icon: FiTrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      label: "Today's Revenue",
      value: `₹${stats.todayRevenue.toLocaleString()}`,
      icon: FiCalendar,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
    },
    {
      label: "Today's Orders",
      value: stats.todayOrders.toLocaleString(),
      icon: FiShoppingBag,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
    },
    {
      label: "This Month's Revenue",
      value: `₹${stats.thisMonthRevenue.toLocaleString()}`,
      icon: FiDollarSign,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary-brown font-serif">Analytics</h1>
          <p className="text-gray-600 mt-1">View your store's performance metrics</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red bg-white"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className={`${card.bgColor} rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow`}
            >
              <div className="flex items-center justify-between mb-4">
                <Icon className={card.color} size={24} />
              </div>
              <p className="text-3xl font-bold text-primary-brown mb-1">{card.value}</p>
              <p className="text-sm text-gray-600">{card.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-primary-brown font-serif mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip
                formatter={(val: number) => `₹${val.toLocaleString()}`}
                contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#ba0606"
                strokeWidth={2}
                name="Revenue"
                dot={{ fill: '#ba0606', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-primary-brown font-serif mb-4">Order Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={orderData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Legend />
                <Bar dataKey="orders" fill="#ba0606" name="Orders" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-primary-brown font-serif mb-4">Revenue by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(p: any) => {
                  const props = p as PieLabelProps;
                  const percent = typeof props.percent === 'number' ? props.percent : 0;
                  const name = props.name ?? '';
                  return `${name} ${Math.round(percent * 100)}%`;
                }}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((_, idx) => {
                  const colors = ['#ba0606', '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7'];
                  return <Cell key={idx} fill={colors[idx % colors.length]} />;
                })}
              </Pie>
              <Tooltip formatter={(val: number) => `₹${val.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-primary-brown font-serif mb-4">Payment Methods</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={paymentMethodData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(p: any) => {
                  const props = p as PieLabelProps;
                  const percent = typeof props.percent === 'number' ? props.percent : 0;
                  const name = props.name ?? '';
                  return `${name} ${Math.round(percent * 100)}%`;
                }}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {paymentMethodData.map((_, idx) => {
                  const colors = ['#ba0606', '#4ecdc4', '#f9ca24'];
                  return <Cell key={idx} fill={colors[idx % colors.length]} />;
                })}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {topProducts.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-primary-brown font-serif mb-4">Top Selling Products</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity Sold</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {topProducts.map((p, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-primary-brown">{p.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{p.quantity}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-primary-red">
                      ₹{p.revenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}