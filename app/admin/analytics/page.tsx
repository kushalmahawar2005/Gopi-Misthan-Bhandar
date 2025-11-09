'use client';

import React, { useState, useEffect } from 'react';
import { FiTrendingUp, FiDollarSign, FiShoppingBag, FiUsers, FiPackage, FiCalendar } from 'react-icons/fi';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [orderData, setOrderData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [paymentMethodData, setPaymentMethodData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30'); // days

  useEffect(() => {
    fetchAnalytics();
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

      const orders = ordersData.data || [];
      const users = usersData.data || [];
      const products = productsData.data || [];

      const totalRevenue = orders.reduce((sum: number, order: any) => sum + order.total, 0);
      const today = new Date().toISOString().split('T')[0];
      const todayOrders = orders.filter((order: any) => order.createdAt?.startsWith(today));
      const todayRevenue = todayOrders.reduce((sum: number, order: any) => sum + order.total, 0);

      const thisMonth = new Date();
      thisMonth.setDate(1);
      const thisMonthOrders = orders.filter((order: any) => new Date(order.createdAt) >= thisMonth);
      const thisMonthRevenue = thisMonthOrders.reduce((sum: number, order: any) => sum + order.total, 0);

      // Prepare chart data
      const days = parseInt(timeRange);
      const chartData: { [key: string]: { date: string; revenue: number; orders: number } } = {};
      
      // Initialize all days
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        chartData[dateStr] = { date: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }), revenue: 0, orders: 0 };
      }

      // Fill in actual data
      orders.forEach((order: any) => {
        const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
        if (chartData[orderDate]) {
          chartData[orderDate].revenue += order.total;
          chartData[orderDate].orders += 1;
        }
      });

      const revenueChartData = Object.values(chartData);
      const orderChartData = Object.values(chartData);

      // Category-wise revenue
      const categoryRevenue: { [key: string]: number } = {};
      orders.forEach((order: any) => {
        order.items?.forEach((item: any) => {
          const category = item.category || 'unknown';
          categoryRevenue[category] = (categoryRevenue[category] || 0) + (item.price * item.quantity);
        });
      });
      const categoryChartData = Object.entries(categoryRevenue).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value: Math.round(value),
      }));

      // Payment method distribution
      const paymentMethods: { [key: string]: number } = {};
      orders.forEach((order: any) => {
        const method = order.paymentMethod || 'cod';
        paymentMethods[method] = (paymentMethods[method] || 0) + 1;
      });
      const paymentChartData = Object.entries(paymentMethods).map(([name, value]) => ({
        name: name.toUpperCase(),
        value,
      }));

      // Top selling products
      const productSales: { [key: string]: { name: string; quantity: number; revenue: number } } = {};
      orders.forEach((order: any) => {
        order.items?.forEach((item: any) => {
          if (!productSales[item.productId]) {
            productSales[item.productId] = {
              name: item.name,
              quantity: 0,
              revenue: 0,
            };
          }
          productSales[item.productId].quantity += item.quantity;
          productSales[item.productId].revenue += item.price * item.quantity;
        });
      });
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
        avgOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
        todayRevenue,
        todayOrders: todayOrders.length,
        thisMonthRevenue,
        thisMonthOrders: thisMonthOrders.length,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-red mx-auto mb-4"></div>
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
      value: stats.totalOrders,
      icon: FiShoppingBag,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Total Users',
      value: stats.totalUsers,
      icon: FiUsers,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Total Products',
      value: stats.totalProducts,
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
      value: stats.todayOrders,
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
      {/* Header */}
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-primary-brown font-serif mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value: any) => `₹${value.toLocaleString()}`}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
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
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
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
                label={({ name, percent }) => `${name} ${((percent as number) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => {
                  const colors = ['#ba0606', '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7'];
                  return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                })}
              </Pie>
              <Tooltip formatter={(value: any) => `₹${value.toLocaleString()}`} />
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
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {paymentMethodData.map((entry, index) => {
                  const colors = ['#ba0606', '#4ecdc4', '#f9ca24'];
                  return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                })}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products */}
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
                {topProducts.map((product, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-primary-brown">{product.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{product.quantity}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-primary-red">₹{product.revenue.toLocaleString()}</td>
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

